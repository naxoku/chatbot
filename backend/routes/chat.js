/**
 * RUTAS DE CHAT
 *
 * Maneja la comunicación con el chatbot y el streaming de respuestas.
 * Se conecta con el servicio n8n Skynet para procesar mensajes.
 */

const express = require("express");
const { nanoid } = require("nanoid");
const { db, queryWithRetry } = require("../db");
const requireLogin = require("../middleware/auth");
const { normalizeMessages } = require("../middleware/normalizeMessages");
const logger = require("../logger");

const router = express.Router();

//Normalizar la respuesta del chatbot (n8n)
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

// Endpoint de chat con streaming SSE
router.post("/stream", requireLogin, async (req, res) => {
  const { pregunta, conversacionId, documentosSeleccionados } = req.body;
  logger.info("CHAT", `Solicitud de stream: "${pregunta?.substring(0, 50)}..." | Conv: ${conversacionId || 'new'} | Docs: ${documentosSeleccionados?.length || 0}`);

  // Configurar headers para SSE (sin romper CORS)
  const origin = req.headers.origin;
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": origin || "http://localhost:8080",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Cache-Control, Content-Type",
  });

  // Función para enviar eventos SSE
  const sendEvent = (eventName, data) => {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Función para cerrar la conexión
  const closeConnection = () => {
    res.end();
  };

  try {
    // Enviar evento de inicio
    sendEvent("start", { status: "iniciando respuesta" });

    // Preparar request body para n8n
    const n8nRequestBody = {
      user_id: req.session.user.usuario,
      pregunta,
      documentosSeleccionados: documentosSeleccionados || [],
    };

    logger.info("CHAT", `Enviando a n8n: ${JSON.stringify(n8nRequestBody, null, 2)}`);

    // Hacer fetch al webhook de n8n en modo streaming
    const n8nResponse = await fetch("https://skynet.uct.cl/webhook/chat-streaming", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n8nRequestBody),
    });

    logger.info("CHAT", `Respuesta de Skynet: ${n8nResponse.status}`);

    if (!n8nResponse.ok) {
      sendEvent("error", { message: "Error al contactar con el asistente" });
      closeConnection();
      return;
    }

    // Intentar procesar como stream, si falla usar respuesta JSON normal
    let finalResponse = null;
    let documentosRecomendados = [];

    try {
      const reader = n8nResponse.body.getReader();
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
                const textChunk = data.content;
                accumulatedText += textChunk;

                sendEvent("chunk", {
                  text: textChunk,
                  fullText: accumulatedText,
                });
              } else if (data.type === "end") {
                finalResponse = accumulatedText || "Respuesta completada";
                break;
              }
            } catch {
              continue;
            }
          }

          if (finalResponse) break;
        }
      } finally {
        reader.releaseLock();
      }

      if (!finalResponse) {
        finalResponse = accumulatedText || "No hay respuesta disponible.";
      }

      const normalizedDocs = normalizeChatbotResponse({
        respuesta: finalResponse,
        documentosRecomendados,
      }).documentosRecomendados;

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
        content: finalResponse,
        timestamp: new Date().toISOString(),
        feedbackRequested: true,
        documentos: normalizedDocs,
      };

      let finalConversacionId = conversacionId;

      if (conversacionId) {
        const result = await db.query(
          "SELECT chat_history FROM conversaciones WHERE id = $1 AND usuario_id = $2",
          [conversacionId, req.session.user.id]
        );

        if (result.rows.length > 0) {
          let chatHistory = result.rows[0].chat_history || [];
          chatHistory = normalizeMessages(chatHistory);
          chatHistory.push(nuevoMensaje, nuevaRespuesta);

          await db.query("UPDATE conversaciones SET chat_history = $1 WHERE id = $2", [
            JSON.stringify(chatHistory),
            conversacionId,
          ]);

          logger.success("CHAT", `Conversación actualizada: ${conversacionId}`);
        } else {
          logger.warn("CHAT", "Conversación no encontrada, creando nueva");
        }
      }

      if (!conversacionId || !finalConversacionId) {
        const titulo = pregunta.substring(0, 50) + (pregunta.length > 50 ? "..." : "");
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

        finalConversacionId = newResult.rows[0].id;
        logger.success("CHAT", `Nueva conversación creada: ${finalConversacionId}`);
      }

      sendEvent("complete", {
        respuesta: finalResponse,
        documentosRecomendados: normalizedDocs,
        conversacionId: finalConversacionId,
      });
    } catch (streamError) {
      logger.error("CHAT", "Error procesando stream:", streamError.message);
      sendEvent("error", {
        message: "Error al procesar la respuesta del asistente",
        details: streamError.message,
      });
    }
  } catch (err) {
    logger.error("CHAT", "Error en endpoint de stream:", err.message);
    sendEvent("error", {
      message: "Error al procesar la respuesta del asistente",
      details: err.message,
    });
  } finally {
    closeConnection();
  }
});


// Endpoint de debugging para verificar conexión
router.post("/debug", (req, res) => {
  logger.info("CHAT", "Endpoint de debug llamado");
  logger.info("CHAT", `Usuario de sesión: ${req.session?.user?.usuario || 'ninguno'}`);
  logger.info("CHAT", `Claves del body de la solicitud: ${Object.keys(req.body || {}).join(', ')}`);

  res.json({
    message: "Debug successful",
    sessionUser: req.session?.user,
    requestBody: req.body,
    headers: req.headers,
  });
});

// Ruta de chat normal
router.post("/", requireLogin, async (req, res) => {
  const { pregunta, conversacionId, documentosSeleccionados } = req.body;
  logger.info("CHAT", `Solicitud de chat: "${pregunta?.substring(0, 50)}..." | Conv: ${conversacionId || 'new'} | Docs: ${documentosSeleccionados?.length || 0}`);

  try {
    // Preparar request body para n8n
    const n8nRequestBody = {
      user_id: req.session.user.usuario,
      pregunta,
      documentosSeleccionados: documentosSeleccionados || [],
    };

    logger.info("CHAT", `Enviando a n8n (chat normal): ${JSON.stringify(n8nRequestBody, null, 2)}`);

    // const response = await fetch("https://skynet.uct.cl/webhook/chat-semantic-search", {
    const response = await fetch(
      "https://skynet.uct.cl/webhook/chat-streaming",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nRequestBody),
      }
    );

    logger.info("CHAT", `Respuesta de Skynet: ${response.status}`);

    const data = await response.json();
    logger.info("CHAT", `Respuesta recibida (${JSON.stringify(data).length} caracteres)`);

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

    if (conversacionId) {
      // Actualizar conversación existente
      const result = await db.query(
        "SELECT chat_history FROM conversaciones WHERE id = $1 AND usuario_id = $2",
        [conversacionId, req.session.user.id]
      );

      if (result.rows.length > 0) {
        let chatHistory = result.rows[0].chat_history || [];

        chatHistory = normalizeMessages(chatHistory);
        chatHistory.push(nuevoMensaje, nuevaRespuesta);

        await db.query(
          "UPDATE conversaciones SET chat_history = $1 WHERE id = $2",
          [JSON.stringify(chatHistory), conversacionId]
        );

        logger.success("CHAT", `Conversación actualizada: ${conversacionId}`);
        return res.json({ respuesta, documentosRecomendados, conversacionId });
      } else {
        logger.warn("CHAT", "Conversación no encontrada, creando nueva");
      }
    }

    // Crear nueva conversación
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
    logger.success("CHAT", `Nueva conversación creada: ${newConversacionId}`);

    res.json({
      respuesta,
      documentosRecomendados,
      conversacionId: newConversacionId,
    });
  } catch (err) {
    logger.error("CHAT", "Error en endpoint de chat:", err.message);
    res.status(500).json({ respuesta: "Error al contactar con el asistente." });
  }
});

// Generar mapa mental
router.post("/mapa-mental", requireLogin, async (req, res) => {
  const { contexto, titulo, conversacionId } = req.body;
  logger.info("CHAT", `Solicitud de mapa mental: "${contexto?.substring(0, 50)}..." | Conv: ${conversacionId}`);

  if (!conversacionId) {
    return res.status(400).json({
      error:
        "El ID de la conversación es obligatorio para crear un mapa mental.",
    });
  }

  try {
    const response = await fetch("https://skynet.uct.cl/webhook/mapa-mental", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contexto }),
    });

    logger.info("CHAT", `Respuesta de mapa mental de Skynet: ${response.status}`);

    const data = await response.json();
    logger.info("CHAT", `Datos de mapa mental recibidos (${JSON.stringify(data).length} caracteres)`);

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
    logger.success("CHAT", `Mapa mental guardado: ${nuevoMapaId}`);

    // Asociar mapa mental a la conversación
    await db.query(
      `UPDATE conversaciones
       SET mapas_mentales_ids = COALESCE(mapas_mentales_ids, '[]'::jsonb) || $1::jsonb
       WHERE id = $2 AND usuario_id = $3`,
      [JSON.stringify([nuevoMapaId]), conversacionId, req.session.user.id]
    );

    logger.success("CHAT", `Mapa asociado a conversación: ${conversacionId}`);

    mapaMental.id = nuevoMapaId;
    mapaMental.fecha_creacion = result.rows[0].fecha_creacion;

    res.json({
      mapaMental,
      mensaje:
        "Mapa mental guardado y asociado a la conversación correctamente",
    });
  } catch (err) {
    logger.error("CHAT", "Error en mapa mental:", err.message);
    res.status(500).json({
      error: "Error al generar o guardar el mapa mental.",
      details: err.message,
    });
  }
});

module.exports = router;
