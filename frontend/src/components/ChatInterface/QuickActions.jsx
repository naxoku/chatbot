import React from "react";
import VibrantButton from "./VibrantButton";

const QuickActions = ({ quickActions = [], onQuickAction, isDarkMode }) => {
  // Acciones por defecto si no se pasan
  const defaultActions = [
    {
      id: "codigo",
      text: "Ayuda con código React",
      icon: "fas fa-code",
      color: "purple",
      description: "Resuelve problemas de programación",
    },
    {
      id: "ideas",
      text: "Lluvia de ideas creativas",
      icon: "fas fa-lightbulb",
      color: "orange",
      description: "Genera ideas innovadoras",
    },
    {
      id: "aprender",
      text: "Explicar un concepto",
      icon: "fas fa-book",
      color: "emerald",
      description: "Aprende algo nuevo",
    },
    {
      id: "resolver",
      text: "Resolver un problema",
      icon: "fas fa-calculator",
      color: "blue",
      description: "Cálculos y análisis",
    },
    {
      id: "diseño",
      text: "Consejos de diseño UI",
      icon: "fas fa-palette",
      color: "pink",
      description: "Mejora tu interfaz",
    },
    {
      id: "optimizar",
      text: "Optimizar rendimiento",
      icon: "fas fa-bolt",
      color: "teal",
      description: "Mejora la velocidad",
    },
  ];

  const actions = quickActions.length > 0 ? quickActions : defaultActions;

  // Función para convertir iconos FontAwesome a componentes
  const IconComponent = ({ iconClass, color }) => (
    <i className={`${iconClass} w-5 h-5`} style={{ color: "currentColor" }}></i>
  );

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h3
          className={`text-xl font-semibold mb-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          ¿En qué puedo ayudarte?
        </h3>
        <p
          className={`text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Selecciona una acción rápida para comenzar o escribe tu pregunta
          personalizada
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {actions.map((action) => (
          <div
            key={action.id}
            onClick={() => onQuickAction(action.text)}
            className={`group p-6 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              isDarkMode
                ? "border-gray-700 hover:border-gray-600 bg-gray-800 hover:bg-gray-750"
                : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            {/* Header con ícono */}
            <div className="flex items-start justify-between mb-4">
              <div
                className={`inline-flex p-3 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                  action.color === "purple"
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                    : action.color === "orange"
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                    : action.color === "emerald"
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : action.color === "blue"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : action.color === "pink"
                    ? "bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"
                    : action.color === "teal"
                    ? "bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                <i className={`${action.icon} text-xl`}></i>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Acción rápida
              </div>
            </div>

            {/* Contenido */}
            <div>
              <h4
                className={`font-semibold text-lg mb-2 group-hover:text-${
                  action.color
                }-600 transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {action.text}
              </h4>
              <p
                className={`text-sm leading-relaxed ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {action.description}
              </p>
            </div>

            {/* Flecha indicativa */}
            <div className="mt-4 flex justify-end">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-${action.color}-100 dark:group-hover:bg-${action.color}-900/20`}
              >
                <i
                  className={`fas fa-arrow-right text-sm ${
                    isDarkMode
                      ? "text-gray-500 group-hover:text-gray-300"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                ></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Separador y sugerencia para preguntas personalizadas */}
      <div className="text-center">
        <div
          className={`relative flex items-center justify-center mb-4 ${
            isDarkMode ? "text-gray-600" : "text-gray-400"
          }`}
        >
          <div
            className={`flex-1 h-px ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>
          <span
            className={`px-4 text-sm font-medium ${
              isDarkMode
                ? "bg-gray-900 text-gray-400"
                : "bg-gray-50 text-gray-500"
            }`}
          >
            o
          </span>
          <div
            className={`flex-1 h-px ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>
        </div>

        <p
          className={`text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Escribe tu pregunta personalizada en el campo de texto de abajo
        </p>
      </div>
    </div>
  );
};

export default QuickActions;
