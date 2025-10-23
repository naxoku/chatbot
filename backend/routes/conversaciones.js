const express = require("express");
const db = require("../db");
const requireLogin = require("../middleware/auth");

const router = express.Router();

// Obtener historial de conversaciones
router.get("/", requireLogin, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, titulo, chat_history, mapas_mentales_ids, fecha_creacion FROM conversaciones WHERE usuario_id = $1 ORDER BY fecha_creacion ASC",
      [req.session.user.id]
    );
    res.json({ success: true, conversaciones: result.rows });
  } catch (err) {
    console.error("Error al obtener conversaciones:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener una conversación específica
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, titulo, chat_history, mapas_mentales_ids, fecha_creacion FROM conversaciones WHERE id = $1 AND usuario_id = $2",
      [req.params.id, req.session.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Conversación no encontrada" });
    }
    
    res.json({ success: true, conversacion: result.rows[0] });
  } catch (err) {
    console.error("Error al obtener conversación:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Guardar conversación
router.post("/", requireLogin, async (req, res) => {
  const { chat_history, titulo, mapas_mentales_ids } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO conversaciones (usuario_id, chat_history, titulo, mapas_mentales_ids) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.session.user.id, JSON.stringify(chat_history), titulo, mapas_mentales_ids || '[]']
    );
    res.json({ success: true, conversacion: result.rows[0] });
  } catch (err) {
    console.error("Error al guardar conversación:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Actualizar conversación existente (para añadir mensajes o mapas mentales)
router.put("/:id", requireLogin, async (req, res) => {
  const { chat_history, mapas_mentales_ids, titulo } = req.body;
  try {
    const result = await db.query(
      `UPDATE conversaciones
       SET chat_history = $1,
           mapas_mentales_ids = $2,
           titulo = $3
       WHERE id = $4 AND usuario_id = $5
       RETURNING *`,
      [JSON.stringify(chat_history), mapas_mentales_ids, titulo, req.params.id, req.session.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Conversación no encontrada o no autorizada" });
    }

    res.json({ success: true, conversacion: result.rows[0] });
  } catch (err) {
    console.error("Error al actualizar conversación:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
