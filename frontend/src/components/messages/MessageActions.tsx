import React from "react";
import { Copy, Check, Reply } from "lucide-react";
import type { Message } from "../../services/backendService";
import { useCopyToClipboard } from "./hooks/useCopyToClipboard";

/**
 * Componente para mostrar las acciones del mensaje
 * Incluye botón copiar y responder (SIN timestamp, se maneja en el componente padre)
 */
interface MessageActionsProps {
  message: Message;
  isUser: boolean;
  onQuoteMessage?: (message: Message) => void;
  onFeedback?: (
    messageId: string,
    isHelpful: boolean,
    comment?: string,
  ) => void;
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
    className="rounded-lg border border-border/70 bg-background/80 p-1.5 transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:bg-accent/50"
    title={isCopied ? "Copiado" : "Copiar mensaje"}
    aria-label={isCopied ? "Copiado al portapapeles" : "Copiar al portapapeles"}
  >
    {isCopied ? (
      <Check className="h-3.5 w-3.5 text-green-500" />
    ) : (
      <Copy className="h-3.5 w-3.5" />
    )}
  </button>
);

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  isUser,
  onQuoteMessage,
}) => {
  // Usar hooks personalizados para lógica de estado
  const { copiedMessageId, copyToClipboard } = useCopyToClipboard();
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

      {/* Botón responder solo para mensajes del bot */}
      {!isUser && (
        <button
          onClick={() => onQuoteMessage?.(message)}
          className="rounded-lg border border-border/70 bg-background/80 p-1.5 text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground dark:hover:bg-accent/50"
          title="Responder"
          aria-label="Responder a este mensaje"
        >
          <Reply className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default MessageActions;
