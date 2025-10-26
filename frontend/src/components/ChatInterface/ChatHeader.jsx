const ChatHeader = ({
  isSidebarOpen,
  setIsSidebarOpen,
  currentChat,
  isDarkMode,
  artifacts,
  isArtifactsOpen,
  setIsArtifactsOpen,
  onOpenHelp,
}) => {
  const currentChatArtifacts =
    artifacts?.filter(
      (a) => a.conversacionId === currentChat?.conversacionId
    ) || [];
  const showArtifactsBadge = currentChatArtifacts.length > 0;

  return (
    <header
      className={`h-14 px-4 border-b flex items-center justify-between ${
        isDarkMode ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode
              ? "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
          aria-label="Toggle sidebar"
        >
          <i className="fas fa-bars text-sm" />
        </button>

        <h2
          className={`font-medium text-sm truncate ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {currentChat?.name || "Nueva Conversación"}
        </h2>
      </div>

      <div className="flex items-center gap-1">
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-label="Abrir centro de ayuda"
          >
            <i className="fas fa-question-circle text-sm" />
          </button>
        )}

        {artifacts && (
          <button
            onClick={() => setIsArtifactsOpen(!isArtifactsOpen)}
            className={`p-2 rounded-lg transition-colors relative ${
              isDarkMode
                ? "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-label="Ver artefactos"
          >
            <i className="fas fa-layer-group text-sm" />
            {showArtifactsBadge && (
              <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                {currentChatArtifacts.length}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
