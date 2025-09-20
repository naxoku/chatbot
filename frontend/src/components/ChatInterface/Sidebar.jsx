import React from "react";
import VibrantButton from "./VibrantButton";

const Sidebar = ({
  documents,
  chats = [],
  onNewChat,
  onDocumentSelect,
  onLogout,
  botStatus = "online",
  isDarkMode,
  isOpen,
  onClose,
  onModalOpen, // nuevo: callback para abrir el modal
  LogoUCT,
}) => {
  const getBotStatusConfig = (status) => {
    switch (status) {
      case "online":
        return { color: "green", text: "En línea", animate: "animate-pulse" };
      case "offline":
        return { color: "red", text: "Desconectado", animate: "" };
      case "processing":
        return {
          color: "yellow",
          text: "Procesando...",
          animate: "animate-pulse",
        };
      default:
        return { color: "gray", text: "Desconocido", animate: "" };
    }
  };

  const status = getBotStatusConfig(botStatus);

  if (!isOpen) return null;

  return (
    <div className="relative flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header con Logo */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        {LogoUCT && (
          <img
            src={LogoUCT}
            alt="Logo Universidad Católica del Temuco"
            className="w-100"
            style={{
              filter: isDarkMode ? "brightness(0) invert(1)" : "none",
            }}
          />
        )}
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        ></button>
      </div>

      {/* Sección 1: Acciones principales */}
      <div className="p-4">
        <div className="space-y-3">
          <VibrantButton
            color="purple"
            label="Nueva Conversación"
            icon={() => <i className="fas fa-plus"></i>}
            onClick={onNewChat}
            className="w-full justify-center"
          />
          <VibrantButton
            color="blue"
            label="Ver Documentos"
            icon={() => <i className="fas fa-file-alt"></i>}
            onClick={onModalOpen} // <-- abre el modal desde App.jsx
            className="w-full justify-center"
          />
        </div>
      </div>

      {/* Separador */}
      <hr className="mx-4 border-gray-200 dark:border-gray-700" />

      {/* Sección 2: Chats recientes */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 tracking-wide uppercase">
          Conversaciones Recientes
        </h4>
        <div className="space-y-2">
          {chats.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <i className="fas fa-comments text-3xl mb-3 opacity-30"></i>
              <p className="text-sm font-medium">No hay conversaciones</p>
              <p className="text-xs">Crea una nueva para empezar</p>
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center group hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <i className="fas fa-comment text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mr-3 flex-shrink-0"></i>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-gray-700 dark:text-gray-300">
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
                <i className="fas fa-chevron-right text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Separador */}
      <hr className="mx-4 border-gray-200 dark:border-gray-700" />

      {/* Sección 3: Footer con configuraciones */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Estado del bot */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Asistente
            </span>
            <div className="flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full bg-${status.color}-500 ${status.animate}`}
              ></span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {status.text}
              </span>
            </div>
          </div>

          {/* Botón de logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
