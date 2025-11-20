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
      <div className="flex justify-center px-2">
        <div className="w-full max-w-4xl">
          <div className="flex gap-3 justify-start">
            <div className="w-full md:max-w-[70%]">
              {/* Mensaje citado */}
              <QuotedMessage message={message} />

              <style>{`
                /* Estilo minimalista inspirado en Google NotebookLM con modo oscuro */
                @keyframes gentle-wave {
                  0% {
                    transform: translateX(-100%);
                  }
                  100% {
                    transform: translateX(100%);
                  }
                }

                @keyframes subtle-fade {
                  0%, 100% {
                    opacity: 0.7;
                  }
                  50% {
                    opacity: 1;
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
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(
                    90deg,
                    transparent 0%,
                    oklch(0.78 0.14 85 / 0.3) 50%,
                    transparent 100%
                  );
                  animation: gentle-wave 2.5s ease-in-out infinite;
                  pointer-events: none;
                }

                .dark .mindmap-generating::before {
                  background: linear-gradient(
                    90deg,
                    transparent 0%,
                    oklch(0.95 0.03 85 / 0.4) 50%,
                    transparent 100%
                  );
                }

                .mindmap-content {
                  position: relative;
                  z-index: 1;
                }

                .mindmap-text {
                  animation: subtle-fade 2s ease-in-out infinite;
                }

                .mindmap-complete {
                  animation: mindmap-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes mindmap-enter {
                  0% {
                    opacity: 0;
                    transform: translateY(8px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>

              <div className="p-4 rounded-xl bg-sky-50 dark:bg-amber-950/20 border border-sky-200 dark:border-amber-800/50 mindmap-generating">
                <div className="flex items-center justify-center space-x-3 mindmap-content">
                  <div className="p-2 bg-sky-100 dark:bg-amber-900/40 rounded-lg">
                    <Brain className="w-5 h-5 text-sky-600 dark:text-amber-400" />
                  </div>
                  <span className="font-medium text-base text-sky-800 dark:text-amber-200 mindmap-text">
                    Generando mapa mental...
                  </span>
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

    // Extraer contexto del mensaje (primeros 50 caracteres del contenido)
    const contextText =
      message.content.substring(0, 50) +
      (message.content.length > 50 ? "..." : "");

    return (
      <div className="flex justify-center px-2">
        <div className="w-full max-w-4xl">
          <div className="flex gap-3 justify-start">
            <div className="w-full md:max-w-[70%]">
              {/* Mensaje citado */}
              <QuotedMessage message={message} />

              <div
                onClick={handleViewMindMap}
                className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-sky-200 dark:border-amber-800/50 cursor-pointer hover:border-sky-300 dark:hover:border-amber-700/70 hover:shadow-md transition-all duration-200 mindmap-complete group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-sky-100 dark:bg-amber-900/40 rounded-lg shrink-0">
                    <Brain className="w-5 h-5 text-sky-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-sky-800 dark:text-amber-200 truncate">
                      Mapa mental
                    </h3>
                    <p className="text-sm text-sky-600 dark:text-amber-400 truncate">
                      {contextText}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewMindMap();
                    }}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white text-sm font-medium rounded-lg shrink-0 transition-colors duration-200"
                  >
                    Ver
                  </button>
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
    <div role="log" className="flex justify-center px-2">
      <div className="w-full max-w-4xl">
        <div className="flex gap-3 justify-start">
          <div className="w-full md:max-w-[70%]">
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
