const { nanoid } = require("nanoid");

/**
 * Normaliza mensajes de diferentes formatos a un formato estándar
 * Soporta tanto el formato con 'role' (n8n) como 'sender' (frontend)
 *
 * @param {Array} messages - Array de mensajes en cualquier formato
 * @returns {Array} - Array de mensajes normalizados con estructura estándar
 */
function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    console.error(
      "❌ normalizeMessages recibió datos inválidos:",
      typeof messages
    );
    return [];
  }

  return messages.map((msg) => {
    // Si ya tiene el formato correcto, retornarlo tal cual
    if (msg.sender && msg.id) {
      return msg;
    }

    // Convertir formato 'role' (n8n) a formato 'sender' (estándar)
    if (msg.role) {
      const normalizedMsg = {
        id: msg.id || nanoid(),
        sender: msg.role === "assistant" ? "bot" : "user",
        content: msg.content || "",
        timestamp: msg.timestamp || new Date().toISOString(),
      };

      // Preservar campos adicionales si existen
      if (msg.feedbackRequested !== undefined) {
        normalizedMsg.feedbackRequested = msg.feedbackRequested;
      }
      if (msg.documentLinks) {
        normalizedMsg.documentLinks = msg.documentLinks;
      }
      if (msg.artifact !== undefined) {
        normalizedMsg.artifact = msg.artifact;
      }
      if (msg.artifactData) {
        normalizedMsg.artifactData = msg.artifactData;
      }
      if (msg.quotedMessageId) {
        normalizedMsg.quotedMessageId = msg.quotedMessageId;
      }
      if (msg.quotedMessageContent) {
        normalizedMsg.quotedMessageContent = msg.quotedMessageContent;
      }

      return normalizedMsg;
    }

    // Si no tiene ni 'role' ni 'sender', intentar construir un mensaje válido
    console.warn("⚠️ Mensaje con formato desconocido:", msg);
    return {
      id: msg.id || nanoid(),
      sender: msg.sender || "user",
      content: msg.content || "",
      timestamp: msg.timestamp || new Date().toISOString(),
    };
  });
}

/**
 * Valida que un chat_history tenga la estructura correcta
 *
 * @param {Array} chatHistory - Array de mensajes a validar
 * @returns {boolean} - true si es válido, false si no
 */
function validateChatHistory(chatHistory) {
  if (!Array.isArray(chatHistory)) {
    return false;
  }

  return chatHistory.every(
    (msg) => msg.id && msg.sender && msg.content !== undefined && msg.timestamp
  );
}

module.exports = {
  normalizeMessages,
  validateChatHistory,
};
