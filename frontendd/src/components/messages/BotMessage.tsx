import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import MessageActions from "./MessageActions";
import MessageArtifacts from "./MessageArtifacts";
import MessageParameters from "./MessageParameters";
import MessageQuickActions from "./MessageQuickActions";
import { quickActions } from "../config/quickActions";
import { type QuickAction } from "../config/quickActions";
import type { Message } from "../../services/backendService";
import { Brain } from "lucide-react";
import {
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
 * Componente para el header del mensaje con timestamp
 */
interface MessageHeaderProps {
  message: Message;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({ message }) => (
  <div className="flex items-center justify-end gap-2 mt-2">
    <p className="text-xs text-muted-foreground">
      {formatMessageTimestamp(message.timestamp)}
    </p>
  </div>
);

export const BotMessage: React.FC<BotMessageProps> = ({
  message,
  onFeedback,
  onQuickAction,
  onQuoteMessage,
  onViewMindMap,
}) => {
  // Detectar si es un mensaje de generación de mapa mental
  const isGeneratingMindMap =
    message.content === "Generando mapa mental..." && message.artifact;

  // Detectar si es un mensaje final de mapa mental generado
  const isMindMapGenerated =
    message.content === "Se ha generado un mapa mental." &&
    message.artifact &&
    message.artifactData;

  // Si es un mensaje de generación de mapa mental, mostrar diseño especial
  if (isGeneratingMindMap) {
    return (
      <div className="flex justify-center px-4">
        <div className="w-full max-w-4xl">
          <div className="flex gap-3 justify-start">
            <div className="w-full max-w-[70%]">
              {/* Mensaje citado */}
              <QuotedMessage message={message} />

              <style>{`
                @keyframes pulse-opacity {
                  0%, 100% {
                    opacity: 0.4;
                  }
                  50% {
                    opacity: 0.8;
                  }
                }
                .mindmap-generating {
                  position: relative;
                  overflow: hidden;
                }
                .mindmap-generating::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: linear-gradient(45deg, rgb(219 234 254), rgb(245 243 255), rgb(219 234 254));
                  background-size: 400% 400%;
                  animation: gradient-shift 3s ease-in-out infinite, pulse-opacity 2s ease-in-out infinite;
                  z-index: 0;
                  border-radius: inherit;
                }
                @media (prefers-color-scheme: dark) {
                  .mindmap-generating::before {
                    background: linear-gradient(45deg, rgb(37 99 235 / 0.3), rgb(147 51 234 / 0.3), rgb(37 99 235 / 0.3));
                  }
                }
                @keyframes gradient-shift {
                  0%, 100% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                }
              `}</style>

              <div className="p-4 rounded-tl-lg rounded-tr-lg rounded-br-md bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 dark:from-blue-950/30 dark:to-purple-950/30 dark:border-blue-800 mindmap-generating">
                <div className="relative z-10">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="flex items-center space-x-3">
                      <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <span className="text-lg font-medium text-gray-800 dark:text-gray-200">
                        Generando mapa mental...
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
                    Estamos creando un mapa mental basado en la conversación
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si es un mensaje final de mapa mental generado, mostrar diseño especial clickeable
  if (isMindMapGenerated) {
    const artifactData = message.artifactData as {
      name?: string;
      [key: string]: unknown;
    };
    const handleViewMindMap = () => {
      onViewMindMap?.(artifactData);
    };

    return (
      <div className="flex justify-center px-4">
        <div className="w-full max-w-4xl">
          <div className="flex gap-3 justify-start">
            <div className="w-full max-w-[70%]">
              {/* Mensaje citado */}
              <QuotedMessage message={message} />

              <div
                onClick={handleViewMindMap}
                className="p-4 rounded-tl-lg rounded-tr-lg rounded-br-md bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 dark:from-green-950/30 dark:to-blue-950/30 dark:border-green-800 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Brain className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Se ha generado un mapa mental
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {artifactData?.name || "Mapa Mental"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Visualización generada
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMindMap();
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    >
                      <span>Ver Mapa</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Diseño normal para otros mensajes
  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-4xl">
        <div className="flex gap-3 justify-start">
          <div className="w-full max-w-[70%]">
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
              />
              {/* Acciones horizontales debajo del mensaje */}
              <div className="flex items-center justify-between gap-2 mt-2">
                {/* Timestamp a la izquierda */}
                <MessageHeader message={message} />

                {/* Acciones en el centro-derecha */}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
