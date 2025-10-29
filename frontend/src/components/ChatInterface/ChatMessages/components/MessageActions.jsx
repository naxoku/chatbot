/**
 * Componente para mostrar las acciones del mensaje
 * Incluye botón copiar, quick actions y feedback
 */

import { useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import MessageQuickActions from "../../MessageQuickActions";
import { quickActions } from "../config/quickActions";

/**
 * Componente MessageActions
 * @param {Object} props - Props del componente
 * @param {Object} props.message - Objeto del mensaje
 * @param {Function} props.onFeedback - Handler para feedback
 * @param {Function} props.onQuickAction - Handler para acciones rápidas
 * @param {Function} props.onQuoteMessage - Handler para citar mensaje
 * @param {boolean} props.isUser - Si el mensaje es del usuario
 * @param {boolean} props.isDarkMode - Modo oscuro activado
 */
const MessageActions = ({ 
  message, 
  onFeedback, 
  onQuickAction, 
  onQuoteMessage, 
  isUser, 
  isDarkMode 
}) => {
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [feedbackStates, setFeedbackStates] = useState({});

  const feedbackState = feedbackStates[message.id];
  const isContext = message.isContext;

  const handleCopyMessage = async (content, messageId) => {
    try {
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

  // No mostrar acciones para mensajes de contexto
  if (isContext) {
    return null;
  }

  return (
    <>
      {/* Timestamp y acciones */}
      <div
        className={`text-xs mt-2 flex items-center gap-2 ${
          isUser
            ? "justify-end text-white/60"
            : isDarkMode
            ? "text-gray-500"
            : "text-gray-500"
        }`}
      >
        {/* Botón de copiar (solo para mensajes del bot) */}
        {!isUser && (
          <>
            <button
              onClick={() => handleCopyMessage(message.content, message.id)}
              className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}
              title="Copiar mensaje"
            >
              <i
                className={`fas ${
                  copiedMessageId === message.id
                    ? "fa-check"
                    : "fa-copy"
                } text-xs`}
              ></i>
            </button>
            <MessageQuickActions
              message={message}
              onQuickAction={onQuickAction}
              onQuoteMessage={onQuoteMessage}
              isDarkMode={isDarkMode}
              quickActions={quickActions}
            />
          </>
        )}
        <span>
          {message.timestamp
            ? new Date(message.timestamp).toLocaleTimeString(
                "es-CL",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
            : "Ahora"}
        </span>
      </div>

      {/* Feedback para mensajes del bot */}
      {!isUser &&
        message.feedbackRequested &&
        !feedbackState?.submitted && (
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`text-xs ${
                isDarkMode ? "text-gray-500" : "text-gray-500"
              }`}
            >
              ¿Útil?
            </span>
            <button
              onClick={() => handleFeedback(message.id, true)}
              className={`p-1.5 rounded hover:bg-green-500/10 transition-colors ${
                isDarkMode
                  ? "text-gray-500 hover:text-green-400"
                  : "text-gray-500 hover:text-green-600"
              }`}
            >
              <i className="fas fa-thumbs-up text-xs"></i>
            </button>
            <button
              onClick={() => handleFeedback(message.id, false)}
              className={`p-1.5 rounded hover:bg-red-500/10 transition-colors ${
                isDarkMode
                  ? "text-gray-500 hover:text-red-400"
                  : "text-gray-500 hover:text-red-600"
              }`}
            >
              <i className="fas fa-thumbs-down text-xs"></i>
            </button>
          </div>
        )}

      {/* Feedback enviado */}
      {!isUser && feedbackState?.submitted && (
        <div className="mt-2">
          <span
            className={`text-xs ${
              isDarkMode ? "text-gray-600" : "text-gray-500"
            }`}
          >
            <i className="fas fa-check text-xs mr-1"></i>
            Gracias por tu feedback
          </span>
        </div>
      )}
    </>
  );
};

export default MessageActions;