import React from "react";

const ChatHeader = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isEditingTitle,
  editingTitle,
  setEditingTitle,
  handleTitleSave,
  handleTitleCancel,
  currentChat,
  handleTitleEdit,
  isDarkMode,
  artifacts,
  isArtifactsOpen,
  setIsArtifactsOpen,
}) => {
  return (
    <header
      className={`
        h-16 z-30 px-4 border-b flex items-center justify-between
        ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }
      `}
    >
      <div className="flex items-center space-x-3">
        {/* Botón para abrir/cerrar sidebar */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode
              ? "text-gray-300 hover:bg-gray-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          aria-label="Toggle sidebar"
        >
          <i className="fas fa-bars text-lg" />
        </button>

        {/* Título de la conversación */}
        <div>
          {isEditingTitle ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSave();
                if (e.key === "Escape") handleTitleCancel();
              }}
              onBlur={handleTitleSave}
              className={`px-2 py-1 rounded text-sm font-semibold bg-transparent border-b-2 focus:outline-none ${
                isDarkMode
                  ? "text-white border-gray-500"
                  : "text-gray-900 border-gray-400"
              }`}
              autoFocus
            />
          ) : (
            <h2
              className={`font-semibold truncate cursor-pointer transition-colors ${
                isDarkMode
                  ? "text-white hover:text-gray-300"
                  : "text-gray-900 hover:text-gray-600"
              }`}
              onClick={handleTitleEdit}
              title="Click para editar título"
            >
              {currentChat?.name || "Nueva Conversación"}
            </h2>
          )}
        </div>
      </div>

      {/* Botones de la derecha */}
      <div className="flex items-center space-x-2">
        {artifacts && (
          <button
            onClick={() => setIsArtifactsOpen(!isArtifactsOpen)}
            className={`p-2 rounded-lg transition-colors relative ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Artefactos"
          >
            <i className="fas fa-layer-group" />
            {artifacts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {artifacts.length}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
