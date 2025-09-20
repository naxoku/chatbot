const express = require("express");
// const fetch = require("node-fetch");
const db = require("../db");
const requireLogin = require("../middleware/auth");

const router = express.Router();

router.post("/", requireLogin, async (req, res) => {
  const { pregunta } = req.body;

  try {
    const response = await fetch("https://skynet.uct.cl/webhook/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta }),
    });

    const data = await response.json();
    let respuesta = data.respuesta || "No hay respuesta disponible.";

    // Guardar en DB
    await db.query(
      "INSERT INTO conversaciones (usuario_id, pregunta, respuesta) VALUES ($1, $2, $3)",
      [req.session.user.id, pregunta, respuesta]
    );

    res.json({ respuesta });
  } catch (err) {
    console.error("Error en chat:", err);
    res.status(500).json({ respuesta: "Error al contactar con el asistente." });
  }
});

module.exports = router;
