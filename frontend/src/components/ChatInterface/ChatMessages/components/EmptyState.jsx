/**
 * Componente para mostrar el estado vacío cuando no hay mensajes
 * Aparece cuando no hay conversaciones y no se está escribiendo
 */

/**
 * Componente EmptyState
 * @param {Object} props - Props del componente
 * @param {boolean} props.isDarkMode - Modo oscuro activado
 */
const EmptyState = ({ isDarkMode }) => {
  return (
    <div
      className={`text-center py-20 ${
        isDarkMode ? "text-gray-500" : "text-gray-500"
      }`}
    >
      <div
        className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isDarkMode ? "bg-gray-800" : "bg-gray-200"
        }`}
      >
        <i className="fas fa-comments text-2xl"></i>
      </div>
      <h3
        className={`text-xl font-medium mb-1 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        ¿En qué puedo ayudarte?
      </h3>
      <p className="text-sm">Escribe tu pregunta para comenzar</p>
    </div>
  );
};

export default EmptyState;