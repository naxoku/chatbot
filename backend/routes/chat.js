/**
 * Rutas de chat y procesamiento de mensajes.
 * Maneja streaming SSE, respuestas del bot y generación de mapas mentales.
 */

const express = require("express");
const { nanoid } = require("nanoid");
const { db, queryWithRetry } = require("../db");
const requireLogin = require("../middleware/auth");
const { normalizeMessages } = require("../middleware/normalizeMessages");
const { logger } = require("../logger");

const router = express.Router();

const MAX_REFERENCES = 12;

const safeJsonParse = (value) => {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeTextValue = (value) => String(value || "").trim();

const inferFileType = (value = "") => {
  const lower = String(value).toLowerCase();
  if (lower.includes(".pdf")) return "pdf";
  if (lower.includes(".doc") || lower.includes(".docx")) return "docx";
  if (lower.includes(".xls") || lower.includes(".xlsx") || lower.includes(".csv")) {
    return "xlsx";
  }
  if (lower.includes(".txt") || lower.includes(".md")) return "txt";
  if (
    lower.includes(".png") ||
    lower.includes(".jpg") ||
    lower.includes(".jpeg") ||
    lower.includes(".webp") ||
    lower.includes(".gif")
  ) {
    return "img";
  }
  return "other";
};

const normalizeQuote = (text) => {
  const cleaned = String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\\n/g, " ")
    .trim();
  if (!cleaned) return "";
  return cleaned.length > 420 ? `${cleaned.slice(0, 417)}...` : cleaned;
};

const toReferenceDocument = (doc = {}, fallbackTitle = "Documento consultado") => {
  const sourceName =
    doc.title ||
    doc.file_name ||
    doc.fileName ||
    doc.name ||
    doc.filename ||
    doc.file_id ||
    doc.doc_id ||
    doc.source;

  const title =
    normalizeTextValue(sourceName) || normalizeTextValue(fallbackTitle);

  const docId =
    normalizeTextValue(doc.id) ||
    normalizeTextValue(doc.doc_id) ||
    normalizeTextValue(doc.file_id) ||
    normalizeTextValue(doc.url) ||
    `${title.toLowerCase().replace(/\s+/g, "-")}-${nanoid(6)}`;

  const docUrl = normalizeTextValue(doc.url);
  const docType = normalizeTextValue(doc.type) || inferFileType(title || docUrl || "");
  const docCategory = normalizeTextValue(doc.category) || "Citas recuperadas";

  return {
    id: docId,
    title,
    type: docType,
    category: docCategory,
    ...(docUrl && { url: docUrl }),
  };
};

const extractObservationEntries = (observation) => {
  if (!observation) return [];

  if (Array.isArray(observation)) return observation;

  if (typeof observation === "object") {
    if (Array.isArray(observation.response)) return observation.response;
    if (Array.isArray(observation.results)) return observation.results;
    return [observation];
  }

  if (typeof observation === "string") {
    const parsed = safeJsonParse(observation);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") return [parsed];
  }

  return [];
};

const extractReferencesFromIntermediateSteps = (steps = []) => {
  const references = [];
  const seen = new Set();

  for (const step of steps) {
    const action = step?.action || {};
    const queryInput = action?.toolInput?.input || "Consulta documental";
    const entries = extractObservationEntries(step?.observation);

    for (const entry of entries) {
      let payload = entry;

      if (entry?.text && typeof entry.text === "string") {
        const parsedText = safeJsonParse(entry.text);
        if (parsedText && typeof parsedText === "object") payload = parsedText;
      }

      const pageContent = payload?.pageContent || payload?.content || payload?.text;
      const quote = normalizeQuote(pageContent);
      if (!quote) continue;

      const metadata = payload?.metadata || {};
      const document = toReferenceDocument(metadata, `Resultado: ${queryInput}`);
      const lineFrom = metadata?.loc?.lines?.from || payload?.loc?.lines?.from || "";
      const lineTo = metadata?.loc?.lines?.to || payload?.loc?.lines?.to || "";
      const dedupeDocId =
        normalizeTextValue(document.id) ||
        normalizeTextValue(document.url) ||
        normalizeTextValue(document.title).toLowerCase();
      const key = `${dedupeDocId}|${lineFrom}|${lineTo}|${quote.toLowerCase()}`;

      if (seen.has(key)) continue;
      seen.add(key);

      references.push({
        id: nanoid(),
        document,
        quote,
        sourceTool: action?.tool || "tool",
      });

      if (references.length >= MAX_REFERENCES) return references;
    }
  }

  return references;
};

const normalizeStructuredReferences = (rawReferences = []) => {
  if (!Array.isArray(rawReferences)) return [];

  const normalized = [];
  const seen = new Set();

  for (const item of rawReferences) {
    if (!item || typeof item !== "object") continue;

    const quote = normalizeQuote(item.quote || item.cita || item.pageContent || "");
    if (!quote) continue;

    const document = toReferenceDocument(
      item.document || item.documento || item.metadata || {},
      "Documento consultado",
    );

    const key = `${normalizeTextValue(document.id)}|${quote.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    normalized.push({
      id: normalizeTextValue(item.id) || nanoid(),
      document,
      quote,
    });

    if (normalized.length >= MAX_REFERENCES) break;
  }

  return normalized;
};

// Normaliza la respuesta del servicio de chatbot.
function normalizeChatbotResponse(data) {
  let respuesta =
    data?.respuesta ||
    data?.output?.respuesta ||
    "No hay respuesta disponible.";

  let documentos =
    data?.documentosRecomendados || data?.output?.documentosRecomendados || [];

  // Filtrar solo documentos válidos
  documentos = documentos.filter(
    (d) =>
      d &&
      d.title &&
      d.url &&
      d.description &&
      typeof d.title === "string" &&
      typeof d.url === "string",
  );

  // Eliminar duplicados (por título o URL)
  const unique = new Map();
  for (const doc of documentos) {
    const key = doc.url || doc.title;
    if (!unique.has(key)) unique.set(key, doc);
  }

  let references =
    data?.references || data?.output?.references || data?.output?.referencias || [];

  references = normalizeStructuredReferences(references);

  if (references.length === 0 && Array.isArray(data?.intermediateSteps)) {
    references = extractReferencesFromIntermediateSteps(data.intermediateSteps);
  }

  return {
    respuesta,
    documentosRecomendados: Array.from(unique.values()),
    references,
  };
}

// Configurar headers para SSE
const setupSSEHeaders = (res, origin) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": origin || "http://localhost:8080",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Cache-Control, Content-Type",
  });
};

// Enviar evento SSE
const sendSSEEvent = (res, eventName, data) => {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

// Procesar stream de n8n
const processN8nStream = async (reader, onChunk) => {
  const decoder = new TextDecoder();
  let accumulatedText = "";
  let buffer = "";
  const streamMeta = {
    references: [],
    documentosRecomendados: [],
    intermediateSteps: [],
    output: null,
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        try {
          const data = JSON.parse(trimmedLine);

          if (data.type === "item" && data.content) {
            accumulatedText += data.content;
            onChunk(data.content, accumulatedText);
          } else {
            if (Array.isArray(data.references)) {
              streamMeta.references.push(...data.references);
            }

            if (Array.isArray(data.documentosRecomendados)) {
              streamMeta.documentosRecomendados.push(...data.documentosRecomendados);
            }

            if (Array.isArray(data.intermediateSteps)) {
              streamMeta.intermediateSteps.push(...data.intermediateSteps);
            }

            if (data.output && typeof data.output === "object") {
              streamMeta.output = data.output;
            }

            if (data.type === "end") {
              return {
                respuesta: accumulatedText || "Respuesta completada",
                streamMeta,
              };
            }
          }
        } catch {
          continue;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    respuesta: accumulatedText || "No hay respuesta disponible.",
    streamMeta,
  };
};

// Crear mensajes para la conversación
const createConversationMessages = (
  pregunta,
  respuesta,
  documentos,
  references,
  quotedData,
) => {
  const userMessage = {
    id: nanoid(),
    sender: "user",
    content: pregunta,
    timestamp: new Date().toISOString(),
    ...(quotedData?.quotedMessageId && {
      quotedMessageId: quotedData.quotedMessageId,
      quotedMessageContent: quotedData.quotedMessageContent,
      quotedMessageSender: quotedData.quotedMessageSender || "bot",
    }),
  };

  const botMessage = {
    id: nanoid(),
    sender: "bot",
    content: respuesta,
    timestamp: new Date().toISOString(),
    documentos,
    references,
  };

  return { userMessage, botMessage };
};

// Crear conversación vacía para obtener ID (para memoria de n8n)
const createEmptyConversation = async (userId, pregunta) => {
  const titulo =
    pregunta.substring(0, 50) + (pregunta.length > 50 ? "..." : "");
  const result = await db.query(
    "INSERT INTO conversaciones (usuario_id, titulo, chat_history, mapas_mentales_ids) VALUES ($1, $2, $3, $4) RETURNING id",
    [userId, titulo, JSON.stringify([]), JSON.stringify([])],
  );
  return result.rows[0].id;
};

// Actualizar o crear conversación en BD
const saveConversationMessages = async (
  conversacionId,
  userId,
  userMessage,
  botMessage,
  pregunta,
) => {
  if (conversacionId) {
    const result = await db.query(
      "SELECT chat_history FROM conversaciones WHERE id = $1 AND usuario_id = $2",
      [conversacionId, userId],
    );

    if (result.rows.length > 0) {
      let chatHistory = normalizeMessages(result.rows[0].chat_history || []);
      chatHistory.push(userMessage, botMessage);

      await db.query(
        "UPDATE conversaciones SET chat_history = $1 WHERE id = $2",
        [JSON.stringify(chatHistory), conversacionId],
      );

      logger.info({ conversacionId }, "Stream - Conversación actualizada");
      return conversacionId;
    }
  }

  // Crear nueva conversación (fallback si no existe el ID)
  const titulo =
    pregunta.substring(0, 50) + (pregunta.length > 50 ? "..." : "");
  const nuevoChatHistory = [userMessage, botMessage];

  const newResult = await db.query(
    "INSERT INTO conversaciones (usuario_id, titulo, chat_history, mapas_mentales_ids) VALUES ($1, $2, $3, $4) RETURNING id",
    [userId, titulo, JSON.stringify(nuevoChatHistory), JSON.stringify([])],
  );

  const newId = newResult.rows[0].id;
  logger.info({ conversacionId: newId }, "Stream - Nueva conversación creada");
  return newId;
};

// Endpoint de chat con streaming Server-Sent Events.
router.post("/stream", requireLogin, async (req, res) => {
  const {
    pregunta,
    conversacionId,
    documentosSeleccionados,
    quotedMessageContent,
    quotedMessageSender,
  } = req.body;
  logger.debug(
    {
      pregunta,
      conversacionId,
      docsCount: documentosSeleccionados?.length || 0,
      hasQuotedMessage: !!quotedMessageContent,
    },
    "Stream - Solicitud recibida",
  );

  setupSSEHeaders(res, req.headers.origin);

  const sendEvent = (eventName, data) => sendSSEEvent(res, eventName, data);
  const closeConnection = () => res.end();

  try {
    sendEvent("start", { status: "iniciando respuesta" });

    // Si no hay conversacionId, crear una nueva conversación ANTES de enviar a n8n
    // Esto garantiza que cada conversación tenga un ID único para la memoria
    let effectiveConversacionId = conversacionId;
    if (!conversacionId) {
      effectiveConversacionId = await createEmptyConversation(
        req.session.user.id,
        pregunta,
      );
      logger.info(
        { conversacionId: effectiveConversacionId },
        "Stream - Conversación pre-creada para memoria",
      );
    }

    // Construir la pregunta incluyendo el contexto del mensaje citado si existe
    let preguntaConContexto = pregunta;
    if (quotedMessageContent && quotedMessageContent.trim()) {
      const senderLabel =
        quotedMessageSender === "user" ? "Usuario" : "Asistente";
      preguntaConContexto = `[Contexto del mensaje citado (${senderLabel}):\n"${quotedMessageContent.trim()}"]\n\nSolicitud del usuario: ${pregunta}`;
      logger.info(
        { quotedContentLength: quotedMessageContent.length },
        "Stream - Mensaje citado incluido en contexto",
      );
    }

    const n8nRequestBody = {
      user_id: req.session.user.usuario,
      conversation_id: effectiveConversacionId.toString(),
      pregunta: preguntaConContexto,
      documentosSeleccionados: documentosSeleccionados || [],
    };

    logger.debug({ n8nRequestBody }, "Enviando a n8n");

    const n8nResponse = await fetch(
      "https://skynet.uct.cl/webhook/chat-streaming",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nRequestBody),
      },
    );

    logger.info({ status: n8nResponse.status }, "Stream - Status Skynet");

    if (!n8nResponse.ok) {
      sendEvent("error", { message: "Error al contactar con el asistente" });
      closeConnection();
      return;
    }

    try {
      const reader = n8nResponse.body.getReader();

      const streamResult = await processN8nStream(
        reader,
        (textChunk, fullText) => {
          sendEvent("chunk", { text: textChunk, fullText });
        },
      );

      const normalizedResponse = normalizeChatbotResponse({
        respuesta: streamResult.respuesta,
        documentosRecomendados: streamResult.streamMeta.documentosRecomendados,
        references: streamResult.streamMeta.references,
        intermediateSteps: streamResult.streamMeta.intermediateSteps,
        output: streamResult.streamMeta.output,
      });

      const normalizedDocs = normalizedResponse.documentosRecomendados;
      const normalizedReferences = normalizedResponse.references;
      const finalResponse = normalizedResponse.respuesta;

      const quotedData = {
        quotedMessageId: req.body.quotedMessageId,
        quotedMessageContent: req.body.quotedMessageContent,
        quotedMessageSender: req.body.quotedMessageSender,
      };

      const { userMessage, botMessage } = createConversationMessages(
        pregunta,
        finalResponse,
        normalizedDocs,
        normalizedReferences,
        quotedData,
      );

      // Usar effectiveConversacionId que ya tiene el ID correcto
      const finalConversacionId = await saveConversationMessages(
        effectiveConversacionId,
        req.session.user.id,
        userMessage,
        botMessage,
        pregunta,
      );

      sendEvent("complete", {
        respuesta: finalResponse,
        documentosRecomendados: normalizedDocs,
        references: normalizedReferences,
        conversacionId: finalConversacionId,
      });
    } catch (streamError) {
      logger.error({ err: streamError }, "Error en stream");
      sendEvent("error", {
        message: "Error al procesar la respuesta del asistente",
        details: streamError.message,
      });
    }
  } catch (err) {
    logger.error({ err }, "Error en stream");
    sendEvent("error", {
      message: "Error interno al procesar respuesta. Intente nuevamente.",
      details: err.message,
    });
  } finally {
    closeConnection();
  }
});

// Endpoint de depuración para verificar estado de la sesión y request.
router.post("/debug", (req, res) => {
  logger.debug("Debug endpoint llamado");

  res.json({
    message: "Debug successful",
    sessionUser: req.session?.user,
    requestBody: req.body,
    headers: req.headers,
  });
});

// Endpoint de chat estándar sin streaming.
router.post("/", requireLogin, async (req, res) => {
  const { pregunta, conversacionId, documentosSeleccionados } = req.body;
  logger.debug(
    {
      pregunta,
      conversacionId,
      docsCount: documentosSeleccionados?.length || 0,
    },
    "Chat normal - Solicitud recibida",
  );

  try {
    // Si no hay conversacionId, crear una nueva conversación ANTES de enviar a n8n
    let effectiveConversacionId = conversacionId;
    if (!conversacionId) {
      effectiveConversacionId = await createEmptyConversation(
        req.session.user.id,
        pregunta,
      );
      logger.info(
        { conversacionId: effectiveConversacionId },
        "Chat normal - Conversación pre-creada para memoria",
      );
    }

    // Preparar request body para n8n
    const n8nRequestBody = {
      user_id: req.session.user.usuario,
      conversation_id: effectiveConversacionId.toString(),
      pregunta,
      documentosSeleccionados: documentosSeleccionados || [],
    };

    logger.debug({ n8nRequestBody }, "Enviando a n8n (chat normal)");

    const response = await fetch(
      "https://skynet.uct.cl/webhook/chat-streaming",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nRequestBody),
      },
    );

    logger.info({ status: response.status }, "Status Skynet (Chat normal)");

    const data = await response.json();
    logger.debug({ data }, "Data recibida (Semantic Search)");

    // Normalizar respuesta del chatbot
    const { respuesta, documentosRecomendados, references } =
      normalizeChatbotResponse(data);

    // Crear mensajes normalizados
    const nuevoMensaje = {
      id: nanoid(),
      sender: "user",
      content: pregunta,
      timestamp: new Date().toISOString(),
      ...(req.body.quotedMessageId && {
        quotedMessageId: req.body.quotedMessageId,
        quotedMessageContent: req.body.quotedMessageContent,
        quotedMessageSender: req.body.quotedMessageSender || "bot",
      }),
    };

    const nuevaRespuesta = {
      id: nanoid(),
      sender: "bot",
      content: respuesta,
      timestamp: new Date().toISOString(),
      documentos: documentosRecomendados || [],
      references: references || [],
    };

    // Siempre tenemos effectiveConversacionId (ya sea el original o el pre-creado)
    const result = await db.query(
      "SELECT chat_history FROM conversaciones WHERE id = $1 AND usuario_id = $2",
      [effectiveConversacionId, req.session.user.id],
    );

    if (result.rows.length > 0) {
      let chatHistory = result.rows[0].chat_history || [];

      chatHistory = normalizeMessages(chatHistory);
      chatHistory.push(nuevoMensaje, nuevaRespuesta);

      await db.query(
        "UPDATE conversaciones SET chat_history = $1 WHERE id = $2",
        [JSON.stringify(chatHistory), effectiveConversacionId],
      );

      logger.info(
        { conversacionId: effectiveConversacionId },
        "Conversación actualizada",
      );
      return res.json({
        respuesta,
        documentosRecomendados,
        references,
        conversacionId: effectiveConversacionId,
      });
    }

    // Fallback: crear nueva conversación si por alguna razón no existe
    const titulo =
      pregunta.substring(0, 50) + (pregunta.length > 50 ? "..." : "");
    const nuevoChatHistory = [nuevoMensaje, nuevaRespuesta];

    const newResult = await db.query(
      "INSERT INTO conversaciones (usuario_id, titulo, chat_history, mapas_mentales_ids) VALUES ($1, $2, $3, $4) RETURNING id",
      [
        req.session.user.id,
        titulo,
        JSON.stringify(nuevoChatHistory),
        JSON.stringify([]),
      ],
    );

    const newConversacionId = newResult.rows[0].id;
    logger.info(
      { conversacionId: newConversacionId },
      "Nueva conversación creada (fallback)",
    );

    res.json({
      respuesta,
      documentosRecomendados,
      references,
      conversacionId: newConversacionId,
    });
  } catch (err) {
    logger.error({ err: err.message }, "Error en chat");
    res.status(500).json({ respuesta: "Error al contactar con el asistente." });
  }
});

// Genera y almacena mapas mentales basados en el contexto de una conversación.
router.post("/mapa-mental", requireLogin, async (req, res) => {
  const { contexto, titulo, conversacionId } = req.body;
  logger.info(
    { contextoLength: contexto?.length },
    "Contexto recibido para mapa mental",
  );
  logger.info({ conversacionId }, "ID de conversación para asociar mapa");

  if (!conversacionId) {
    return res.status(400).json({
      error:
        "El ID de la conversación es obligatorio para crear un mapa mental.",
    });
  }

  if (!contexto || contexto.trim().length < 50) {
    return res.status(400).json({
      error:
        "El contexto debe tener al menos 50 caracteres para generar un mapa mental.",
    });
  }

  try {
    const response = await fetch("https://skynet.uct.cl/webhook/mapa-mental", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contexto }),
    });

    logger.info(
      { status: response.status },
      "Status respuesta Skynet mapa mental",
    );

    if (!response.ok) {
      logger.error(
        { status: response.status },
        "Error HTTP de Skynet en mapa mental",
      );
      return res.status(502).json({
        error:
          "Error al comunicarse con el servicio de generación de mapas mentales",
      });
    }

    // Leer la respuesta como texto primero para poder debuggear si hay errores
    const responseText = await response.text();
    logger.debug(
      { responseTextLength: responseText.length },
      "Respuesta raw de Skynet",
    );

    if (!responseText || responseText.trim().length === 0) {
      logger.error("Respuesta vacía de Skynet para mapa mental");
      return res.status(502).json({
        error:
          "El servicio de generación de mapas mentales devolvió una respuesta vacía. Intenta de nuevo.",
      });
    }

    let cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^\s*/, '')
      .replace(/\s*$/, '')
      .trim();

    let data;
    try {
      data = JSON.parse(cleanedResponse);
    } catch (parseError) {
      logger.error(
        {
          err: parseError.message,
          responseText: responseText.substring(0, 500),
          cleanedResponse: cleanedResponse.substring(0, 500),
        },
        "Error parseando JSON de Skynet",
      );
      return res.status(502).json({
        error:
          "La respuesta del servicio de mapas mentales no es válida. Intenta de nuevo.",
      });
    }

    logger.info(
      { dataLength: JSON.stringify(data).length },
      "Data recibida mapa mental",
    );

    // Normalizar formato n8n: puede venir como array y/o con respuesta anidada.
    const payload = Array.isArray(data) ? data[0] : data;
    let respuestaData = payload?.respuesta;
    while (respuestaData?.respuesta) {
      respuestaData = respuestaData.respuesta;
    }

    const mapaMental = {
      titulo: respuestaData?.titulo || "Mapa mental sin título",
      mensaje: respuestaData?.mensaje || "",
      estructura_json: respuestaData || {},
    };

    // Guardar mapa mental
    const finalTitulo = titulo || mapaMental.titulo || "Mapa mental sin título";
    const result = await db.query(
      `INSERT INTO mapas_mentales (usuario_id, titulo, contexto, estructura_json, conversacion_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, fecha_creacion`,
      [
        req.session.user.id,
        finalTitulo,
        contexto,
        JSON.stringify(mapaMental.estructura_json),
        conversacionId,
      ],
    );

    const nuevoMapaId = result.rows[0].id;
    logger.info({ nuevoMapaId }, "Mapa mental guardado");

    // Asociar mapa mental a la conversación
    await db.query(
      `UPDATE conversaciones
       SET mapas_mentales_ids = COALESCE(mapas_mentales_ids, '[]'::jsonb) || $1::jsonb
       WHERE id = $2 AND usuario_id = $3`,
      [JSON.stringify([nuevoMapaId]), conversacionId, req.session.user.id],
    );

    logger.info({ conversacionId }, "Mapa asociado a conversación");

    const responseMapaMental = {
      id: nuevoMapaId,
      titulo: finalTitulo,
      estructura_json: mapaMental.estructura_json,
      fecha_creacion: result.rows[0].fecha_creacion,
    };

    res.json({
      mapaMental: responseMapaMental,
      mensaje:
        "Mapa mental guardado y asociado a la conversación correctamente",
    });
  } catch (err) {
    logger.error({ err: err.message }, "Error en mapa mental");
    res.status(500).json({
      error: "Error interno al generar mapa mental. Intente nuevamente.",
      details: err.message,
    });
  }
});

module.exports = router;
