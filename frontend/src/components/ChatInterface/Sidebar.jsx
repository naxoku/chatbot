import ChatActions from "./ChatActions";

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
  onDeleteChat,
  onRenameChat,
  currentChatId,
}) => {
  const getBotStatusConfig = (status) => {
    switch (status) {
      case "online":
        return {
          colorClass: "bg-green-500",
          text: "En línea",
          animate: "",
        };
      case "offline":
        return { colorClass: "bg-red-500", text: "Desconectado", animate: "" };
      case "processing":
        return {
          colorClass: "bg-yellow-500",
          text: "Procesando...",
          animate: "",
        };
      default:
        return { colorClass: "bg-gray-500", text: "Desconocido", animate: "" };
    }
  };

  const status = getBotStatusConfig(botStatus);

  const groupChatsByDate = (chats) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const groups = {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    };

    chats.forEach((chat) => {
      const chatDate = new Date(
        chat.fechaCreacion || chat.createdAt || Date.now()
      );
      const chatDateOnly = new Date(
        chatDate.getFullYear(),
        chatDate.getMonth(),
        chatDate.getDate()
      );

      if (chatDateOnly.getTime() === today.getTime()) {
        groups.today.push(chat);
      } else if (chatDateOnly.getTime() === yesterday.getTime()) {
        groups.yesterday.push(chat);
      } else if (chatDate >= lastWeek) {
        groups.lastWeek.push(chat);
      } else if (chatDate >= lastMonth) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  };

  const groupedChats = groupChatsByDate(chats);

  const renderChatGroup = (title, chats) => {
    if (chats.length === 0) return null;

    return (
      <div className="mb-4">
        <h4
          className={`text-xs font-semibold mb-2 px-2 ${
            isDarkMode ? "text-gray-500" : "text-gray-500"
          }`}
        >
          {title}
        </h4>
        <div className="space-y-1">
          {chats.map((chat) => {
            const isActive =
              currentChatId === chat.conversacionId ||
              currentChatId === chat.id;

            return (
              <div
                key={chat.id}
                className={`group rounded-lg transition-colors ${
                  isActive
                    ? isDarkMode
                      ? "bg-gray-800"
                      : "bg-gray-100"
                    : isDarkMode
                    ? "hover:bg-gray-800/50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2 p-2.5">
                  <button
                    onClick={() => onSelectChat(chat)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p
                      className={`truncate text-sm ${
                        isActive
                          ? isDarkMode
                            ? "text-white font-medium"
                            : "text-gray-900 font-medium"
                          : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {chat.name}
                    </p>
                  </button>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChatActions
                      chat={chat}
                      onDelete={onDeleteChat}
                      onRename={onRenameChat}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>

                {/* Mapas mentales */}
                {chat.mapasAsociados && chat.mapasAsociados.length > 0 && (
                  <div
                    className={`px-2.5 pb-2.5 border-t ${
                      isDarkMode ? "border-gray-800" : "border-gray-200"
                    }`}
                  >
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {chat.mapasAsociados.map((mapa) => (
                        <button
                          key={mapa.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewMapas(mapa);
                          }}
                          className={`text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                            isDarkMode
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                          title={mapa.titulo}
                        >
                          <i className="fas fa-project-diagram text-xs"></i>
                          <span className="max-w-[100px] truncate">
                            {mapa.titulo}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className={`relative flex flex-col h-full ${
        isDarkMode
          ? "bg-[#1a1a1a] border-r border-gray-800"
          : "bg-white border-r border-gray-200"
      }`}
    >
      <div
        className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-2.5">
          {LogoUCT && (
            <div className="w-7 h-7 rounded overflow-hidden flex items-center justify-center">
              <img
                src={LogoUCT || "/placeholder.svg"}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <h3
            className={`font-semibold text-sm ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Asistente DDPER
          </h3>
        </div>
        <button
          onClick={onClose}
          className={`p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors lg:hidden ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <i className="fas fa-times text-sm"></i>
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
            isDarkMode
              ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
              : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200"
          }`}
        >
          <i className="fas fa-plus text-sm"></i>
          <span>Nueva Conversación</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        {chats.length === 0 ? (
          <div className="text-center py-12">
            <i
              className={`fas fa-comments text-2xl mb-2 ${
                isDarkMode ? "text-gray-700" : "text-gray-300"
              }`}
            ></i>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-600" : "text-gray-500"
              }`}
            >
              No hay conversaciones
            </p>
          </div>
        ) : (
          <>
            {renderChatGroup("Hoy", groupedChats.today)}
            {renderChatGroup("Ayer", groupedChats.yesterday)}
            {renderChatGroup("Últimos 7 días", groupedChats.lastWeek)}
            {renderChatGroup("Últimos 30 días", groupedChats.lastMonth)}
            {renderChatGroup("Más antiguas", groupedChats.older)}
          </>
        )}
      </div>

      <div
        className={`p-3 border-t space-y-2 ${
          isDarkMode ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <button
          onClick={onModalOpen}
          className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${
            isDarkMode
              ? "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <i className="fas fa-folder-open text-sm"></i>
          <span>Documentos</span>
        </button>

        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${
            isDarkMode
              ? "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"} text-sm`}></i>
          <span>{isDarkMode ? "Modo Claro" : "Modo Oscuro"}</span>
        </button>

        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${
            isDarkMode
              ? "text-red-400 hover:bg-red-900/20"
              : "text-red-600 hover:bg-red-50"
          }`}
        >
          <i className="fas fa-sign-out-alt text-sm"></i>
          <span>Cerrar Sesión</span>
        </button>

        <div
          className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-xs ${
            isDarkMode
              ? "bg-gray-800/50 border border-gray-800"
              : "bg-gray-50 border border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 flex-1">
            <div className="relative">
              <div
                className={`w-2 h-2 rounded-full ${status.colorClass}`}
              ></div>
              {botStatus === "online" && (
                <div
                  className={`absolute inset-0 w-2 h-2 rounded-full ${status.colorClass} animate-ping opacity-75`}
                ></div>
              )}
            </div>
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Bot: {status.text}
            </span>
          </div>
          <i
            className={`fas fa-robot text-xs ${
              isDarkMode ? "text-gray-600" : "text-gray-400"
            }`}
          ></i>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
