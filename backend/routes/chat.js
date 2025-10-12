const express = require("express");
const db = require("../db");
const requireLogin = require("../middleware/auth");

const router = express.Router();

// Ruta de chat normal
router.post("/", requireLogin, async (req, res) => {
  const { pregunta } = req.body;
  console.log("👉 Pregunta recibida:", pregunta);
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

    await db.query(
      "INSERT INTO conversaciones (usuario_id, pregunta, respuesta) VALUES ($1, $2, $3)",
      [req.session.user.id, pregunta, respuesta]
    );

    res.json({ respuesta, documentosRecomendados });
  } catch (err) {
    console.error("❌ Error en chat:", err);
    res.status(500).json({ respuesta: "Error al contactar con el asistente." });
  }
});

// Generar mapa mental
router.post("/mapa-mental", requireLogin, async (req, res) => {
  const { contexto, titulo } = req.body;
  console.log("Contexto recibido para mapa mental:", contexto);

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
      `INSERT INTO mapas_mentales (usuario_id, titulo, contexto, estructura_json) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, fecha_creacion`,
      [
        req.session.user.id,
        titulo || "Mapa mental sin título",
        contexto,
        JSON.stringify(mapaMental),
      ]
    );

    // Añadir información del mapa guardado a la respuesta
    mapaMental.id = result.rows[0].id;
    mapaMental.fecha_creacion = result.rows[0].fecha_creacion;

    res.json({
      mapaMental,
      mensaje: "Mapa mental guardado correctamente",
    });
  } catch (err) {
    console.error("❌ Error en mapa mental:", err);
    res
      .status(500)
      .json({ error: "Error al generar o guardar el mapa mental." });
  }
});

module.exports = router;
