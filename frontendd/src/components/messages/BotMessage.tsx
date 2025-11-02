import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import MessageActions from "./MessageActions";
import MessageArtifacts from "./MessageArtifacts";
import MessageParameters from "./MessageParameters";
import MessageQuickActions from "./MessageQuickActions";
import { quickActions } from "../config/quickActions";
import { type QuickAction } from "../config/quickActions";
import type { Message } from "../../services/backendService";
import {
  isSystemMessage,
  formatMessageTimestamp,
  getQuotedSenderText,
} from "./utils/messageUtils";

interface BotMessageProps {
  message: Message;
  onFeedback?: (
    messageId: string,
    isHelpful: boolean,
    comment?: string
  ) => void;
  onQuickAction?: (action: QuickAction, message: Message) => void;
  onQuoteMessage?: (message: Message) => void;
  onViewMindMap?: (artifactData: unknown) => void;
}

/**
 * Componente para el mensaje citado
 */
interface QuotedMessageProps {
  message: Message;
}

const QuotedMessage: React.FC<QuotedMessageProps> = ({ message }) => {
  if (!message.quotedMessageId) return null;

  return (
    <div className="mb-2 px-3 py-2 rounded-lg border-l-2 text-xs bg-gray-100 border-gray-400 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-1.5 mb-1 font-medium">
        <i className="fas fa-reply text-xs"></i>
        <span>{getQuotedSenderText(message.quotedMessageSender)}</span>
      </div>
      <p className="line-clamp-2 opacity-80">
        {message.quotedMessageContent || "Contenido no disponible"}
      </p>
    </div>
  );
};

/**
 * Componente para el header del mensaje con timestamp y badges
 */
interface MessageHeaderProps {
  message: Message;
  isSystem: boolean;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({ message, isSystem }) => (
  <div className="flex items-center justify-between gap-2 mt-2">
    <p className="text-xs text-muted-foreground">
      {formatMessageTimestamp(message.timestamp)}
    </p>
    {isSystem && (
      <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full">
        Sistema
      </span>
    )}
  </div>
);

/**
 * Componente para las acciones del mensaje (solo para mensajes del bot)
 */
interface MessageActionsContainerProps {
  message: Message;
  onFeedback?: BotMessageProps["onFeedback"];
  onQuickAction?: BotMessageProps["onQuickAction"];
  onQuoteMessage?: BotMessageProps["onQuoteMessage"];
}

const MessageActionsContainer: React.FC<MessageActionsContainerProps> = ({
  message,
  onFeedback,
  onQuickAction,
  onQuoteMessage,
}) => (
  <div className="flex items-center gap-2">
    <MessageQuickActions
      message={message}
      onQuickAction={onQuickAction}
      onQuoteMessage={onQuoteMessage}
      quickActions={quickActions}
    />
    <MessageActions message={message} onFeedback={onFeedback} isUser={false} />
  </div>
);

export const BotMessage: React.FC<BotMessageProps> = ({
  message,
  onFeedback,
  onQuickAction,
  onQuoteMessage,
  onViewMindMap,
}) => {
  const systemMessage = isSystemMessage(message.content);

  return (
    <div className="flex gap-3 justify-start">
      <div className="max-w-[70%]">
        {/* Mensaje citado */}
        <QuotedMessage message={message} />

        <div className="p-3 rounded-tl-lg rounded-tr-lg rounded-br-md bg-muted">
          {/* Parámetros del mensaje */}
          <MessageParameters
            parameters={message.parameters || message.responseParameters}
            isUser={false}
          />

          {/* Contenido del mensaje */}
          <MarkdownRenderer content={message.content} />

          {/* Artefactos (documentos y mapas mentales) */}
          <MessageArtifacts
            documentLinks={message.documentLinks}
            artifact={message.artifact}
            artifactData={message.artifactData}
            onViewMindMap={onViewMindMap}
            isUser={false}
          />

          {/* Header del mensaje */}
          <MessageHeader message={message} isSystem={systemMessage} />

          {/* Acciones del mensaje - solo para mensajes que no son del sistema */}
          {!systemMessage && (
            <MessageActionsContainer
              message={message}
              onFeedback={onFeedback}
              onQuickAction={onQuickAction}
              onQuoteMessage={onQuoteMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};
