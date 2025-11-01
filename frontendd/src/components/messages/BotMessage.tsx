import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import MessageActions from "./MessageActions";
import MessageArtifacts from "./MessageArtifacts";
import MessageParameters from "./MessageParameters";
import MessageQuickActions from "./MessageQuickActions";
import { quickActions } from "../config/quickActions";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  parameters?: string[];
  responseParameters?: string[];
  documentLinks?: Array<{
    url: string;
    title: string;
    description?: string;
    type?: string;
  }>;
  artifact?: any;
  artifactData?: any;
  quotedMessageId?: string;
  quotedMessageSender?: string;
  quotedMessageContent?: string;
  feedbackRequested?: boolean;
}

interface BotMessageProps {
  message: Message;
  onFeedback?: (
    messageId: string,
    isHelpful: boolean,
    comment?: string
  ) => void;
  onQuickAction?: (action: any, message: Message) => void;
  onQuoteMessage?: (message: Message) => void;
  onViewMindMap?: (artifactData: any) => void;
  isDarkMode?: boolean;
}

export const BotMessage: React.FC<BotMessageProps> = ({
  message,
  onFeedback,
  onQuickAction,
  onQuoteMessage,
  onViewMindMap,
  isDarkMode = false,
}) => {
  const isSystemMessage =
    message.content.includes("¡") || message.content.includes("Hola");

  return (
    <div className="flex gap-3 justify-start">
      <div className="max-w-[70%]">
        {/* Mensaje citado */}
        {message.quotedMessageId && (
          <div
            className={`mb-2 px-3 py-2 rounded-lg border-l-2 text-xs ${
              isDarkMode
                ? "bg-gray-800 border-gray-600 text-gray-400"
                : "bg-gray-100 border-gray-400 text-gray-600"
            }`}
          >
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

        <div className="p-3 rounded-tl-lg rounded-tr-lg rounded-br-md bg-muted">
          {/* Parámetros del mensaje */}
          <MessageParameters
            parameters={message.parameters || message.responseParameters}
            isUser={false}
            isDarkMode={isDarkMode}
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
            isDarkMode={isDarkMode}
          />

          <div className="flex items-center justify-between gap-2 mt-2">
            <p className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString()}
            </p>
            {isSystemMessage && (
              <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full">
                Sistema
              </span>
            )}

            {/* Acciones del mensaje */}
            {!isSystemMessage && (
              <div className="flex items-center gap-2">
                <MessageQuickActions
                  message={message}
                  onQuickAction={onQuickAction}
                  onQuoteMessage={onQuoteMessage}
                  quickActions={quickActions}
                />
                <MessageActions
                  message={message}
                  onFeedback={onFeedback}
                  isUser={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
