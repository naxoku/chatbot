// ./ChatInterface/ChatHeader.jsx
import React from "react";

const ChatHeader = ({ isDarkMode }) => (
  <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <i className="fas fa-users text-white"></i>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Asistente DDPER
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Dirección de Desarrollo de Personas - UCT
        </p>
      </div>
    </div>
  </div>
);

export default ChatHeader;