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
    const response = await fetch("https://skynet.uct.cl/webhook/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta }),
    });

    console.log("👉 Status Skynet:", response.status);

    const data = await response.json();
    console.log("👉 Data recibida:", data);

    let respuesta = data.respuesta || "No hay respuesta disponible.";

    await db.query(
      "INSERT INTO conversaciones (usuario_id, pregunta, respuesta) VALUES ($1, $2, $3)",
      [req.session.user.id, pregunta, respuesta]
    );

    res.json({ respuesta });
  } catch (err) {
    console.error("❌ Error en chat:", err);
    res.status(500).json({ respuesta: "Error al contactar con el asistente." });
  }
});

// Nueva ruta para generar mapa mental
router.post("/mapa-mental", requireLogin, async (req, res) => {
  const { contexto } = req.body;
  console.log("🧠 Contexto recibido para mapa mental:", contexto);

  try {
    const response = await fetch("https://skynet.uct.cl/webhook/mapa-mental", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contexto }),
    });

    console.log("👉 Status Skynet:", response.status);

    const data = await response.json();
    console.log("👉 Data recibida (mapa mental):", data);

    // el agente devuelve { respuesta: {...} }
    let mapaMental = data.respuesta || {};

    res.json({ mapaMental });
  } catch (err) {
    console.error("❌ Error en mapa mental:", err);
    res
      .status(500)
      .json({ error: "Error al generar el mapa mental con el asistente." });
  }
});

module.exports = router;
