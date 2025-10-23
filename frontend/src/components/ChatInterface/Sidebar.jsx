import VibrantButton from "./VibrantButton";

const Sidebar = ({
  chats = [],
  onNewChat,
  onSelectChat,
  onLogout,
  botStatus = "online",
  isDarkMode,
  isOpen,
  onClose,
  onModalOpen,
  LogoUCT,
  toggleDarkMode,
  onViewMapas,
}) => {
  const getBotStatusConfig = (status) => {
    switch (status) {
      case "online":
        return {
          colorClass: "bg-green-500",
          text: "En línea",
          animate: "animate-pulse",
        };
      case "offline":
        return { colorClass: "bg-red-500", text: "Desconectado", animate: "" };
      case "processing":
        return {
          colorClass: "bg-yellow-500",
          text: "Procesando...",
          animate: "animate-pulse",
        };
      default:
        return { colorClass: "bg-gray-500", text: "Desconocido", animate: "" };
    }
  };

  const status = getBotStatusConfig(botStatus);

  if (!isOpen) return null;

  return (
    <div className="relative flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
        <div className="flex items-center space-x-3">
          {LogoUCT && (
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={LogoUCT || "../../assets/Logo_dir_desarrollo_personas.png"}
                alt="Logo Universidad Católica del Temuco"
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-xl">
              Asistente DDPER
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Universidad Católica del Temuco
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 lg:hidden"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="p-4 space-y-3">
        <VibrantButton
          color="purple"
          label="Nueva Conversación"
          icon={() => <i className="fas fa-plus"></i>}
          onClick={onNewChat}
          className="w-full justify-center shadow-sm hover:shadow-md transition-shadow duration-200"
        />
        <VibrantButton
          color="blue"
          label="Ver Documentos"
          icon={() => <i className="fas fa-folder-open"></i>}
          onClick={onModalOpen}
          className="w-full justify-center shadow-sm hover:shadow-md transition-shadow duration-200"
        />
      </div>

      <div className="mx-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Conversaciones Recientes
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {chats.length}
          </span>
        </div>

        <div className="space-y-2">
          {chats.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <i className="fas fa-comments text-xl text-gray-400 dark:text-gray-500"></i>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                No hay conversaciones
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Crea una nueva para empezar
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <div key={chat.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => onSelectChat(chat)}
                  className="w-full text-left p-3 transition-all duration-200 flex items-center group hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 hover:shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-comment text-xs text-purple-600 dark:text-purple-400"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-gray-800 dark:text-gray-200 text-sm">
                      {chat.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {chat.lastMessage || "Sin mensajes"}
                      {chat.timestamp && (
                        <span className="ml-2">
                          • {new Date(chat.timestamp).toLocaleDateString("es-CL")}
                        </span>
                      )}
                    </p>
                  </div>
                  <i className="fas fa-chevron-right text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1"></i>
                </button>
                
                {/* Mostrar mapas mentales asociados */}
                {chat.mapasAsociados && chat.mapasAsociados.length > 0 && (
                  <div className="px-3 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Mapas mentales ({chat.mapasAsociados.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {chat.mapasAsociados.map((mapa) => (
                        <button
                          key={mapa.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewMapas(mapa);
                          }}
                          className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                          title={`${mapa.titulo} - ${new Date(mapa.fecha_creacion).toLocaleDateString()}`}
                        >
                          <i className="fas fa-project-diagram mr-1"></i>
                          {mapa.titulo.length > 12 ? mapa.titulo.substring(0, 12) + '...' : mapa.titulo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mx-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
      </div>

      <div className="p-4 space-y-3">
        {/* Enhanced bot status */}
        <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                <i className="fas fa-robot text-sm text-purple-600 dark:text-purple-400"></i>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado del bot
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full ${status.colorClass} ${status.animate}`}
              ></span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {status.text}
              </span>
            </div>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        >
          <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"}`}></i>
          <span>{isDarkMode ? "Modo Claro" : "Modo Oscuro"}</span>
        </button>

        {/* Enhanced logout button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
