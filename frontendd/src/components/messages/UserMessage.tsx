import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import MessageParameters from "./MessageParameters";
import MessageArtifacts from "./MessageArtifacts";
import MessageQuickActions from "./MessageQuickActions";
import { type QuickAction } from "../config/quickActions";
import type { Message } from "../../services/backendService";

interface UserMessageProps {
  message: Message;
  onQuoteMessage?: (message: Message) => void;
  onQuickAction?: (action: QuickAction, message: Message) => void;
  onViewMindMap?: (artifactData: unknown) => void;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  message,
  onQuoteMessage,
  onQuickAction,
  onViewMindMap,
}) => {
  const getMessageType = (content: string): "text" | "command" | "question" => {
    if (content.startsWith("/")) return "command";
    if (content.includes("?")) return "question";
    return "text";
  };

  const messageType = getMessageType(message.content);

  // Parámetros basados en el tipo de mensaje
  const parameters =
    messageType === "command"
      ? ["comando"]
      : messageType === "question"
      ? ["pregunta"]
      : undefined;

  return (
    <div className="flex gap-3 justify-end">
      <div className="max-w-[70%]">
        {/* Mensaje citado */}
        {message.quotedMessageId && (
          <div className="mb-2 px-3 py-2 rounded-lg border-l-2 text-xs bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-300">
            <div className="flex items-center gap-1.5 mb-1 font-medium">
              <i className="fas fa-reply text-xs"></i>
              <span>
                {message.quotedMessageSender === "user" ? "Tú" : "Asistente"}
              </span>
            </div>
            <p className="line-clamp-2 opacity-80">
              {message.quotedMessageContent || "Contenido no disponible"}
            </p>
          </div>
        )}

        <div className="p-3 rounded-tl-lg rounded-tr-lg rounded-bl-md bg-primary text-primary-foreground">
          {/* Parámetros del mensaje */}
          <MessageParameters parameters={parameters} isUser={true} />

          {/* Contenido del mensaje */}
          <MarkdownRenderer content={message.content} />

          {/* Artefactos (documentos y mapas mentales) */}
          <MessageArtifacts
            documentLinks={message.documentLinks}
            artifact={message.artifact}
            artifactData={message.artifactData}
            onViewMindMap={onViewMindMap}
            isUser={true}
          />

          <div className="flex items-center justify-between gap-2 mt-2">
            <p className="text-xs text-primary-foreground/70">
              {message.timestamp.toLocaleTimeString()}
            </p>
            <div className="flex items-center gap-2">
              {messageType !== "text" && (
                <span className="text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full">
                  {messageType === "command" ? "Comando" : "Pregunta"}
                </span>
              )}
              <MessageQuickActions
                message={message}
                onQuickAction={onQuickAction}
                onQuoteMessage={onQuoteMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
