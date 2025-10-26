import { useState, useRef, useEffect } from "react";

const MessageQuickActions = ({
  message,
  onQuickAction,
  isDarkMode,
  quickActions = [],
  onQuoteMessage, // Añadir prop para manejar mensajes citados
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (action) => {
    if (action.id === "responder") {
      // Acción de responder: establecer el mensaje citado
      onQuoteMessage(message);
    } else if (action.id === "mapa-mental") {
      // Generar mapa mental directamente, sin modificar el input
      onQuickAction(action, message);
    } else {
      // Otras acciones: establecer el mensaje citado Y el texto en el input
      onQuoteMessage(message);
      // Usar setTimeout para asegurar que el mensaje citado se establece primero
      setTimeout(() => {
        onQuickAction(action, message);
      }, 0);
    }
    setIsOpen(false);
  };

  if (quickActions.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1.5 rounded-lg transition-all duration-200 ${
          isOpen
            ? isDarkMode
              ? "bg-gray-700 text-purple-400"
              : "bg-gray-200 text-purple-600"
            : isDarkMode
            ? "text-gray-500 hover:text-gray-300 hover:bg-gray-700/50"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        }`}
        title="Acciones rápidas"
        aria-label="Menú de acciones rápidas"
        aria-expanded={isOpen}
      >
        <i className="fas fa-bolt text-sm"></i>
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-2 z-50 w-48 rounded-xl shadow-2xl border animate-in fade-in zoom-in-95 duration-200 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            {/* Añadir acción de responder al principio */}
            <button
              onClick={() =>
                handleActionClick({ id: "responder", text: "Responder" })
              }
              className={`w-full text-left px-3 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 group ${
                isDarkMode
                  ? "text-gray-200 hover:bg-gray-700 hover:text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <i className="fas fa-reply text-blue-500 text-xs"></i>
              <span className="flex-1">Responder</span>
            </button>

            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`w-full text-left px-3 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 group ${
                  isDarkMode
                    ? "text-gray-200 hover:bg-gray-700 hover:text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <i
                  className={`${action.icon} text-${action.color}-500 text-xs`}
                ></i>
                <span className="flex-1">{action.text}</span>
                {/* Icono distintivo para acciones que generan artefactos */}
                {action.generatesArtifact && (
                  <i className="fas fa-magic text-xs text-purple-500"></i>
                )}
                {/* Icono distintivo para acciones que no generan artefactos */}
                {!action.generatesArtifact && (
                  <i className="fas fa-comment text-xs text-gray-400"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageQuickActions;
