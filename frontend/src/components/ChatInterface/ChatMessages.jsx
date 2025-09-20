import React, { useState } from "react";
import VibrantButton from "./VibrantButton";

const ChatMessages = ({ messages = [], isTyping, onFeedback, isDarkMode }) => {
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
            {/* Contenido del mensaje */}
            <div className="text-sm leading-relaxed whitespace-pre-wrap mb-2">
              {message.content}
            </div>

            {/* Enlaces de documentos si existen */}
            {message.documentLinks && message.documentLinks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-opacity-20">
                <p className="text-xs font-semibold mb-2 opacity-90">
                  Documentos relacionados:
                </p>
                <div className="space-y-2">
                  {message.documentLinks.map((doc, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg text-xs ${
                        isDarkMode
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-white hover:bg-gray-50"
                      } transition-colors cursor-pointer border ${
                        isDarkMode ? "border-gray-600" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-file-alt text-xs opacity-60"></i>
                        <span className="font-medium truncate">
                          {doc.title}
                        </span>
                      </div>
                      {doc.description && (
                        <p className="mt-1 opacity-70 leading-tight">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Artifact (mapa mental) */}
            {message.artifact && message.content && (
              <div
                className={`mt-3 p-3 rounded-lg border ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <div className="flex items-center mb-2">
                  <i className="fas fa-project-diagram text-purple-500 mr-2"></i>
                  <span className="text-xs font-semibold">
                    Mapa Mental Generado
                  </span>
                </div>
                <div className="text-xs opacity-75">
                  Se ha creado un mapa mental basado en el contexto. Revisa el
                  panel de artifacts.
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
