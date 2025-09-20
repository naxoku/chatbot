import React, { useRef, useEffect } from "react";
import VibrantButton from "./VibrantButton";

const ChatInput = ({
  input,
  onInputChange,
  onSendMessage,
  isTyping,
  quickActions = [],
  onQuickAction,
  generarMapaMental,
  isDarkMode,
}) => {
  const textareaRef = useRef(null);

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
    if (input.trim() && !isTyping && onSendMessage) {
      onSendMessage();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.ctrlKey || e.metaKey) {
        // Ctrl+Enter o Cmd+Enter → salto de línea
        e.preventDefault();
        const cursorPos = textareaRef.current.selectionStart;
        const newValue =
          input.substring(0, cursorPos) + "\n" + input.substring(cursorPos);
        onInputChange(newValue);

        // Mover cursor después del salto de línea
        setTimeout(() => {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = cursorPos + 1;
        }, 0);
      } else {
        // Enter normal → enviar
        e.preventDefault();
        handleSubmit(e);
      }
    }
  };

  const handleQuickActionClick = (actionText) => {
    if (onQuickAction) {
      onQuickAction(actionText);
    }
  };

  const miniQuickActions = [
    { text: "Explicar mejor", icon: "fas fa-lightbulb", color: "orange" },
    { text: "Dar ejemplo", icon: "fas fa-code", color: "blue" },
    { text: "Resumir", icon: "fas fa-list", color: "emerald" },
    { text: "Continuar", icon: "fas fa-arrow-right", color: "purple" },
  ];

  return (
    <div className="p-4">
      {/* Mini quick actions */}
      {quickActions.length === 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {miniQuickActions.map((action, index) => (
              <VibrantButton
                key={index}
                color={action.color}
                label={action.text}
                icon={() => <i className={action.icon}></i>}
                size="small"
                onClick={() => handleQuickActionClick(action.text)}
                className="text-xs"
              />
            ))}
          </div>
        </div>
      )}

      {/* Input principal */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex space-x-3">
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje... (Ctrl + Enter para nueva línea)"
              disabled={isTyping}
              rows={1}
              className={`w-full resize-none rounded-xl border transition-all duration-200 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              } ${isTyping ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ maxHeight: "120px", minHeight: "52px" }}
            />

            {/* Contador de caracteres */}
            {input.length > 0 && (
              <div
                className={`absolute bottom-2 right-2 text-xs ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {input.length}/2000
              </div>
            )}
          </div>

          {/* Botón enviar */}
          <VibrantButton
            color="purple"
            icon={() => (
              <i
                className={`fas ${
                  isTyping ? "fa-spinner fa-spin" : "fa-paper-plane"
                }`}
              ></i>
            )}
            variant="icon"
            onClick={handleSubmit}
            disabled={!input.trim() || isTyping}
            className="flex-shrink-0 self-end"
            size="large"
          />
        </div>

        {/* Botones adicionales */}
        <div className="flex items-center justify-between">
          {/* Botón mapa mental */}
          {generarMapaMental && (
            <VibrantButton
              color="teal"
              label="Mapa Mental"
              icon={() => <i className="fas fa-project-diagram"></i>}
              size="small"
              onClick={generarMapaMental}
              disabled={isTyping}
            />
          )}
        </div>
      </form>

      {/* Status bar */}
      <div
        className={`mt-2 text-xs flex items-center justify-between ${
          isDarkMode ? "text-gray-500" : "text-gray-400"
        }`}
      >
        <div className="flex items-center space-x-4">
          <span>
            <i className="fas fa-robot mr-1"></i>
            Asistente {isTyping ? "escribiendo..." : "listo"}
          </span>
          <span>
            <i className="fas fa-shield-alt mr-1"></i>
            Conversación segura
          </span>
        </div>
        <div>
          <i className="fas fa-keyboard mr-1"></i>
          Enter para enviar • Ctrl+Enter para nueva línea
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
