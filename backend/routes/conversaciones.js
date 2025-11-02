const express = require("express");
const { db, queryWithRetry } = require("../db");
const requireLogin = require("../middleware/auth");
const {
  normalizeMessages,
  validateChatHistory,
} = require("../middleware/normalizeMessages");

const router = express.Router();

// Obtener historial de conversaciones
router.get("/", requireLogin, async (req, res) => {
  try {
    const result = await queryWithRetry(
      "SELECT id, titulo, chat_history, mapas_mentales_ids, fecha_creacion FROM conversaciones WHERE usuario_id = $1 ORDER BY fecha_creacion DESC",
      [req.session.user.id]
    );

    // Normalizar mensajes en todas las conversaciones antes de enviar
    const conversacionesNormalizadas = result.rows.map((conv) => ({
      ...conv,
      chat_history: normalizeMessages(conv.chat_history || []),
    }));

    res.json({ success: true, conversaciones: conversacionesNormalizadas });
  } catch (err) {
    console.error("❌ Error al obtener conversaciones:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener una conversación específica
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const result = await queryWithRetry(
      "SELECT id, titulo, chat_history, mapas_mentales_ids, fecha_creacion FROM conversaciones WHERE id = $1 AND usuario_id = $2",
      [req.params.id, req.session.user.id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Conversación no encontrada" });
    }

    // Normalizar mensajes antes de enviar
    const conversacion = {
      ...result.rows[0],
      chat_history: normalizeMessages(result.rows[0].chat_history || []),
    };

    res.json({ success: true, conversacion });
  } catch (err) {
    console.error("❌ Error al obtener conversación:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Guardar conversación
router.post("/", requireLogin, async (req, res) => {
  const { chat_history, titulo, mapas_mentales_ids } = req.body;

  try {
    // ✅ Normalizar mensajes antes de guardar
    const normalizedChatHistory = normalizeMessages(chat_history || []);

    // Validar que la estructura sea correcta
    if (!validateChatHistory(normalizedChatHistory)) {
      console.error(
        "❌ Chat history con formato inválido:",
        normalizedChatHistory
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
      ]
    );

    console.log(`✅ Conversación creada: ID ${result.rows[0].id}`);

    res.json({ success: true, conversacion: result.rows[0] });
  } catch (err) {
    console.error("❌ Error al guardar conversación:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Actualizar conversación existente
router.put("/:id", requireLogin, async (req, res) => {
  const { chat_history, mapas_mentales_ids, titulo } = req.body;

  try {
    // ✅ Normalizar mensajes antes de actualizar
    const normalizedChatHistory = normalizeMessages(chat_history || []);

    // Validar que la estructura sea correcta
    if (!validateChatHistory(normalizedChatHistory)) {
      console.error(
        "❌ Chat history con formato inválido:",
        normalizedChatHistory
      );
      return res.status(400).json({
        success: false,
        error: "Formato de chat_history inválido",
      });
    }

    const result = await queryWithRetry(
      `UPDATE conversaciones
       SET chat_history = $1,
           mapas_mentales_ids = $2,
           titulo = $3
       WHERE id = $4 AND usuario_id = $5
       RETURNING *`,
      [
        JSON.stringify(normalizedChatHistory),
        JSON.stringify(mapas_mentales_ids || []),
        titulo,
        req.params.id,
        req.session.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Conversación no encontrada o no autorizada",
      });
    }

    console.log(`✅ Conversación actualizada: ID ${req.params.id}`);

    res.json({ success: true, conversacion: result.rows[0] });
  } catch (err) {
    console.error("❌ Error al actualizar conversación:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Eliminar conversación
router.delete("/:id", requireLogin, async (req, res) => {
  try {
    const conversacionId = req.params.id;
    const usuarioId = req.session.user.id;

    console.log(
      `🗑️ Intentando eliminar conversación ${conversacionId} del usuario ${usuarioId}`
    );

    // Verificar que la conversación existe y pertenece al usuario
    const checkResult = await queryWithRetry(
      "SELECT id FROM conversaciones WHERE id = $1 AND usuario_id = $2",
      [conversacionId, usuarioId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Conversación no encontrada o no autorizada",
      });
    }

    // Eliminar la conversación
    await queryWithRetry(
      "DELETE FROM conversaciones WHERE id = $1 AND usuario_id = $2",
      [conversacionId, usuarioId]
    );

    console.log(`✅ Conversación ${conversacionId} eliminada correctamente`);

    res.json({
      success: true,
      message: "Conversación eliminada correctamente",
      conversacionId,
    });
  } catch (err) {
    console.error("❌ Error al eliminar conversación:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
