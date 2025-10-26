import Tooltip from "../ToolTip";

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
        <Tooltip
          content="Abrir/cerrar menú lateral"
          position="bottom"
          isDarkMode={isDarkMode}
        >
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
        </Tooltip>

        {/* Título de la conversación */}
        <div>
          <h2
            className={`font-semibold truncate ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {currentChat?.name || "Nueva Conversación"}
          </h2>
        </div>
      </div>

      {/* Botones de la derecha */}
      <div className="flex items-center space-x-2">
        {onOpenHelp && (
          <Tooltip
            content={
              <div>
                <p className="font-semibold mb-1">Centro de Ayuda</p>
                <p className="text-xs">Presiona Ctrl+K para abrir</p>
              </div>
            }
            position="bottom"
            isDarkMode={isDarkMode}
          >
            <button
              onClick={onOpenHelp}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-label="Abrir centro de ayuda"
            >
              <i className="fas fa-question-circle text-lg" />
            </button>
          </Tooltip>
        )}

        {/* Botón de artefactos */}
        {artifacts && (
          <Tooltip
            content={
              <div>
                <p className="font-semibold mb-1">Artefactos</p>
                <p className="text-xs">
                  Mapas mentales y otros contenidos generados
                </p>
              </div>
            }
            position="bottom"
            isDarkMode={isDarkMode}
          >
            <button
              onClick={() => setIsArtifactsOpen(!isArtifactsOpen)}
              className={`p-2 rounded-lg transition-colors relative ${
                isDarkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-label="Ver artefactos"
            >
              <i className="fas fa-layer-group text-lg" />
              {artifacts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {artifacts.length}
                </span>
              )}
            </button>
          </Tooltip>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
