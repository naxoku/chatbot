/**
 * Hook personalizado para manejar las acciones de mensajes
 * Incluye lógica de feedback, copiar, etc.
 */

import { useState } from "react";

/**
 * Hook useMessageActions
 * @param {Function} props.onFeedback - Handler externo para feedback
 * @returns {Object} - Estado y handlers para acciones de mensaje
 */
export const useMessageActions = (onFeedback) => {
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [feedbackStates, setFeedbackStates] = useState({});

  const handleCopyMessage = async (content, messageId) => {
    try {
      // Importar dinámicamente para evitar dependencias circulares
      const { marked } = await import("marked");
      const DOMPurify = (await import("dompurify")).default;
      
      // Limpiar el contenido markdown para copiar texto plano
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = DOMPurify.sanitize(marked.parse(content));
      const plainText = tempDiv.textContent || tempDiv.innerText;

      await navigator.clipboard.writeText(plainText);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const handleFeedback = (messageId, isHelpful, comment = "") => {
    setFeedbackStates((prev) => ({
      ...prev,
      [messageId]: { submitted: true, isHelpful },
    }));
    if (onFeedback) {
      onFeedback(messageId, isHelpful, comment);
    }
  };

  return {
    // Estado
    copiedMessageId,
    feedbackStates,
    
    // Handlers
    handleCopyMessage,
    handleFeedback,
  };
};