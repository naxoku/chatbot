import React from "react";
import { Copy, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import type { Message } from "../../services/backendService";
import { useCopyToClipboard } from "./hooks/useCopyToClipboard";
import { useMessageFeedback } from "./hooks/useMessageFeedback";

/**
 * Componente para mostrar las acciones del mensaje
 * Incluye botón copiar y feedback (SIN timestamp, se maneja en el componente padre)
 */
interface MessageActionsProps {
  message: Message;
  onFeedback?: (
    messageId: string,
    isHelpful: boolean,
    comment?: string
  ) => void;
  isUser: boolean;
}

/**
 * Componente para el botón de copiar
 */
interface CopyButtonProps {
  content: string;
  messageId: string;
  isCopied: boolean;
  onCopy: (content: string, messageId: string) => Promise<void>;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  content,
  messageId,
  isCopied,
  onCopy,
}) => (
  <button
    onClick={() => onCopy(content, messageId)}
    className="p-1.5 rounded-md transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:bg-accent/50"
    title={isCopied ? "Copiado" : "Copiar mensaje"}
    aria-label={isCopied ? "Copiado al portapapeles" : "Copiar al portapapeles"}
  >
    {isCopied ? (
      <Check className="w-3.5 h-3.5 text-green-500" />
    ) : (
      <Copy className="w-3.5 h-3.5" />
    )}
  </button>
);

/**
 * Componente para los botones de feedback
 */
interface FeedbackButtonsProps {
  messageId: string;
  onFeedback: (messageId: string, isHelpful: boolean, comment?: string) => void;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  messageId,
  onFeedback,
}) => (
  <>
    <button
      onClick={() => onFeedback(messageId, true)}
      className="p-1.5 rounded-md transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:bg-accent/50"
      title="Útil"
      aria-label="Marcar como útil"
    >
      <ThumbsUp className="w-3.5 h-3.5" />
    </button>
    <button
      onClick={() => onFeedback(messageId, false)}
      className="p-1.5 rounded-md transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:bg-accent/50"
      title="No útil"
      aria-label="Marcar como no útil"
    >
      <ThumbsDown className="w-3.5 h-3.5" />
    </button>
  </>
);

/**
 * Componente para mostrar el estado de feedback enviado
 */
const FeedbackSubmittedIndicator: React.FC<{ isHelpful?: boolean }> = ({
  isHelpful,
}) => (
  <span className="text-xs text-muted-foreground">
    <Check className="w-3 h-3 inline mr-1" />
    {isHelpful ? "Marcado como útil" : "Feedback enviado"}
  </span>
);

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onFeedback,
  isUser,
}) => {
  // Usar hooks personalizados para lógica de estado
  const { copiedMessageId, copyToClipboard } = useCopyToClipboard();
  const { getFeedbackState, handleFeedback } = useMessageFeedback(onFeedback);

  const feedbackState = getFeedbackState(message.id);
  const isContext = message.isContext;
  const isCopied = copiedMessageId === message.id;

  // No mostrar acciones para mensajes de contexto
  if (isContext) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {/* Botón de copiar (para todos los mensajes) */}
      <CopyButton
        content={message.content}
        messageId={message.id}
        isCopied={isCopied}
        onCopy={copyToClipboard}
      />

      {/* Feedback solo para mensajes del bot */}
      {!isUser && message.feedbackRequested && !feedbackState?.submitted && (
        <FeedbackButtons messageId={message.id} onFeedback={handleFeedback} />
      )}

      {/* Feedback enviado solo para mensajes del bot */}
      {!isUser && feedbackState?.submitted && (
        <FeedbackSubmittedIndicator isHelpful={feedbackState.isHelpful} />
      )}
    </div>
  );
};

export default MessageActions;
