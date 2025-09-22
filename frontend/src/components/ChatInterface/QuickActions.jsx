//

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
    <div className="mb-6">
      <div className="mb-4 text-center">
        <h3
          className={`text-lg font-medium mb-1 ${
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
          Selecciona una opción para comenzar
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onQuickAction(action.text)}
            className={`group p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
              isDarkMode
                ? "border-gray-700 hover:border-gray-600 bg-gray-800 hover:bg-gray-750"
                : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`inline-flex p-1.5 rounded-md text-sm ${
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
                <i className={`${action.icon}`}></i>
              </div>
            </div>

            <div>
              <h4
                className={`font-medium text-sm mb-1 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {action.text}
              </h4>
              <p
                className={`text-xs leading-relaxed ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center">
        <p
          className={`text-xs ${
            isDarkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          o escribe tu pregunta personalizada
        </p>
      </div>
    </div>
  );
};

export default QuickActions;
