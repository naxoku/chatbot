import { useState, useEffect, useRef } from "react";

const ChatActions = ({ chat, onDelete, onRename }) => {
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

  const handleDelete = () => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta conversación?")
    ) {
      onDelete(chat);
    }
    setIsOpen(false);
  };

  const handleRename = () => {
    const newName = prompt(
      "Ingresa el nuevo nombre para la conversación:",
      chat.name
    );
    if (newName && newName.trim() !== "") {
      onRename(chat, newName);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${
            isOpen
              ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white"
              : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          }
          focus:outline-none focus:ring-2 focus:ring-purple-500/20
        `}
        title="Más opciones"
        aria-label="Menú de opciones"
        aria-expanded={isOpen}
      >
        <i className="fas fa-ellipsis-v text-sm"></i>
      </button>

      {isOpen && (
        <div
          className="
            absolute right-0 top-full mt-2 
            w-52 z-50
            bg-white dark:bg-gray-800 
            rounded-xl shadow-2xl
            border border-gray-200 dark:border-gray-700
            origin-top-right
            animate-in fade-in zoom-in-95 duration-200
          "
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="py-1">
            <li>
              <button
                onClick={handleRename}
                className="
                  w-full text-left px-4 py-3
                  text-sm font-medium
                  text-gray-700 dark:text-gray-200
                  hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50
                  dark:hover:from-purple-900/20 dark:hover:to-blue-900/20
                  transition-all duration-200
                  flex items-center gap-3
                  group
                "
              >
                <div
                  className="
                    w-8 h-8 rounded-lg
                    bg-purple-100 dark:bg-purple-900/30
                    flex items-center justify-center
                    group-hover:scale-110 transition-transform duration-200
                  "
                >
                  <i className="fas fa-pen text-sm text-purple-600 dark:text-purple-400"></i>
                </div>
                <span>Cambiar nombre</span>
              </button>
            </li>

            <li className="my-1">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-2"></div>
            </li>

            <li>
              <button
                onClick={handleDelete}
                className="
                  w-full text-left px-4 py-3
                  text-sm font-medium
                  text-red-600 dark:text-red-400
                  hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50
                  dark:hover:from-red-900/20 dark:hover:to-red-900/20
                  transition-all duration-200
                  flex items-center gap-3
                  group
                "
              >
                <div
                  className="
                    w-8 h-8 rounded-lg
                    bg-red-100 dark:bg-red-900/30
                    flex items-center justify-center
                    group-hover:scale-110 transition-transform duration-200
                  "
                >
                  <i className="fas fa-trash text-sm text-red-600 dark:text-red-400"></i>
                </div>
                <span>Eliminar conversación</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatActions;
