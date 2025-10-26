import { useState, useEffect, useRef } from "react";

const ChatActions = ({ chat, onDelete, onRename, isDarkMode }) => {
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
        className={`p-1.5 rounded-lg transition-colors ${
          isOpen
            ? isDarkMode
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-gray-900"
            : isDarkMode
            ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        }`}
        title="Más opciones"
      >
        <i className="fas fa-ellipsis-v text-xs"></i>
      </button>

      {isOpen && (
        <div
          className={`
            absolute right-0 top-full mt-1 w-48 z-50 rounded-lg shadow-xl border
            ${
              isDarkMode
                ? "bg-[#1a1a1a] border-gray-800"
                : "bg-white border-gray-200"
            }
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="py-1">
            <li>
              <button
                onClick={handleRename}
                className={`
                  w-full text-left px-3 py-2 text-sm flex items-center gap-2
                  ${
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <i className="fas fa-pen text-xs w-4"></i>
                <span>Renombrar</span>
              </button>
            </li>

            <li className="my-1">
              <div
                className={`h-px ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-200"
                } mx-2`}
              ></div>
            </li>

            <li>
              <button
                onClick={handleDelete}
                className={`
                  w-full text-left px-3 py-2 text-sm flex items-center gap-2
                  ${
                    isDarkMode
                      ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                      : "text-red-600 hover:bg-red-50 hover:text-red-700"
                  }
                `}
              >
                <i className="fas fa-trash text-xs w-4"></i>
                <span>Eliminar</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatActions;
