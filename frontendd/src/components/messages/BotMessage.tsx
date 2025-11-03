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
                @keyframes sky-pulse {
                  0%, 100% {
                    background-color: rgb(224 242 254);
                    box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4);
                  }
                  50% {
                    background-color: rgb(186 230 253);
                    box-shadow: 0 0 0 8px rgba(14, 165, 233, 0.1);
                  }
                }
                @keyframes mindmap-enter {
                  0% {
                    opacity: 0;
                    transform: scale(0.8) translateY(10px);
                  }
                  100% {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                  }
                }
                @keyframes content-fade {
                  0% {
                    opacity: 0.3;
                    transform: translateX(-10px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateX(0);
                  }
                }
                @media (prefers-color-scheme: dark) {
                  @keyframes sky-pulse-dark {
                    0%, 100% {
                      background-color: rgb(7 89 133 / 0.3);
                      box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.2);
                    }
                    50% {
                      background-color: rgb(12 74 110 / 0.5);
                      box-shadow: 0 0 0 8px rgba(14, 165, 233, 0.05);
                    }
                  }
                  .dark .mindmap-generating {
                    animation: sky-pulse-dark 2.5s ease-in-out infinite;
                  }
                }
                .mindmap-generating {
                  animation: sky-pulse 2.5s ease-in-out infinite;
                }
                .mindmap-complete {
                  animation: mindmap-enter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .mindmap-content-fade {
                  animation: content-fade 0.6s ease-out;
                }
              `}</style>

              <div className="p-3 rounded-full bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 mindmap-generating">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-2 bg-sky-100 dark:bg-sky-900/50 rounded-full animate-pulse">
                    <Brain className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <span className="font-medium text-sky-800 dark:text-sky-200 animate-pulse">
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
    const contextText = message.content.substring(0, 50) + (message.content.length > 50 ? "..." : "");

    return (
      <div className="flex justify-center px-2">
        <div className="w-full max-w-4xl">
          <div className="flex gap-3 justify-start">
            <div className="w-full md:max-w-[70%]">
              {/* Mensaje citado */}
              <QuotedMessage message={message} />

              <div
                onClick={handleViewMindMap}
                className="p-3 rounded-full bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 cursor-pointer hover:bg-sky-100 dark:hover:bg-sky-950/50 transition-all mindmap-complete"
              >
                <div className="flex items-center space-x-3 mindmap-content-fade">
                  <div className="p-2 bg-sky-100 dark:bg-sky-900/50 rounded-full shrink-0 transition-all duration-500 hover:rotate-12">
                    <Brain className="w-5 h-5 text-sky-600 dark:text-sky-400 transition-colors duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sky-800 dark:text-sky-200 truncate text-base transition-colors duration-300">
                      Mapa mental
                    </h3>
                    <p className="text-sm text-sky-600 dark:text-sky-400 truncate transition-colors duration-300">
                      {contextText}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewMindMap();
                    }}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-full shrink-0 transition-all duration-300 hover:scale-110 hover:shadow-md"
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
    <div className="flex justify-center px-2">
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
