import { useRef, useEffect, useState } from "react";
import Tooltip from "../Tooltip";

const ChatInput = ({
  input,
  onInputChange,
  onSendMessage,
  isTyping,
  isDarkMode,
  quickActions = [],
  onQuickAction,
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
      {/* Quick Actions - Mostrar solo si existen */}
      {quickActions.length > 0 && (
        <div
          className={`p-3 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onQuickAction(action.text)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                    : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                }`}
              >
                <i className={`${action.icon} text-${action.color}-500`}></i>
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input principal con sugerencias integradas */}
      <div className="p-3">
        <form onSubmit={handleSubmit} className="space-y-2">
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
                    <p className="font-semibold mb-1">Sugerencias Rápidas</p>
                    <p className="text-xs">Presiona Ctrl+K o haz clic aquí</p>
                  </div>
                }
                position="top"
                isDarkMode={isDarkMode}
              >
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className={`w-12 h-12 rounded-lg transition-colors flex items-center justify-center ${
                    showSuggestions
                      ? isDarkMode
                        ? "bg-blue-600 text-white"
                        : "bg-blue-600 text-white"
                      : isDarkMode
                      ? "bg-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <i className="fas fa-magic text-sm"></i>
                </button>
              </Tooltip>

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
