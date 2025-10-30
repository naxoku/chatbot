const express = require("express");
const { nanoid } = require("nanoid");
const db = require("../db");
const requireLogin = require("../middleware/auth");
const { normalizeMessages } = require("../middleware/normalizeMessages");

const router = express.Router();

/**
 * 🧠 Normaliza la respuesta del chatbot (Skynet)
 * - Garantiza estructura { respuesta, documentosRecomendados }
 * - Filtra documentos incompletos o duplicados
 */
function normalizeChatbotResponse(data) {
  let respuesta =
    data?.respuesta ||
    data?.output?.respuesta ||
    "No hay respuesta disponible.";

  let documentos = data?.documentosRecomendados || data?.output?.documentosRecomendados || [];

  // 🔹 Filtrar solo documentos válidos
  documentos = documentos.filter(
    (d) =>
      d &&
      d.title &&
      d.url &&
      d.description &&
      typeof d.title === "string" &&
      typeof d.url === "string"
  );

  // 🔹 Eliminar duplicados (por título o URL)
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

// 📡 Endpoint de chat con streaming SSE
router.post("/stream", requireLogin, async (req, res) => {
  const { pregunta, conversacionId } = req.body;
  console.log("👉 Stream - Pregunta recibida:", pregunta);
  console.log("👉 Stream - ID de conversación:", conversacionId);

  // Configurar headers para SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
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

    // Hacer fetch al webhook de n8n en streaming mode
    const n8nResponse = await fetch("https://skynet.uct.cl/webhook/chat-streaming", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: req.session.user.usuario,
        pregunta,
      }),
    });

    console.log("👉 Stream - Status Skynet:", n8nResponse.status);

    if (!n8nResponse.ok) {
      sendEvent("error", { message: "Error al contactar con el asistente" });
      closeConnection();
      return;
    }

    // Intentar procesar como stream, si falla usar respuesta JSON normal
    let finalResponse = null;
    let documentosRecomendados = [];

    try {
      // Leer el stream progresivamente
      const reader = n8nResponse.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let buffer = ""; // Buffer para manejar líneas divididas

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Mantener la última línea parcial en el buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            try {
              const data = JSON.parse(trimmedLine);
              
              // Procesar según el tipo
              if (data.type === 'item' && data.content) {
                const textChunk = data.content;
                accumulatedText += textChunk;
                
                // Enviar chunk inmediatamente al frontend
                sendEvent("chunk", {
                  text: textChunk,
                  fullText: accumulatedText
                });
              } else if (data.type === 'end') {
                // Fin del streaming
                finalResponse = accumulatedText || "Respuesta completada";
                break;
              }
            } catch (lineError) {
              // Ignorar líneas que no son JSON válido
              continue;
            }
          }
          
          // Si encontramos el final, salir del loop
          if (finalResponse) break;
        }
      } finally {
        reader.releaseLock();
      }

      // Asegurar que tenemos una respuesta final
      if (!finalResponse) {
        finalResponse = accumulatedText || "No hay respuesta disponible.";
      }

      // Normalizar documentos recomendados
      const normalizedDocs = normalizeChatbotResponse({
        respuesta: finalResponse,
        documentosRecomendados
      }).documentosRecomendados;

      // Crear mensajes para la base de datos
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

      // Guardar en base de datos
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

          await db.query("UPDATE conversaciones SET chat_history = $1 WHERE id = $2", [
            JSON.stringify(chatHistory),
            conversacionId,
          ]);

          console.log("✅ Stream - Conversación actualizada:", conversacionId);
        } else {
          console.warn("⚠️ Stream - Conversación no encontrada, creando nueva");
        }
      }

      if (!conversacionId || !finalConversacionId) {
        // Crear nueva conversación
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
        console.log("✅ Stream - Nueva conversación creada:", finalConversacionId);
      }

      // Enviar evento final con todos los datos
      sendEvent("complete", {
        respuesta: finalResponse,
        documentosRecomendados: normalizedDocs,
        conversacionId: finalConversacionId,
      });
    } catch (streamError) {
      console.error("❌ Error en stream:", streamError);
      sendEvent("error", {
        message: "Error al procesar la respuesta del asistente",
        details: streamError.message
      });
    }

  } catch (err) {
    console.error("❌ Error en stream:", err);
    sendEvent("error", {
      message: "Error al procesar la respuesta del asistente",
      details: err.message
    });
  } finally {
    closeConnection();
  }
});

// 🔍 Endpoint de debugging para verificar conexión
router.post("/debug", (req, res) => {
  console.log("🔍 Debug endpoint llamado");
  console.log("🔍 Session user:", req.session?.user);
  console.log("🔍 Request body:", req.body);
  console.log("🔍 Headers:", req.headers);
  
  res.json({
    message: "Debug successful",
    sessionUser: req.session?.user,
    requestBody: req.body,
    headers: req.headers
  });
});

// 📩 Ruta de chat normal
router.post("/", requireLogin, async (req, res) => {
  const { pregunta, conversacionId } = req.body;
  console.log("👉 Pregunta recibida:", pregunta);
  console.log("👉 ID de conversación:", conversacionId);

  try {
    // const response = await fetch("https://skynet.uct.cl/webhook/chat-semantic-search", {
    const response = await fetch("https://skynet.uct.cl/webhook/chat-streaming", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: req.session.user.usuario,
        pregunta,
      }),
    });

    console.log("👉 Status Skynet (Semantic Search):", response.status);

    const data = await response.json();
    console.log("👉 Data recibida (Semantic Search):", data);

    // ✅ Normalizar respuesta del chatbot
    const { respuesta, documentosRecomendados } = normalizeChatbotResponse(data);

    // ✅ Crear mensajes normalizados
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
      // 🧩 Actualizar conversación existente
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

        console.log("✅ Conversación actualizada:", conversacionId);
        return res.json({ respuesta, documentosRecomendados, conversacionId });
      } else {
        console.warn("⚠️ Conversación no encontrada, creando nueva");
      }
    }

    // 🆕 Crear nueva conversación
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

    const newConversacionId = newResult.rows[0].id;
    console.log("✅ Nueva conversación creada:", newConversacionId);

    res.json({
      respuesta,
      documentosRecomendados,
      conversacionId: newConversacionId,
    });
  } catch (err) {
    console.error("❌ Error en chat:", err);
    res.status(500).json({ respuesta: "Error al contactar con el asistente." });
  }
});

// 🧭 Generar mapa mental
router.post("/mapa-mental", requireLogin, async (req, res) => {
  const { contexto, titulo, conversacionId } = req.body;
  console.log("📝 Contexto recibido para mapa mental:", contexto?.substring(0, 100));
  console.log("📝 ID de conversación para asociar mapa:", conversacionId);

  if (!conversacionId) {
    return res.status(400).json({
      error: "El ID de la conversación es obligatorio para crear un mapa mental.",
    });
  }

  try {
    const response = await fetch("https://skynet.uct.cl/webhook/mapa-mental", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contexto }),
    });

    console.log("👉 Status Skynet (Mapa Mental):", response.status);

    const data = await response.json();
    console.log("👉 Data recibida (mapa mental):", JSON.stringify(data).substring(0, 200));

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
    console.log("✅ Mapa mental guardado con ID:", nuevoMapaId);

    // Asociar mapa mental a la conversación
    await db.query(
      `UPDATE conversaciones
       SET mapas_mentales_ids = COALESCE(mapas_mentales_ids, '[]'::jsonb) || $1::jsonb
       WHERE id = $2 AND usuario_id = $3`,
      [JSON.stringify([nuevoMapaId]), conversacionId, req.session.user.id]
    );

    console.log("✅ Mapa asociado a conversación:", conversacionId);

    mapaMental.id = nuevoMapaId;
    mapaMental.fecha_creacion = result.rows[0].fecha_creacion;

    res.json({
      mapaMental,
      mensaje: "Mapa mental guardado y asociado a la conversación correctamente",
    });
  } catch (err) {
    console.error("❌ Error en mapa mental:", err);
    res.status(500).json({
      error: "Error al generar o guardar el mapa mental.",
      details: err.message,
    });
  }
});

module.exports = router;
