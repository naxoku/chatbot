import { useRef, useEffect, useState } from "react";
import Tooltip from "../ToolTip";

const ChatInput = ({
  input,
  onInputChange,
  onSendMessage,
  isTyping,
  isDarkMode,
  quotedMessage,
  setQuotedMessage,
}) => {
  const textareaRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const smartSuggestions = [
    {
      text: "¿Qué documentos tengo disponibles?",
      icon: "fas fa-folder-open",
      category: "Documentos",
    },
    {
      text: "Resume el contenido anterior",
      icon: "fas fa-compress-alt",
      category: "Análisis",
    },
    {
      text: "Dame ejemplos prácticos",
      icon: "fas fa-lightbulb",
      category: "Ejemplos",
    },
    {
      text: "Explica esto de forma más simple",
      icon: "fas fa-graduation-cap",
      category: "Explicación",
    },
  ];

  // Auto resize del textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSubmittingRef.current) {
      console.warn("⚠️ Ya hay un mensaje enviándose");
      return;
    }

    if (input.trim() && !isTyping && onSendMessage) {
      isSubmittingRef.current = true;
      onSendMessage();

      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setShowSuggestions(!showSuggestions);
      return;
    }

    if (e.key === "Enter") {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const cursorPos = textareaRef.current.selectionStart;
        const newValue =
          input.substring(0, cursorPos) + "\n" + input.substring(cursorPos);
        onInputChange(newValue);

        setTimeout(() => {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = cursorPos + 1;
        }, 0);
      } else {
        e.preventDefault();

        if (isSubmittingRef.current) {
          console.warn("⚠️ Ya hay un mensaje enviándose");
          return;
        }

        if (input.trim() && !isTyping) {
          isSubmittingRef.current = true;
          onSendMessage();

          setTimeout(() => {
            isSubmittingRef.current = false;
          }, 500);
        }
      }
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    onInputChange(suggestionText);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  return (
    <div
      className={`border-t ${
        isDarkMode ? "border-gray-700" : "border-gray-200"
      }`}
    >
      {/* Input principal con sugerencias integradas */}
      <div className="p-3">
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Mensaje citado */}
          {quotedMessage && (
            <div
              className={`relative flex items-start p-3 rounded-lg border-l-4 ${
                isDarkMode
                  ? "bg-gray-800 border-blue-500 text-gray-300"
                  : "bg-blue-50 border-blue-400 text-gray-700"
              }`}
            >
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-1.5 mb-1">
                  <i className="fas fa-reply text-xs"></i>
                  <p className="text-xs font-semibold">
                    Respondiendo a:{" "}
                    <span
                      className={`${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      {quotedMessage.sender === "user" ? "Tú" : "Asistente"}
                    </span>
                  </p>
                </div>
                <p className="text-sm line-clamp-2">{quotedMessage.content}</p>
              </div>
              <button
                type="button"
                onClick={() => setQuotedMessage(null)}
                className={`ml-3 p-1.5 rounded-full transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-200 text-gray-500 hover:text-gray-800"
                }`}
                title="Eliminar mensaje citado"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          )}

          {showSuggestions && (
            <div
              className={`p-3 rounded-lg ${
                isDarkMode
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Sugerencias rápidas
                </span>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className={`text-xs ${
                    isDarkMode
                      ? "text-gray-500 hover:text-gray-300"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {smartSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className={`flex items-center space-x-2 p-2 rounded-lg text-left text-sm transition-colors ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    <i className={`${suggestion.icon} text-blue-500`}></i>
                    <span className="flex-1">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje... (Ctrl+K para sugerencias)"
                disabled={isTyping}
                rows={1}
                className={`w-full resize-none rounded-lg border transition-colors duration-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent overflow-hidden ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } ${isTyping ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  maxHeight: "120px",
                  minHeight: "44px",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Tooltip
                content={
                  <div>
                    <p className="font-semibold mb-1">Enviar mensaje</p>
                    <p className="text-xs">Presiona Enter para enviar</p>
                    <p className="text-xs">Ctrl+Enter para nueva línea</p>
                  </div>
                }
                position="top"
                isDarkMode={isDarkMode}
              >
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className={`w-12 h-12 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                    !input.trim() || isTyping
                      ? isDarkMode
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isDarkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <i
                    className={`fas ${
                      isTyping ? "fa-spinner fa-spin" : "fa-paper-plane"
                    } text-sm`}
                  />
                </button>
              </Tooltip>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
