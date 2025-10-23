const express = require("express");
const db = require("../db");
const requireLogin = require("../middleware/auth");

const router = express.Router();

// Ruta de chat normal
router.post("/", requireLogin, async (req, res) => {
  const { pregunta, conversacionId } = req.body;
  console.log("👉 Pregunta recibida:", pregunta);
  console.log("👉 ID de conversación:", conversacionId);
  console.log("👉 Sesión actual:", req.session);

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

    let respuesta = data.respuesta || "No hay respuesta disponible.";
    const documentosRecomendados = data.documentosRecomendados || [];

    const nuevoMensaje = { role: "user", content: pregunta, timestamp: new Date().toISOString() };
    const nuevaRespuesta = { role: "assistant", content: respuesta, timestamp: new Date().toISOString() };

    if (conversacionId) {
      // Si se proporciona un ID de conversación, añadimos el mensaje a la existente
      const result = await db.query(
        "SELECT chat_history FROM conversaciones WHERE id = $1 AND usuario_id = $2",
        [conversacionId, req.session.user.id]
      );

      if (result.rows.length > 0) {
        const chatHistory = result.rows[0].chat_history || [];
        chatHistory.push(nuevoMensaje, nuevaRespuesta);

        await db.query(
          "UPDATE conversaciones SET chat_history = $1 WHERE id = $2",
          [JSON.stringify(chatHistory), conversacionId]
        );
        res.json({ respuesta, documentosRecomendados, conversacionId });
      } else {
        // La conversación no pertenece al usuario, se crea una nueva
        const titulo = pregunta.split(' ').slice(0, 3).join(' ') + '...';
        const nuevoChatHistory = [nuevoMensaje, nuevaRespuesta];
        const newResult = await db.query(
          "INSERT INTO conversaciones (usuario_id, titulo, chat_history) VALUES ($1, $2, $3) RETURNING id",
          [req.session.user.id, titulo, JSON.stringify(nuevoChatHistory)]
        );
        res.json({ respuesta, documentosRecomendados, conversacionId: newResult.rows[0].id });
      }
    } else {
      // Si no se proporciona un ID, se crea una nueva conversación
      const titulo = pregunta.split(' ').slice(0, 3).join(' ') + '...';
      const nuevoChatHistory = [nuevoMensaje, nuevaRespuesta];
      const result = await db.query(
        "INSERT INTO conversaciones (usuario_id, titulo, chat_history) VALUES ($1, $2, $3) RETURNING id",
        [req.session.user.id, titulo, JSON.stringify(nuevoChatHistory)]
      );
      res.json({ respuesta, documentosRecomendados, conversacionId: result.rows[0].id });
    }
  } catch (err) {
    console.error("❌ Error en chat:", err);
    res.status(500).json({ respuesta: "Error al contactar con el asistente." });
  }
});

// Generar mapa mental
router.post("/mapa-mental", requireLogin, async (req, res) => {
  const { contexto, titulo, conversacionId } = req.body;
  console.log("Contexto recibido para mapa mental:", contexto);
  console.log("ID de conversación para asociar mapa:", conversacionId);

  if (!conversacionId) {
    return res.status(400).json({ error: "El ID de la conversación es obligatorio para crear un mapa mental." });
  }

  try {
    const response = await fetch("https://skynet.uct.cl/webhook/mapa-mental", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contexto }),
    });

    console.log("Status Skynet:", response.status);

    const data = await response.json();
    console.log("Data recibida (mapa mental):", data);

    // el agente devuelve { respuesta: {...} }
    let mapaMental = data.respuesta || {};

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

    // Actualizar la conversación para añadir el ID del mapa mental a la lista
    await db.query(
      `UPDATE conversaciones
       SET mapas_mentales_ids = COALESCE(mapas_mentales_ids, '[]'::jsonb) || $1::jsonb
       WHERE id = $2 AND usuario_id = $3`,
      [JSON.stringify([nuevoMapaId]), conversacionId, req.session.user.id]
    );

    // Añadir información del mapa guardado a la respuesta
    mapaMental.id = nuevoMapaId;
    mapaMental.fecha_creacion = result.rows[0].fecha_creacion;

    res.json({
      mapaMental,
      mensaje: "Mapa mental guardado y asociado a la conversación correctamente",
    });
  } catch (err) {
    console.error("❌ Error en mapa mental:", err);
    res
      .status(500)
      .json({ error: "Error al generar o guardar el mapa mental." });
  }
});

module.exports = router;
