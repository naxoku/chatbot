import React from "react";

const TypingIndicator = () => (
  <div className="flex justify-start mb-4 px-2">
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
        <i className="fas fa-robot text-white text-sm"></i>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <span className="text-sm text-gray-500">El asistente está escribiendo...</span>
        </div>
      </div>
    </div>
  </div>
);

export default TypingIndicator;