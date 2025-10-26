import { useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { getDocumentIcon, getDocumentColor } from "../../utils/documentUtils";
import MessageQuickActions from "./MessageQuickActions";

// Configurar marked para mejor renderizado
marked.setOptions({
  breaks: true,
  gfm: true,
});

const ChatMessages = ({
  messages = [],
  isTyping,
  isLoadingMessages = false,
  onFeedback,
  isDarkMode,
  onViewMindMap,
  onQuickAction,
  onQuoteMessage,
}) => {
  const [feedbackStates, setFeedbackStates] = useState({});
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // QuickActions disponibles para cada mensaje
  const quickActions = [
    {
      id: "resumen",
      text: "Resumir mensaje",
      icon: "fas fa-compress-alt",
      color: "blue",
      description: "Crear un resumen del contenido del mensaje",
    },
    {
      id: "explicar",
      text: "Explicar mejor",
      icon: "fas fa-graduation-cap",
      color: "green",
      description: "Solicitar una explicación más detallada",
    },
    {
      id: "ejemplo",
      text: "Dar ejemplo",
      icon: "fas fa-lightbulb",
      color: "yellow",
      description: "Pedir ejemplos prácticos relacionados",
    },
    {
      id: "mapa-mental",
      text: "Generar mapa mental",
      icon: "fas fa-project-diagram",
      color: "teal",
      description: "Crear un mapa mental del contenido del mensaje",
      generatesArtifact: true,
    },
  ];

  const handleFeedback = (messageId, isHelpful, comment = "") => {
    setFeedbackStates((prev) => ({
      ...prev,
      [messageId]: { submitted: true, isHelpful },
    }));
    if (onFeedback) {
      onFeedback(messageId, isHelpful, comment);
    }
  };

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

  // Componente de Skeleton para mensajes cargando
  const SkeletonMessage = () => (
    <div className="flex justify-start mb-3">
      <div className="flex max-w-[85%]">
        {/* Mensaje skeleton */}
        <div
          className={`rounded-lg px-3 py-2 space-y-2 w-96 ${
            isDarkMode ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <div
            className={`h-3 rounded animate-pulse ${
              isDarkMode ? "bg-gray-700" : "bg-gray-300"
            }`}
            style={{ width: "90%" }}
          />
          <div
            className={`h-3 rounded animate-pulse ${
              isDarkMode ? "bg-gray-700" : "bg-gray-300"
            }`}
            style={{ width: "75%" }}
          />
          <div
            className={`h-3 rounded animate-pulse ${
              isDarkMode ? "bg-gray-700" : "bg-gray-300"
            }`}
            style={{ width: "85%" }}
          />
        </div>
      </div>
    </div>
  );

  const renderMessage = (message, index) => {
    const isUser = message.sender === "user";
    const isContext = message.isContext;
    const feedbackState = feedbackStates[message.id];

    return (
      <div
        key={message.id || index}
        className={`flex ${
          isUser ? "justify-end" : "justify-start"
        } mb-3 group`}
      >
        <div
          className={`flex max-w-[85%] ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {/* Mensaje */}
          <div className="flex-1 min-w-0">
            {/* Indicador de mensaje citado */}
            {message.quotedMessageId && (
              <div
                className={`mb-2 px-3 py-2 rounded-lg border-l-2 text-xs ${
                  isUser
                    ? isDarkMode
                      ? "bg-blue-900/20 border-blue-500 text-blue-300"
                      : "bg-blue-50 border-blue-400 text-blue-700"
                    : isDarkMode
                    ? "bg-gray-800 border-gray-600 text-gray-400"
                    : "bg-gray-100 border-gray-400 text-gray-600"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-medium">
                  <i className="fas fa-reply text-xs"></i>
                  <span>
                    {message.quotedMessageSender === "user"
                      ? "Tú"
                      : "Asistente"}
                  </span>
                </div>
                <p className="line-clamp-2 opacity-80">
                  {message.quotedMessageContent || "Contenido no disponible"}
                </p>
              </div>
            )}

            <div
              className={`rounded-lg px-3 py-2 ${
                isContext
                  ? isDarkMode
                    ? "bg-gray-800/50 text-gray-500 italic"
                    : "bg-gray-100 text-gray-500 italic"
                  : isUser
                  ? isDarkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : isDarkMode
                  ? "bg-gray-800 text-gray-100"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {/* Parámetros (no para mensajes de contexto) */}
              {!isContext &&
                (message.parameters || message.responseParameters) && (
                  <div
                    className={`mb-2 pb-2 border-b ${
                      isUser
                        ? "border-white/10"
                        : isDarkMode
                        ? "border-gray-700"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {(message.parameters || message.responseParameters).map(
                        (param) => {
                          const paramLabels = {
                            resumen: {
                              label: "Resumir",
                              icon: "fas fa-compress-alt",
                            },
                            detallado: {
                              label: "Explicar mejor",
                              icon: "fas fa-expand-alt",
                            },
                            ejemplo: {
                              label: "Dar ejemplo",
                              icon: "fas fa-lightbulb",
                            },
                            mapa_mental: {
                              label: "Mapa Mental",
                              icon: "fas fa-project-diagram",
                            },
                          };
                          const paramInfo = paramLabels[param] || {
                            label: param,
                            icon: "fas fa-tag",
                          };

                          return (
                            <span
                              key={param}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                                isUser
                                  ? "bg-white/20 text-white"
                                  : isDarkMode
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              <i className={`${paramInfo.icon} text-xs`}></i>
                              <span>{paramInfo.label}</span>
                            </span>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

              {/* Contenido del mensaje con estilos mejorados para markdown */}
              <div
                className="message-content"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(marked.parse(message.content)),
                }}
              />

              {!isContext &&
                message.documentLinks &&
                message.documentLinks.length > 0 && (
                  <div
                    className={`mt-3 pt-3 border-t ${
                      isUser
                        ? "border-white/10"
                        : isDarkMode
                        ? "border-gray-700"
                        : "border-gray-200"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium mb-2.5 flex items-center gap-1.5 ${
                        isUser
                          ? "text-white/80"
                          : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      <i className="fas fa-paperclip"></i>
                      Documentos relacionados
                    </p>
                    <div className="space-y-2">
                      {message.documentLinks.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`group/doc flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            isDarkMode
                              ? "border-gray-700 hover:border-gray-600 bg-gray-900/30 hover:bg-gray-900/50"
                              : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getDocumentColor(
                              doc.type
                            )}`}
                          >
                            <i
                              className={`${getDocumentIcon(doc.url)} text-sm`}
                            ></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-medium text-sm mb-0.5 line-clamp-1 ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {doc.title}
                            </h3>
                            {doc.description && (
                              <p
                                className={`text-xs line-clamp-1 ${
                                  isDarkMode ? "text-gray-500" : "text-gray-500"
                                }`}
                              >
                                {doc.description}
                              </p>
                            )}
                          </div>
                          <i
                            className={`fas fa-arrow-right text-xs transition-transform group-hover/doc:translate-x-0.5 ${
                              isDarkMode ? "text-gray-600" : "text-gray-400"
                            }`}
                          ></i>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {!isContext && message.artifact && message.artifactData && (
                <div
                  className={`mt-3 p-3 rounded-lg border transition-all ${
                    isDarkMode
                      ? "border-purple-800/30 bg-purple-900/10 hover:bg-purple-900/20"
                      : "border-purple-200 bg-purple-50 hover:bg-purple-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
                        }`}
                      >
                        <i
                          className={`fas fa-project-diagram text-sm ${
                            isDarkMode ? "text-purple-400" : "text-purple-600"
                          }`}
                        ></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-purple-300" : "text-purple-700"
                          }`}
                        >
                          Mapa Mental
                        </p>
                        <p
                          className={`text-xs ${
                            isDarkMode
                              ? "text-purple-400/60"
                              : "text-purple-600/60"
                          }`}
                        >
                          Visualización generada
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onViewMindMap(message.artifactData)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        isDarkMode
                          ? "bg-purple-900/30 text-purple-300 hover:bg-purple-900/50"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      <span>Ver Mapa</span>
                      <i className="fas fa-arrow-right text-xs"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Timestamp (no para mensajes de contexto) */}
              {!isContext && (
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
                        onClick={() =>
                          handleCopyMessage(message.content, message.id)
                        }
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
              )}
            </div>

            {/* Feedback para mensajes del bot (no para mensajes de contexto) */}
            {!isUser &&
              !isContext &&
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

            {/* Feedback enviado (no para mensajes de contexto) */}
            {!isUser && !isContext && feedbackState?.submitted && (
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
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Estado vacío */}
      {messages.length === 0 && !isTyping && (
        <div
          className={`text-center py-20 ${
            isDarkMode ? "text-gray-500" : "text-gray-500"
          }`}
        >
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDarkMode ? "bg-gray-800" : "bg-gray-200"
            }`}
          >
            <i className="fas fa-comments text-2xl"></i>
          </div>
          <h3
            className={`text-xl font-medium mb-1 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            ¿En qué puedo ayudarte?
          </h3>
          <p className="text-sm">Escribe tu pregunta para comenzar</p>
        </div>
      )}

      {messages.map((message, index) => renderMessage(message, index))}

      {isLoadingMessages && <SkeletonMessage />}

      {isTyping && !isLoadingMessages && (
        <div className="flex justify-start mb-3">
          <div className="flex max-w-[85%]">
            <div
              className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                isDarkMode ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                  isDarkMode ? "bg-gray-400" : "bg-gray-500"
                }`}
                style={{ animationDelay: "0s", animationDuration: "1s" }}
              ></div>
              <div
                className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                  isDarkMode ? "bg-gray-400" : "bg-gray-500"
                }`}
                style={{ animationDelay: "0.2s", animationDuration: "1s" }}
              ></div>
              <div
                className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                  isDarkMode ? "bg-gray-400" : "bg-gray-500"
                }`}
                style={{ animationDelay: "0.4s", animationDuration: "1s" }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
