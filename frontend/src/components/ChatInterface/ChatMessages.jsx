import { useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { getDocumentIcon, getDocumentColor } from "../../utils/documentUtils";

const ChatMessages = ({
  messages = [],
  isTyping,
  onFeedback,
  isDarkMode,
  onViewMindMap,
}) => {
  // Añadir onViewMindMap
  const [feedbackStates, setFeedbackStates] = useState({});

  const handleFeedback = (messageId, isHelpful, comment = "") => {
    setFeedbackStates((prev) => ({
      ...prev,
      [messageId]: { submitted: true, isHelpful },
    }));
    if (onFeedback) {
      onFeedback(messageId, isHelpful, comment);
    }
  };

  const renderMessage = (message, index) => {
    const isUser = message.sender === "user";
    const feedbackState = feedbackStates[message.id];

    return (
      <div
        key={message.id || index}
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}
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
                  ? isDarkMode
                    ? "bg-blue-600"
                    : "bg-blue-500"
                  : isDarkMode
                  ? "bg-gray-700"
                  : "bg-gray-200"
              }`}
            >
              <i
                className={`${
                  isUser ? "fas fa-user" : "fas fa-robot"
                } text-sm ${
                  isUser
                    ? "text-white"
                    : isDarkMode
                    ? "text-gray-300"
                    : "text-gray-600"
                }`}
              ></i>
            </div>
          </div>

          {/* Mensaje */}
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? isDarkMode
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : isDarkMode
                ? "bg-gray-800 text-gray-100 border border-gray-700"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            {(message.parameters || message.responseParameters) && (
              <div
                className={`mb-3 pb-2 border-b border-opacity-20 ${
                  isDarkMode ? "border-gray-600" : "border-gray-300"
                }`}
              >
                <div className="flex flex-wrap gap-1">
                  {(message.parameters || message.responseParameters).map(
                    (param) => {
                      const paramLabels = {
                        resumen: {
                          label: "Resumir",
                          icon: "fas fa-compress-alt",
                          color: "blue",
                        },
                        detallado: {
                          label: "Explicar mejor",
                          icon: "fas fa-expand-alt",
                          color: "green",
                        },
                        ejemplo: {
                          label: "Dar ejemplo",
                          icon: "fas fa-lightbulb",
                          color: "orange",
                        },
                        continuar: {
                          label: "Continuar",
                          icon: "fas fa-arrow-right",
                          color: "purple",
                        },
                        mapa_mental: {
                          label: "Mapa Mental",
                          icon: "fas fa-project-diagram",
                          color: "teal",
                        },
                      };
                      const paramInfo = paramLabels[param] || {
                        label: param,
                        icon: "fas fa-tag",
                        color: "gray",
                      };

                      return (
                        <span
                          key={param}
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${
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

            {/* Contenido del mensaje */}
            <div
              className={`prose dark:prose-invert`}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked.parse(message.content)),
              }}
            ></div>

            {/* Enlaces de documentos si existen */}
            {message.documentLinks && message.documentLinks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-opacity-20">
                <p className="text-xs font-semibold mb-2 opacity-90">
                  Documentos relacionados:
                </p>
                <div className="space-y-2">
                  {message.documentLinks.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg group flex items-start space-x-3 ${
                        isDarkMode
                          ? "border-gray-700 hover:border-purple-600 hover:bg-purple-900/5"
                          : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getDocumentColor(
                          doc.type
                        )}`}
                      >
                        <i
                          className={`${getDocumentIcon(doc.url)} text-sm`}
                        ></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium text-sm mb-1 line-clamp-2 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p
                            className={`text-xs mb-1 line-clamp-2 ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {doc.description}
                          </p>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded-md ${
                            isDarkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {doc.type}
                        </span>
                      </div>
                      <i
                        className={`fas fa-external-link-alt text-xs transition-transform duration-200 group-hover:translate-x-1 ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      ></i>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Artifact (mapa mental) */}
            {message.artifact &&
              message.artifactData && ( // Usar message.artifactData para el mapa mental
                <div
                  className={`mt-3 p-3 rounded-lg border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <i className="fas fa-project-diagram text-purple-500 mr-2"></i>
                      <span className="text-xs font-semibold">
                        Mapa Mental Generado
                      </span>
                    </div>
                    <button
                      onClick={() => onViewMindMap(message.artifactData)} // Pasar el objeto artifact completo
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isDarkMode
                          ? "bg-purple-900/20 text-purple-400 hover:bg-purple-900/40"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      Ver Mapa
                    </button>
                  </div>
                  <div className="text-xs opacity-75">
                    Se ha creado un mapa mental basado en el contexto. Haz clic
                    en "Ver Mapa" para explorarlo.
                  </div>
                </div>
              )}

            {/* Timestamp */}
            <div
              className={`text-xs mt-2 opacity-70 ${
                isUser ? "text-right" : "text-left"
              }`}
            >
              {message.timestamp
                ? new Date(message.timestamp).toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Ahora"}
            </div>

            {/* Feedback para mensajes del bot */}
            {!isUser &&
              message.feedbackRequested &&
              !feedbackState?.submitted && (
                <div
                  className={`mt-4 pt-3 border-t border-opacity-20 ${
                    isDarkMode ? "border-gray-600" : "border-gray-300"
                  }`}
                >
                  <p className="text-xs font-medium mb-2 opacity-90">
                    ¿Te fue útil esta respuesta?
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFeedback(message.id, true)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs transition-colors ${
                        isDarkMode
                          ? "bg-green-900/20 text-green-400 hover:bg-green-900/40"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      <i className="fas fa-thumbs-up"></i>
                      <span>Sí</span>
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, false)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs transition-colors ${
                        isDarkMode
                          ? "bg-red-900/20 text-red-400 hover:bg-red-900/40"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
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
              <div
                className={`mt-4 pt-3 border-t border-opacity-20 ${
                  isDarkMode ? "border-gray-600" : "border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2 text-xs opacity-75">
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
      {messages.length === 0 && (
        <div
          className={`text-center py-16 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <i className="fas fa-comments text-6xl mb-6 opacity-20"></i>
          <h3 className="text-2xl font-semibold mb-2">¡Hola! 👋</h3>
          <p className="text-lg">¿En qué puedo ayudarte hoy?</p>
          <p className="text-sm mt-2 opacity-75">
            Selecciona una acción rápida o escribe tu pregunta
          </p>
        </div>
      )}

      {/* Renderizar mensajes */}
      {messages.map((message, index) => renderMessage(message, index))}

      {/* Indicador de escritura */}
      {isTyping && (
        <div className="flex justify-start">
          <div className="flex">
            <div className="mr-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <i
                  className={`fas fa-robot text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                ></i>
              </div>
            </div>
            <div
              className={`px-4 py-3 rounded-2xl ${
                isDarkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-gray-100"
              }`}
            >
              <div className="flex space-x-1">
                <div
                  className={`w-2 h-2 rounded-full animate-bounce ${
                    isDarkMode ? "bg-gray-500" : "bg-gray-400"
                  }`}
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className={`w-2 h-2 rounded-full animate-bounce ${
                    isDarkMode ? "bg-gray-500" : "bg-gray-400"
                  }`}
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className={`w-2 h-2 rounded-full animate-bounce ${
                    isDarkMode ? "bg-gray-500" : "bg-gray-400"
                  }`}
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
