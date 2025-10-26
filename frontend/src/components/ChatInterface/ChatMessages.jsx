import { useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { getDocumentIcon, getDocumentColor } from "../../utils/documentUtils";

// Configurar marked para mejor renderizado
marked.setOptions({
  breaks: true,
  gfm: true,
});

const ChatMessages = ({
  messages = [],
  isTyping,
  onFeedback,
  isDarkMode,
  onViewMindMap,
}) => {
  const [feedbackStates, setFeedbackStates] = useState({});
  const [copiedMessageId, setCopiedMessageId] = useState(null);

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
    <div className="flex justify-start mb-6">
      <div className="flex max-w-[85%]">
        {/* Avatar skeleton */}
        <div className="flex-shrink-0 mr-3">
          <div
            className={`w-8 h-8 rounded-full animate-pulse ${
              isDarkMode ? "bg-gray-700" : "bg-gray-300"
            }`}
          />
        </div>

        {/* Mensaje skeleton */}
        <div
          className={`rounded-2xl px-4 py-3 space-y-3 w-96 ${
            isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-100"
          }`}
        >
          <div
            className={`h-4 rounded animate-pulse ${
              isDarkMode ? "bg-gray-700" : "bg-gray-300"
            }`}
            style={{ width: "90%" }}
          />
          <div
            className={`h-4 rounded animate-pulse ${
              isDarkMode ? "bg-gray-700" : "bg-gray-300"
            }`}
            style={{ width: "75%" }}
          />
          <div
            className={`h-4 rounded animate-pulse ${
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
    const feedbackState = feedbackStates[message.id];
    const isCopied = copiedMessageId === message.id;

    return (
      <div
        key={message.id || index}
        className={`flex ${
          isUser ? "justify-end" : "justify-start"
        } mb-6 group`}
      >
        <div
          className={`flex max-w-[85%] ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {/* Avatar */}
          <div className={`flex-shrink-0 ${isUser ? "ml-3" : "mr-3"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isUser
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"
                  : isDarkMode
                  ? "bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg shadow-purple-600/30"
                  : "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30"
              }`}
            >
              <i
                className={`${
                  isUser ? "fas fa-user" : "fas fa-robot"
                } text-sm text-white`}
              ></i>
            </div>
          </div>

          {/* Mensaje */}
          <div className="flex-1 min-w-0">
            <div
              className={`rounded-2xl px-4 py-3 relative ${
                isUser
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : isDarkMode
                  ? "bg-gray-800 text-gray-100 border border-gray-700"
                  : "bg-white text-gray-900 border border-gray-200 shadow-sm"
              }`}
            >
              {/* Botón de copiar (solo para mensajes del bot) */}
              {!isUser && (
                <button
                  onClick={() => handleCopyMessage(message.content, message.id)}
                  className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-lg ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  }`}
                  title="Copiar mensaje"
                >
                  <i
                    className={`fas ${
                      isCopied ? "fa-check" : "fa-copy"
                    } text-xs`}
                  ></i>
                </button>
              )}

              {/* Parámetros */}
              {(message.parameters || message.responseParameters) && (
                <div
                  className={`mb-3 pb-3 border-b ${
                    isUser
                      ? "border-white/20"
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
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                              isUser
                                ? "bg-white/20 text-white"
                                : isDarkMode
                                ? "bg-gray-700/50 text-gray-300"
                                : "bg-gray-100 text-gray-700"
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
                className={`message-content ${
                  isUser
                    ? "text-white"
                    : isDarkMode
                    ? "text-gray-100"
                    : "text-gray-900"
                }`}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(marked.parse(message.content)),
                }}
              />

              {/* Enlaces de documentos */}
              {message.documentLinks && message.documentLinks.length > 0 && (
                <div
                  className={`mt-4 pt-4 border-t ${
                    isUser
                      ? "border-white/20"
                      : isDarkMode
                      ? "border-gray-700"
                      : "border-gray-200"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold mb-3 flex items-center gap-2 ${
                      isUser
                        ? "text-white/90"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    <i className="fas fa-paperclip"></i>
                    Documentos relacionados:
                  </p>
                  <div className="space-y-2">
                    {message.documentLinks.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block p-3 rounded-xl border transition-all duration-200 hover:shadow-lg group/doc ${
                          isDarkMode
                            ? "border-gray-700 hover:border-purple-600 bg-gray-700/30 hover:bg-gray-700/50"
                            : "border-gray-200 hover:border-purple-300 bg-gray-50 hover:bg-purple-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
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
                              className={`font-medium text-sm mb-1 line-clamp-1 ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {doc.title}
                            </h3>
                            {doc.description && (
                              <p
                                className={`text-xs mb-2 line-clamp-2 ${
                                  isDarkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                {doc.description}
                              </p>
                            )}
                            <span
                              className={`inline-block text-xs px-2 py-0.5 rounded-md ${
                                isDarkMode
                                  ? "bg-gray-600 text-gray-300"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {doc.type}
                            </span>
                          </div>
                          <i
                            className={`fas fa-external-link-alt text-xs transition-transform duration-200 group-hover/doc:translate-x-1 group-hover/doc:-translate-y-1 ${
                              isDarkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          ></i>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Artifact (mapa mental) */}
              {message.artifact && message.artifactData && (
                <div
                  className={`mt-4 p-3 rounded-xl border ${
                    isDarkMode
                      ? "border-purple-800/50 bg-purple-900/20"
                      : "border-purple-200 bg-purple-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isDarkMode ? "bg-purple-900/50" : "bg-purple-100"
                        }`}
                      >
                        <i className="fas fa-project-diagram text-sm text-purple-500"></i>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          isDarkMode ? "text-purple-300" : "text-purple-700"
                        }`}
                      >
                        Mapa Mental Generado
                      </span>
                    </div>
                    <button
                      onClick={() => onViewMindMap(message.artifactData)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                        isDarkMode
                          ? "bg-purple-900/50 text-purple-300 hover:bg-purple-900/70"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      <span>Ver Mapa</span>
                      <i className="fas fa-arrow-right text-xs"></i>
                    </button>
                  </div>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-purple-400/80" : "text-purple-600/80"
                    }`}
                  >
                    Se ha creado un mapa mental basado en el contexto. Haz clic
                    en "Ver Mapa" para explorarlo.
                  </p>
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`text-xs mt-3 flex items-center gap-1.5 ${
                  isUser
                    ? "justify-end text-white/70"
                    : isDarkMode
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                <i className="far fa-clock text-xs"></i>
                <span>
                  {message.timestamp
                    ? new Date(message.timestamp).toLocaleTimeString("es-CL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Ahora"}
                </span>
              </div>
            </div>

            {/* Feedback para mensajes del bot */}
            {!isUser &&
              message.feedbackRequested &&
              !feedbackState?.submitted && (
                <div className="mt-3 ml-2">
                  <p
                    className={`text-xs font-medium mb-2 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    ¿Te fue útil esta respuesta?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFeedback(message.id, true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        isDarkMode
                          ? "bg-green-900/20 text-green-400 hover:bg-green-900/40 border border-green-800/50"
                          : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                      }`}
                    >
                      <i className="fas fa-thumbs-up"></i>
                      <span>Sí</span>
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, false)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        isDarkMode
                          ? "bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-800/50"
                          : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                      }`}
                    >
                      <i className="fas fa-thumbs-down"></i>
                      <span>No</span>
                    </button>
                  </div>
                </div>
              )}

            {/* Feedback enviado */}
            {!isUser && feedbackState?.submitted && (
              <div className="mt-3 ml-2">
                <div
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                    isDarkMode
                      ? "bg-gray-800/50 text-gray-400"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <i
                    className={`fas ${
                      feedbackState.isHelpful
                        ? "fa-check-circle text-green-500"
                        : "fa-info-circle text-blue-500"
                    }`}
                  ></i>
                  <span>Gracias por tu feedback</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Estado vacío */}
      {messages.length === 0 && !isTyping && (
        <div
          className={`text-center py-16 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <div
            className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
              isDarkMode
                ? "bg-gradient-to-br from-purple-900/30 to-blue-900/30"
                : "bg-gradient-to-br from-purple-100 to-blue-100"
            }`}
          >
            <i
              className={`fas fa-comments text-4xl ${
                isDarkMode ? "text-purple-400" : "text-purple-600"
              }`}
            ></i>
          </div>
          <h3
            className={`text-2xl font-semibold mb-2 ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            ¡Hola! 👋
          </h3>
          <p className="text-lg mb-1">¿En qué puedo ayudarte hoy?</p>
          <p className="text-sm opacity-75">
            Selecciona una acción rápida o escribe tu pregunta
          </p>
        </div>
      )}

      {/* Renderizar mensajes */}
      {messages.map((message, index) => renderMessage(message, index))}

      {/* Skeleton loading mientras escribe */}
      {isTyping && <SkeletonMessage />}
    </div>
  );
};

export default ChatMessages;
