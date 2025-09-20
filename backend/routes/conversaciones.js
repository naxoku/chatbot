const express = require("express");
const db = require("../db");
const requireLogin = require("../middleware/auth");

const router = express.Router();

// Obtener historial
router.get("/", requireLogin, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, pregunta, respuesta, fecha_creacion FROM conversaciones WHERE usuario_id = $1 ORDER BY fecha_creacion ASC",
      [req.session.user.id]
    );
    res.json({ success: true, conversaciones: result.rows });
  } catch (err) {
    console.error("Error al obtener conversaciones:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Guardar conversación
router.post("/", requireLogin, async (req, res) => {
  const { pregunta, respuesta } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO conversaciones (usuario_id, pregunta, respuesta) VALUES ($1, $2, $3) RETURNING *",
      [req.session.user.id, pregunta, respuesta]
    );
    res.json({ success: true, conversacion: result.rows[0] });
  } catch (err) {
    console.error("Error al guardar conversación:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
