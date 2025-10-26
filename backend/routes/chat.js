const express = require("express");
const { nanoid } = require("nanoid");
const db = require("../db");
const requireLogin = require("../middleware/auth");
const { normalizeMessages } = require("../middleware/normalizeMessages");

const router = express.Router();

// Ruta de chat normal
router.post("/", requireLogin, async (req, res) => {
  const { pregunta, conversacionId } = req.body;
  console.log("👉 Pregunta recibida:", pregunta);
  console.log("👉 ID de conversación:", conversacionId);

  try {
    const response = await fetch(
      "https://skynet.uct.cl/webhook/chat-semantic-search",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: req.session.user.usuario,
          pregunta,
        }),
      }
    );

    console.log("👉 Status Skynet (Semantic Search):", response.status);

    const data = await response.json();
    console.log("👉 Data recibida (Semantic Search):", data);

    const respuesta =
      data.respuesta ||
      data.output?.respuesta ||
      "No hay respuesta disponible.";
    const documentosRecomendados =
      data.documentosRecomendados || data.output?.documentosRecomendados || [];

    // ✅ NORMALIZAR: Siempre usar estructura 'sender' + 'id'
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
      ...(documentosRecomendados.length > 0 && {
        documentLinks: documentosRecomendados,
      }),
    };

    if (conversacionId) {
      // Actualizar conversación existente
      const result = await db.query(
        "SELECT chat_history FROM conversaciones WHERE id = $1 AND usuario_id = $2",
        [conversacionId, req.session.user.id]
      );

      if (result.rows.length > 0) {
        let chatHistory = result.rows[0].chat_history || [];

        // ✅ Normalizar mensajes existentes antes de añadir nuevos
        chatHistory = normalizeMessages(chatHistory);
        chatHistory.push(nuevoMensaje, nuevaRespuesta);

        await db.query(
          "UPDATE conversaciones SET chat_history = $1 WHERE id = $2",
          [JSON.stringify(chatHistory), conversacionId]
        );

        console.log("✅ Conversación actualizada:", conversacionId);
        return res.json({ respuesta, documentosRecomendados, conversacionId });
      } else {
        // La conversación no existe o no pertenece al usuario
        console.warn("⚠️ Conversación no encontrada, creando nueva");
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

// Generar mapa mental
router.post("/mapa-mental", requireLogin, async (req, res) => {
  const { contexto, titulo, conversacionId } = req.body;
  console.log(
    "📝 Contexto recibido para mapa mental:",
    contexto?.substring(0, 100)
  );
  console.log("📝 ID de conversación para asociar mapa:", conversacionId);

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

    console.log("👉 Status Skynet (Mapa Mental):", response.status);

    const data = await response.json();
    console.log(
      "👉 Data recibida (mapa mental):",
      JSON.stringify(data).substring(0, 200)
    );

    const mapaMental = data.respuesta || {};

    // Guardar el mapa mental en la base de datos
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

    // Actualizar la conversación para añadir el ID del mapa mental
    await db.query(
      `UPDATE conversaciones
       SET mapas_mentales_ids = COALESCE(mapas_mentales_ids, '[]'::jsonb) || $1::jsonb
       WHERE id = $2 AND usuario_id = $3`,
      [JSON.stringify([nuevoMapaId]), conversacionId, req.session.user.id]
    );

    console.log("✅ Mapa asociado a conversación:", conversacionId);

    // Añadir información del mapa guardado a la respuesta
    mapaMental.id = nuevoMapaId;
    mapaMental.fecha_creacion = result.rows[0].fecha_creacion;

    res.json({
      mapaMental,
      mensaje:
        "Mapa mental guardado y asociado a la conversación correctamente",
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
