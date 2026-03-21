/**
 * Utilidades para normalizar y validar mensajes de chat.
 * Convierte formatos heterogéneos a una estructura estándar.
 */

const { nanoid } = require("nanoid");
const { logger } = require("../logger");

// Normaliza mensajes de diferentes formatos a una estructura estándar interna
function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    logger.error(
      { type: typeof messages },
      "normalizeMessages recibió datos inválidos",
    );
    return [];
  }

  return messages.map((msg) => {
    // Verificar si ya tiene el formato correcto básico
    if (msg.sender && (msg.id || msg.id === null)) {
      // Si id es null, asignar uno nuevo pero no mostrar warning
      if (msg.id === null) {
        return {
          ...msg,
          id: nanoid(),
          content: msg.content || "",
        };
      }
      // Retornar el mensaje completo preservando todos los campos (artifact, artifactData, etc.)
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

    // Solo mostrar warning para mensajes con formato realmente desconocido
    if (!msg.sender && !msg.role) {
      logger.warn({ msg }, "Mensaje con formato desconocido");
    }

    return {
      id: msg.id || nanoid(),
      sender: msg.sender || "user",
      content: msg.content || "",
      timestamp: msg.timestamp || new Date().toISOString(),
    };
  });
}

// Valida que un historial de chat tenga la estructura requerida
function validateChatHistory(chatHistory) {
  if (!Array.isArray(chatHistory)) {
    return false;
  }

  return chatHistory.every(
    (msg) => msg.id && msg.sender && msg.content !== undefined && msg.timestamp,
  );
}

module.exports = {
  normalizeMessages,
  validateChatHistory,
};
