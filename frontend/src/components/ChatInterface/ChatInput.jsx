import { useRef, useEffect } from "react";

const ChatInput = ({
  input,
  onInputChange,
  onSendMessage,
  isTyping,
  quickActions = [],
  onQuickAction,
  generarMapaMental,
  isDarkMode,
  selectedParameters = [],
  onParameterChange,
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

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-end space-x-3">
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
              className={`w-full resize-none rounded-xl border transition-all duration-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent overflow-hidden ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              } ${isTyping ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{
                maxHeight: "120px",
                minHeight: "48px",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`flex-shrink-0 w-12 h-12 rounded-xl transition-all duration-200 flex items-center justify-center ${
              !input.trim() || isTyping
                ? isDarkMode
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            <i
              className={`fas ${
                isTyping ? "fa-spinner fa-spin" : "fa-paper-plane"
              } text-sm`}
            />
          </button>
        </div>

        {selectedParameters.length > 0 && (
          <div className="mt-2 flex items-center justify-center space-x-2">
            <i
              className={`fas fa-info-circle text-xs ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            ></i>
            <span
              className={`text-xs ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {selectedParameters.length} parámetro
              {selectedParameters.length !== 1 ? "s" : ""} seleccionado
              {selectedParameters.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatInput;
