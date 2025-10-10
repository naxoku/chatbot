import React from "react";

const ChatHeader = ({
  isSidebarOpen,
  setIsSidebarOpen,
  botStatus,
  isEditingTitle,
  editingTitle,
  setEditingTitle,
  handleTitleSave,
  handleTitleCancel,
  currentChat,
  handleTitleEdit,
  isDarkMode,
  toggleDarkMode,
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
            ? "bg-gray-800/95 border-gray-700 backdrop-blur-sm"
            : "bg-white/95 border-gray-200 backdrop-blur-sm"
        }
      `}
    >
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode
              ? "text-gray-300 hover:bg-gray-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          aria-label="Toggle sidebar"
        >
          <i
            className={`fas ${isSidebarOpen ? "fa-times" : "fa-bars"} text-lg`}
          />
        </button>
        <div className="flex items-center space-x-3">
          <div
            className={`w-2 h-2 rounded-full ${
              botStatus === "processing"
                ? "bg-yellow-500 animate-pulse"
                : "bg-green-500"
            }`}
          />
          <div>
            {isEditingTitle ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleSave();
                    if (e.key === "Escape") handleTitleCancel();
                  }}
                  onBlur={handleTitleSave}
                  className={`px-2 py-1 rounded text-sm font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                  autoFocus
                />
              </div>
            ) : (
              <h2
                className={`font-semibold truncate cursor-pointer hover:text-blue-500 transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
                onClick={handleTitleEdit}
                title="Click para editar título"
              >
                {currentChat?.name || "Nueva Conversación"}
              </h2>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode
              ? "text-gray-300 hover:bg-gray-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title={isDarkMode ? "Modo claro" : "Modo oscuro"}
        >
          <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"}`} />
        </button>
        {artifacts && (
          <button
            onClick={() => setIsArtifactsOpen(!isArtifactsOpen)}
            className={`p-2 rounded-lg transition-colors relative ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Artifacts"
          >
            <i
              className={`fas ${
                isArtifactsOpen ? "fa-times" : "fa-layer-group"
              }`}
            />
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
