import React, { useState } from "react";
import { Copy, ThumbsUp, ThumbsDown, Check } from "lucide-react";

/**
 * Componente para mostrar las acciones del mensaje
 * Incluye botón copiar y feedback (SIN timestamp, se maneja en el componente padre)
 */
interface MessageActionsProps {
  message: any;
  onFeedback?: (
    messageId: string,
    isHelpful: boolean,
    comment?: string
  ) => void;
  isUser: boolean;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onFeedback,
  isUser,
}) => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [feedbackStates, setFeedbackStates] = useState<
    Record<string, { submitted: boolean; isHelpful: boolean }>
  >({});

  const feedbackState = feedbackStates[message.id];
  const isContext = message.isContext;

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      // Limpiar el contenido markdown para copiar texto plano
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/#{1,6}\s/g, "")
        .replace(/`(.*?)`/g, "$1");
      const plainText = tempDiv.textContent || tempDiv.innerText;

      await navigator.clipboard.writeText(plainText);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const handleFeedback = (
    messageId: string,
    isHelpful: boolean,
    comment = ""
  ) => {
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
    <div className="flex items-center gap-1">
      {/* Botón de copiar (solo para mensajes del bot) */}
      {!isUser && (
        <button
          onClick={() => handleCopyMessage(message.content, message.id)}
          className="p-1.5 rounded-md transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:bg-accent/50"
          title="Copiar mensaje"
        >
          {copiedMessageId === message.id ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {/* Feedback para mensajes del bot */}
      {!isUser && message.feedbackRequested && !feedbackState?.submitted && (
        <>
          <button
            onClick={() => handleFeedback(message.id, true)}
            className="p-1.5 rounded-md transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:bg-accent/50"
            title="Útil"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleFeedback(message.id, false)}
            className="p-1.5 rounded-md transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:bg-accent/50"
            title="No útil"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      {/* Feedback enviado */}
      {!isUser && feedbackState?.submitted && (
        <span className="text-xs text-muted-foreground">
          <Check className="w-3 h-3 inline mr-1" />
          Feedback enviado
        </span>
      )}
    </div>
  );
};

export default MessageActions;
