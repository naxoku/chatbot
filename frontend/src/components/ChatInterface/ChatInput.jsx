import React, { useRef } from "react";
import QuickActions from "./QuickActions";

const ChatInput = ({
  input,
  onInputChange,
  onSendMessage,
  isTyping,
  quickActions,
  onQuickAction,
  generarMapaMental,
  isDarkMode,
}) => {
  const textareaRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const autoResize = (textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <QuickActions
        quickActions={quickActions}
        onQuickAction={onQuickAction}
        generarMapaMental={generarMapaMental}
        isDarkMode={isDarkMode}
      />
      <div className="relative flex items-end space-x-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-3">
        <textarea
          ref={textareaRef}
          placeholder="Pregúntame sobre documentos DDPER..."
          className="w-full resize-none bg-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-sm leading-relaxed py-1 px-1"
          rows={1}
          value={input}
          onChange={(e) => {
            onInputChange(e.target.value);
            autoResize(e.currentTarget);
          }}
          onKeyPress={handleKeyPress}
          style={{ minHeight: 24, maxHeight: 120, lineHeight: 1.5 }}
        />
        <button
          onClick={onSendMessage}
          disabled={!input.trim() || isTyping}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0"
          aria-label="Enviar mensaje"
        >
          <i className="fas fa-paper-plane text-sm"></i>
        </button>
      </div>
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ¿No encuentras lo que buscas?{" "}
          <a href="mailto:ddper@uct.cl" className="text-blue-600 dark:text-blue-400 hover:underline">
            Contacta directamente: ddper@uct.cl
          </a>
        </p>
      </div>
    </div>
  );
};

export default ChatInput;