import React from "react";

const QuickActions = ({ quickActions, onQuickAction, generarMapaMental, isDarkMode }) => (
  <div className="mb-4">
    <div className="flex flex-wrap gap-2 mb-3">
      {quickActions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onQuickAction(action.text)}
          className={`text-xs px-3 py-1.5 bg-${action.color}-50 dark:bg-${action.color}-900/20 text-${action.color}-600 dark:text-${action.color}-400 rounded-full border border-${action.color}-200 dark:border-${action.color}-700 hover:bg-${action.color}-100 dark:hover:bg-${action.color}-900/30 transition-colors flex items-center space-x-1`}
        >
          <i className={action.icon}></i>
          <span>{action.label}</span>
        </button>
      ))}
      <button
        onClick={generarMapaMental}
        className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors flex items-center space-x-1"
      >
        <i className="fas fa-brain"></i>
        <span>Mapa Mental</span>
      </button>
    </div>
  </div>
);

export default QuickActions;