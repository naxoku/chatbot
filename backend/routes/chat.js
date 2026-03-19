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
      typeof d.url === "string"
  );

  // Eliminar duplicados (por título o URL)
  const unique = new Map();
  for (const doc of documentos) {
    const key = doc.url || doc.title;
    if (!unique.has(key)) unique.set(key, doc);
  }

  return {
    respuesta,
    documentosRecomendados: Array.from(unique.values()),
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
          } else if (data.type === "end") {
            return accumulatedText || "Respuesta completada";
          }
        } catch {
          continue;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return accumulatedText || "No hay respuesta disponible.";
};

// Crear mensajes para la conversación
const createConversationMessages = (pregunta, respuesta, documentos, quotedData) => {
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
    feedbackRequested: true,
    documentos,
  };

  return { userMessage, botMessage };
};

// Crear conversación vacía para obtener ID (para memoria de n8n)
const createEmptyConversation = async (userId, pregunta) => {
  const titulo = pregunta.substring(0, 50) + (pregunta.length > 50 ? "..." : "");
  const result = await db.query(
    "INSERT INTO conversaciones (usuario_id, titulo, chat_history, mapas_mentales_ids) VALUES ($1, $2, $3, $4) RETURNING id",
    [userId, titulo, JSON.stringify([]), JSON.stringify([])]
  );
  return result.rows[0].id;
};

// Actualizar o crear conversación en BD
const saveConversationMessages = async (conversacionId, userId, userMessage, botMessage, pregunta) => {
  if (conversacionId) {
    const result = await db.query(
      "SELECT chat_history FROM conversaciones WHERE id = $1 AND usuario_id = $2",
      [conversacionId, userId]
    );

    if (result.rows.length > 0) {
      let chatHistory = normalizeMessages(result.rows[0].chat_history || []);
      chatHistory.push(userMessage, botMessage);

      await db.query("UPDATE conversaciones SET chat_history = $1 WHERE id = $2", [
        JSON.stringify(chatHistory),
        conversacionId,
      ]);

      logger.info({ conversacionId }, "Stream - Conversación actualizada");
      return conversacionId;
    }
  }

  // Crear nueva conversación (fallback si no existe el ID)
  const titulo = pregunta.substring(0, 50) + (pregunta.length > 50 ? "..." : "");
  const nuevoChatHistory = [userMessage, botMessage];

  const newResult = await db.query(
    "INSERT INTO conversaciones (usuario_id, titulo, chat_history, mapas_mentales_ids) VALUES ($1, $2, $3, $4) RETURNING id",
    [userId, titulo, JSON.stringify(nuevoChatHistory), JSON.stringify([])]
  );

  const newId = newResult.rows[0].id;
  logger.info({ conversacionId: newId }, "Stream - Nueva conversación creada");
  return newId;
};

// Endpoint de chat con streaming Server-Sent Events.
router.post("/stream", requireLogin, async (req, res) => {
  const { pregunta, conversacionId, documentosSeleccionados, quotedMessageContent, quotedMessageSender } = req.body;
  logger.debug({ pregunta, conversacionId, docsCount: documentosSeleccionados?.length || 0, hasQuotedMessage: !!quotedMessageContent }, "Stream - Solicitud recibida");

  setupSSEHeaders(res, req.headers.origin);

  const sendEvent = (eventName, data) => sendSSEEvent(res, eventName, data);
  const closeConnection = () => res.end();

  try {
    sendEvent("start", { status: "iniciando respuesta" });

    // Si no hay conversacionId, crear una nueva conversación ANTES de enviar a n8n
    // Esto garantiza que cada conversación tenga un ID único para la memoria
    let effectiveConversacionId = conversacionId;
    if (!conversacionId) {
      effectiveConversacionId = await createEmptyConversation(req.session.user.id, pregunta);
      logger.info({ conversacionId: effectiveConversacionId }, "Stream - Conversación pre-creada para memoria");
    }

    // Construir la pregunta incluyendo el contexto del mensaje citado si existe
    let preguntaConContexto = pregunta;
    if (quotedMessageContent && quotedMessageContent.trim()) {
      const senderLabel = quotedMessageSender === "user" ? "Usuario" : "Asistente";
      preguntaConContexto = `[Contexto del mensaje citado (${senderLabel}):\n"${quotedMessageContent.trim()}"]\n\nSolicitud del usuario: ${pregunta}`;
      logger.info({ quotedContentLength: quotedMessageContent.length }, "Stream - Mensaje citado incluido en contexto");
    }

    const n8nRequestBody = {
      user_id: req.session.user.usuario,
      conversation_id: effectiveConversacionId.toString(),
      pregunta: preguntaConContexto,
      documentosSeleccionados: documentosSeleccionados || [],
    };

    logger.debug({ n8nRequestBody }, "Enviando a n8n");

    const n8nResponse = await fetch("https://skynet.uct.cl/webhook/chat-streaming", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n8nRequestBody),
    });

    logger.info({ status: n8nResponse.status }, "Stream - Status Skynet");

    if (!n8nResponse.ok) {
      sendEvent("error", { message: "Error al contactar con el asistente" });
      closeConnection();
      return;
    }

    try {
      const reader = n8nResponse.body.getReader();
      
      const finalResponse = await processN8nStream(reader, (textChunk, fullText) => {
        sendEvent("chunk", { text: textChunk, fullText });
      });

      const normalizedDocs = normalizeChatbotResponse({
        respuesta: finalResponse,
        documentosRecomendados: [],
      }).documentosRecomendados;

      const quotedData = {
        quotedMessageId: req.body.quotedMessageId,
        quotedMessageContent: req.body.quotedMessageContent,
        quotedMessageSender: req.body.quotedMessageSender,
      };

      const { userMessage, botMessage } = createConversationMessages(
        pregunta,
        finalResponse,
        normalizedDocs,
        quotedData
      );

      // Usar effectiveConversacionId que ya tiene el ID correcto
      const finalConversacionId = await saveConversationMessages(
        effectiveConversacionId,
        req.session.user.id,
        userMessage,
        botMessage,
        pregunta
      );

      sendEvent("complete", {
        respuesta: finalResponse,
        documentosRecomendados: normalizedDocs,
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
  logger.debug({ pregunta, conversacionId, docsCount: documentosSeleccionados?.length || 0 }, "Chat normal - Solicitud recibida");

  try {
    // Si no hay conversacionId, crear una nueva conversación ANTES de enviar a n8n
    let effectiveConversacionId = conversacionId;
    if (!conversacionId) {
      effectiveConversacionId = await createEmptyConversation(req.session.user.id, pregunta);
      logger.info({ conversacionId: effectiveConversacionId }, "Chat normal - Conversación pre-creada para memoria");
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
      }
    );

    logger.info({ status: response.status }, "Status Skynet (Chat normal)");

    const data = await response.json();
    logger.debug({ data }, "Data recibida (Semantic Search)");

    // Normalizar respuesta del chatbot
    const { respuesta, documentosRecomendados } =
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
      feedbackRequested: true,
      documentos: documentosRecomendados || [],
    };

    // Siempre tenemos effectiveConversacionId (ya sea el original o el pre-creado)
    const result = await db.query(
      "SELECT chat_history FROM conversaciones WHERE id = $1 AND usuario_id = $2",
      [effectiveConversacionId, req.session.user.id]
    );

    if (result.rows.length > 0) {
      let chatHistory = result.rows[0].chat_history || [];

      chatHistory = normalizeMessages(chatHistory);
      chatHistory.push(nuevoMensaje, nuevaRespuesta);

      await db.query(
        "UPDATE conversaciones SET chat_history = $1 WHERE id = $2",
        [JSON.stringify(chatHistory), effectiveConversacionId]
      );

      logger.info({ conversacionId: effectiveConversacionId }, "Conversación actualizada");
      return res.json({ respuesta, documentosRecomendados, conversacionId: effectiveConversacionId });
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
      ]
    );

    const newConversacionId = newResult.rows[0].id;
    logger.info({ conversacionId: newConversacionId }, "Nueva conversación creada (fallback)");

    res.json({
      respuesta,
      documentosRecomendados,
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
  logger.info({ contextoLength: contexto?.length }, "Contexto recibido para mapa mental");
  logger.info({ conversacionId }, "ID de conversación para asociar mapa");

  if (!conversacionId) {
    return res.status(400).json({
      error:
        "El ID de la conversación es obligatorio para crear un mapa mental.",
    });
  }

  if (!contexto || contexto.trim().length < 50) {
    return res.status(400).json({
      error: "El contexto debe tener al menos 50 caracteres para generar un mapa mental.",
    });
  }

  try {
    const response = await fetch("https://skynet.uct.cl/webhook/mapa-mental", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contexto }),
    });

    logger.info({ status: response.status }, "Status respuesta Skynet mapa mental");

    if (!response.ok) {
      logger.error({ status: response.status }, "Error HTTP de Skynet en mapa mental");
      return res.status(502).json({
        error: "Error al comunicarse con el servicio de generación de mapas mentales",
      });
    }

    // Leer la respuesta como texto primero para poder debuggear si hay errores
    const responseText = await response.text();
    logger.debug({ responseTextLength: responseText.length }, "Respuesta raw de Skynet");

    if (!responseText || responseText.trim().length === 0) {
      logger.error("Respuesta vacía de Skynet para mapa mental");
      return res.status(502).json({
        error: "El servicio de generación de mapas mentales devolvió una respuesta vacía. Intenta de nuevo.",
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      logger.error({ err: parseError.message, responseText: responseText.substring(0, 500) }, "Error parseando JSON de Skynet");
      return res.status(502).json({
        error: "La respuesta del servicio de mapas mentales no es válida. Intenta de nuevo.",
      });
    }

    logger.info({ dataLength: JSON.stringify(data).length }, "Data recibida mapa mental");

    const mapaMental = data.respuesta || {};

    // Guardar mapa mental
    const result = await db.query(
      `INSERT INTO mapas_mentales (usuario_id, titulo, contexto, estructura_json, conversacion_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, fecha_creacion`,
      [
        req.session.user.id,
        titulo || "Mapa mental sin título",
        contexto,
        JSON.stringify(mapaMental),
        conversacionId,
      ]
    );

    const nuevoMapaId = result.rows[0].id;
    logger.info({ nuevoMapaId }, "Mapa mental guardado");

    // Asociar mapa mental a la conversación
    await db.query(
      `UPDATE conversaciones
       SET mapas_mentales_ids = COALESCE(mapas_mentales_ids, '[]'::jsonb) || $1::jsonb
       WHERE id = $2 AND usuario_id = $3`,
      [JSON.stringify([nuevoMapaId]), conversacionId, req.session.user.id]
    );

    logger.info({ conversacionId }, "Mapa asociado a conversación");

    mapaMental.id = nuevoMapaId;
    mapaMental.fecha_creacion = result.rows[0].fecha_creacion;

    res.json({
      mapaMental,
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
