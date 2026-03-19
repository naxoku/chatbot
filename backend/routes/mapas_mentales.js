/**
 * Rutas para gestión de mapas mentales.
 * Maneja CRUD de mapas mentales y asociaciones con conversaciones.
 */

const express = require("express");
const { db, queryWithRetry } = require("../db");
const requireLogin = require("../middleware/auth");
const { logger } = require("../logger");

const router = express.Router();

// Obtiene todos los mapas mentales del usuario autenticado
router.get("/", requireLogin, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, titulo, contexto, estructura_json, fecha_creacion FROM mapas_mentales WHERE usuario_id = $1 ORDER BY fecha_creacion DESC",
      [req.session.user.id]
    );
    res.json({ success: true, mapas: result.rows });
  } catch (err) {
    logger.error({ err }, "Error al obtener mapas mentales");
    res.status(500).json({ success: false, error: "Error interno al obtener mapas mentales. Intente nuevamente." });
  }
});

// Obtiene un mapa mental específico por ID
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, titulo, contexto, estructura_json, fecha_creacion FROM mapas_mentales WHERE id = $1 AND usuario_id = $2",
      [req.params.id, req.session.user.id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Mapa mental no encontrado" });
    }

    res.json({ success: true, mapa: result.rows[0] });
  } catch (err) {
    logger.error({ err }, "Error al obtener mapa mental");
    res.status(500).json({ success: false, error: "Error interno al obtener mapa mental. Intente nuevamente." });
  }
});

// Crea un nuevo mapa mental asociado al usuario
router.post("/", requireLogin, async (req, res) => {
  const { titulo, contexto, estructura_json, conversacion_id } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO mapas_mentales (usuario_id, titulo, contexto, estructura_json, conversacion_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.session.user.id, titulo, contexto, estructura_json, conversacion_id]
    );
    res.json({ success: true, mapa: result.rows[0] });
  } catch (err) {
    logger.error({ err }, "Error al guardar mapa mental");
    res.status(500).json({ success: false, error: "Error interno al guardar mapa mental. Intente nuevamente." });
  }
});

// Actualiza un mapa mental existente
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
      [
        titulo,
        contexto,
        estructura_json,
        conversacion_id,
        req.params.id,
        req.session.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Mapa mental no encontrado o acceso denegado",
        });
    }

    res.json({ success: true, mapa: result.rows[0] });
  } catch (err) {
    logger.error({ err }, "Error al actualizar mapa mental");
    res.status(500).json({ success: false, error: "Error interno al actualizar mapa mental. Intente nuevamente." });
  }
});

// Obtiene todos los mapas mentales asociados a una conversación específica
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
    logger.error({ err }, "Error al obtener mapas mentales de conversación");
    res.status(500).json({ success: false, error: "Error interno al obtener mapas mentales. Intente nuevamente." });
  }
});

module.exports = router;
