/**
 * Rutas para gestión de conversaciones.
 * Maneja CRUD de conversaciones y normalización de mensajes.
 */

const express = require("express");
const { db, queryWithRetry } = require("../db");
const requireLogin = require("../middleware/auth");
const {
  normalizeMessages,
  validateChatHistory,
} = require("../middleware/normalizeMessages");
const { logger } = require("../logger");

const router = express.Router();

// Obtiene el historial completo de conversaciones del usuario autenticado.
router.get("/", requireLogin, async (req, res) => {
  try {
    const result = await queryWithRetry(
      "SELECT id, titulo, chat_history, mapas_mentales_ids, fecha_creacion FROM conversaciones WHERE usuario_id = $1 ORDER BY fecha_creacion DESC",
      [req.session.user.id],
    );

    // Normalizar mensajes en todas las conversaciones antes de enviar
    const conversacionesNormalizadas = result.rows.map((conv) => ({
      ...conv,
      chat_history: normalizeMessages(conv.chat_history || []),
    }));

    res.json({ success: true, conversaciones: conversacionesNormalizadas });
  } catch (err) {
    logger.error({ err }, "Error al obtener conversaciones");
    res
      .status(500)
      .json({
        success: false,
        error: "Error interno al obtener conversaciones. Intente nuevamente.",
      });
  }
});

// Obtiene una conversación específica por ID
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const result = await queryWithRetry(
      "SELECT id, titulo, chat_history, mapas_mentales_ids, fecha_creacion FROM conversaciones WHERE id = $1 AND usuario_id = $2",
      [req.params.id, req.session.user.id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Conversación no encontrada" });
    }

    const row = result.rows[0];
    let mapasMentales = [];

    if (row.mapas_mentales_ids && row.mapas_mentales_ids.length > 0) {
      const ids = row.mapas_mentales_ids;
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
      const mapasResult = await queryWithRetry(
        `SELECT id, titulo, contexto, estructura_json, fecha_creacion 
         FROM mapas_mentales WHERE id IN (${placeholders}) AND usuario_id = $${ids.length + 1}`,
        [...ids, req.session.user.id],
      );
      mapasMentales = mapasResult.rows;
    }

    // Normalizar mensajes antes de enviar
    const conversacion = {
      ...row,
      chat_history: normalizeMessages(row.chat_history || []),
      mapas_mentales: mapasMentales,
    };

    res.json({ success: true, conversacion });
  } catch (err) {
    logger.error({ err }, "Error al obtener conversación");
    res
      .status(500)
      .json({
        success: false,
        error: "Error interno al obtener conversación. Intente nuevamente.",
      });
  }
});

// Maneja creación y renombrado de conversaciones
router.put("/:id", requireLogin, async (req, res) => {
  const { chat_history, mapas_mentales_ids, titulo } = req.body;

  try {
    // Si sólo se envía un título (sin chat_history ni mapas), interpretamos
    // que se trata de un renombrado de la conversación existente.
    if (titulo && !chat_history && !mapas_mentales_ids) {
      const updateResult = await queryWithRetry(
        `UPDATE conversaciones SET titulo = $1 WHERE id = $2 AND usuario_id = $3 RETURNING id, titulo`,
        [titulo, req.params.id, req.session.user.id],
      );

      if (updateResult.rows.length === 0) {
        return res
          .status(404)
          .json({
            success: false,
            error: "Conversación no encontrada o acceso denegado",
          });
      }

      logger.info({ conversacionId: req.params.id }, "Conversación renombrada");
      return res.json({ success: true, conversacion: updateResult.rows[0] });
    }

    // Si viene chat_history, procedemos a crear una nueva conversación
    const normalizedChatHistory = normalizeMessages(chat_history || []);

    // Validar que la estructura sea correcta
    if (!validateChatHistory(normalizedChatHistory)) {
      logger.error(
        { normalizedChatHistory },
        "Chat history con formato inválido (PUT)",
      );
      return res.status(400).json({
        success: false,
        error: "Formato de chat_history inválido",
      });
    }

    const result = await queryWithRetry(
      "INSERT INTO conversaciones (usuario_id, chat_history, titulo, mapas_mentales_ids) VALUES ($1, $2, $3, $4) RETURNING *",
      [
        req.session.user.id,
        JSON.stringify(normalizedChatHistory),
        titulo,
        JSON.stringify(mapas_mentales_ids || []),
      ],
    );

    logger.info({ conversacionId: result.rows[0].id }, "Conversación creada");

    res.json({ success: true, conversacion: result.rows[0] });
  } catch (err) {
    logger.error({ err }, "Error al guardar conversación");
    res
      .status(500)
      .json({
        success: false,
        error: "Error interno al guardar conversación. Intente nuevamente.",
      });
  }
});

// Actualiza una conversación existente con nuevos datos
router.post("/:id", requireLogin, async (req, res) => {
  const { chat_history } = req.body;

  try {
    // Normalizar mensajes antes de guardar
    const normalizedChatHistory = normalizeMessages(chat_history || []);

    // Validar que la estructura sea correcta
    if (!validateChatHistory(normalizedChatHistory)) {
      logger.error(
        { normalizedChatHistory },
        "Chat history con formato inválido (POST)",
      );
      return res.status(400).json({
        success: false,
        error: "Formato de chat_history inválido",
      });
    }

    const result = await queryWithRetry(
      `UPDATE conversaciones
       SET chat_history = $1
       WHERE id = $2 AND usuario_id = $3
       RETURNING id`,
      [
        JSON.stringify(normalizedChatHistory),
        req.params.id,
        req.session.user.id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Conversación no encontrada o acceso denegado",
      });
    }

    logger.info(
      { conversacionId: req.params.id },
      "Historial de conversación actualizado",
    );

    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Error al actualizar conversación");
    res
      .status(500)
      .json({
        success: false,
        error: "Error interno al actualizar conversación. Intente nuevamente.",
      });
  }
});

// Elimina una conversación específica
router.delete("/:id", requireLogin, async (req, res) => {
  try {
    const conversacionId = req.params.id;
    const usuarioId = req.session.user.id;

    logger.debug(
      { conversacionId, usuarioId },
      "Intentando eliminar conversación",
    );

    // Verificar que la conversación existe y pertenece al usuario
    const checkResult = await queryWithRetry(
      "SELECT id FROM conversaciones WHERE id = $1 AND usuario_id = $2",
      [conversacionId, usuarioId],
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Conversación no encontrada o acceso denegado",
      });
    }

    // Eliminar la memoria del chat de n8n asociada a esta conversación
    await queryWithRetry("DELETE FROM n8n_chat_memory WHERE session_id = $1", [
      conversacionId.toString(),
    ]);
    logger.debug({ conversacionId }, "Memoria de chat n8n eliminada");

    // Eliminar la conversación
    await queryWithRetry(
      "DELETE FROM conversaciones WHERE id = $1 AND usuario_id = $2",
      [conversacionId, usuarioId],
    );

    logger.info({ conversacionId }, "Conversación eliminada correctamente");

    res.json({
      success: true,
      message: "Conversación eliminada correctamente",
      conversacionId,
    });
  } catch (err) {
    logger.error({ err }, "Error al eliminar conversación");
    res
      .status(500)
      .json({
        success: false,
        error: "Error interno al eliminar conversación. Intente nuevamente.",
      });
  }
});

module.exports = router;
