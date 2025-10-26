import { useState } from "react";

/**
 * Componente de Tooltip Mejorado
 *
 * Muestra información contextual al hacer hover sobre un elemento
 * Soporta diferentes posiciones y estilos
 */
const Tooltip = ({
  children,
  content,
  position = "top",
  delay = 300,
  isDarkMode = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-8 border-x-8 border-x-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-8 border-x-8 border-x-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-8 border-y-8 border-y-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-8 border-y-8 border-y-transparent",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
          style={{ minWidth: "200px", maxWidth: "300px" }}
        >
          <div
            className={`px-3 py-2 rounded-lg shadow-lg text-sm ${
              isDarkMode
                ? "bg-gray-700 text-white border border-gray-600"
                : "bg-gray-900 text-white"
            }`}
          >
            {content}
          </div>
          <div
            className={`absolute ${arrowClasses[position]} ${
              isDarkMode ? "border-t-gray-700" : "border-t-gray-900"
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
