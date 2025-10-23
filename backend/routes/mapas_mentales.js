const express = require("express");
const db = require("../db");
const requireLogin = require("../middleware/auth");

const router = express.Router();

// Obtener todos los mapas mentales del usuario
router.get("/", requireLogin, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, titulo, contexto, estructura_json, fecha_creacion FROM mapas_mentales WHERE usuario_id = $1 ORDER BY fecha_creacion DESC",
      [req.session.user.id]
    );
    res.json({ success: true, mapas: result.rows });
  } catch (err) {
    console.error("Error al obtener mapas mentales:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener un mapa mental específico
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, titulo, contexto, estructura_json, fecha_creacion FROM mapas_mentales WHERE id = $1 AND usuario_id = $2",
      [req.params.id, req.session.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Mapa mental no encontrado" });
    }
    
    res.json({ success: true, mapa: result.rows[0] });
  } catch (err) {
    console.error("Error al obtener mapa mental:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Guardar nuevo mapa mental
router.post("/", requireLogin, async (req, res) => {
  const { titulo, contexto, estructura_json, conversacion_id } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO mapas_mentales (usuario_id, titulo, contexto, estructura_json, conversacion_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.session.user.id, titulo, contexto, estructura_json, conversacion_id]
    );
    res.json({ success: true, mapa: result.rows[0] });
  } catch (err) {
    console.error("Error al guardar mapa mental:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Actualizar mapa mental existente (para asociarlo a una conversación)
router.put("/:id", requireLogin, async (req, res) => {
  const { titulo, contexto, estructura_json, conversacion_id } = req.body;
  try {
    const result = await db.query(
      `UPDATE mapas_mentales
       SET titulo = $1,
           contexto = $2,
           estructura_json = $3,
           conversacion_id = $4
       WHERE id = $5 AND usuario_id = $6
       RETURNING *`,
      [titulo, contexto, estructura_json, conversacion_id, req.params.id, req.session.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Mapa mental no encontrado o no autorizado" });
    }

    res.json({ success: true, mapa: result.rows[0] });
  } catch (err) {
    console.error("Error al actualizar mapa mental:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener mapas mentales asociados a una conversación específica
router.get("/conversacion/:conversacionId", requireLogin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.id, m.titulo, m.contexto, m.estructura_json, m.fecha_creacion
       FROM mapas_mentales m
       WHERE m.conversacion_id = $1 AND m.usuario_id = $2
       ORDER BY m.fecha_creacion DESC`,
      [req.params.conversacionId, req.session.user.id]
    );
    
    res.json({ success: true, mapas: result.rows });
  } catch (err) {
    console.error("Error al obtener mapas mentales de conversación:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;