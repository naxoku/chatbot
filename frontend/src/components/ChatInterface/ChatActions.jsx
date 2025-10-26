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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        className="flex-shrink-0 w-12 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
        title="Más opciones"
      >
        <i className="fas fa-ellipsis-v"></i>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="py-1">
            <li>
              <button
                onClick={handleRename}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <i className="fas fa-pen w-6 text-center"></i>
                <span>Cambiar nombre</span>
              </button>
            </li>
            <li>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
              >
                <i className="fas fa-trash w-6 text-center"></i>
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
