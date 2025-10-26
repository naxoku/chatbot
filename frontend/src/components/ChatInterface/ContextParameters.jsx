import Tooltip from "../ToolTip";

const ContextParameters = ({
  onParameterChange,
  isDarkMode,
  selectedParameters = [],
  generarMapaMental,
  isTyping,
  shouldShow = true,
}) => {
  const parameters = [
    {
      id: "resumen",
      label: "Resumir",
      icon: "fas fa-compress-alt",
      color: "emerald",
      description: "Proporciona respuestas concisas y resumidas",
      detailedDescription: (
        <div>
          <p className="font-semibold mb-1">Resumir</p>
          <p className="text-xs mb-2">
            Obtén respuestas breves y al punto, perfectas cuando necesitas
            información rápida.
          </p>
          <p className="text-xs italic">
            Ejemplo: "Resume los puntos clave del documento"
          </p>
        </div>
      ),
    },
    {
      id: "detallado",
      label: "Explicar mejor",
      icon: "fas fa-expand-alt",
      color: "orange",
      description: "Respuestas detalladas y explicaciones completas",
      detailedDescription: (
        <div>
          <p className="font-semibold mb-1">Explicar mejor</p>
          <p className="text-xs mb-2">
            Recibe explicaciones profundas con todos los detalles y contexto
            necesario.
          </p>
          <p className="text-xs italic">
            Ejemplo: "Explica en detalle cómo funciona este proceso"
          </p>
        </div>
      ),
    },
    {
      id: "ejemplo",
      label: "Dar ejemplo",
      icon: "fas fa-lightbulb",
      color: "blue",
      description: "Incluye ejemplos prácticos en las respuestas",
      detailedDescription: (
        <div>
          <p className="font-semibold mb-1">Dar ejemplo</p>
          <p className="text-xs mb-2">
            Las respuestas incluirán ejemplos prácticos y casos de uso reales.
          </p>
          <p className="text-xs italic">
            Ejemplo: "Dame ejemplos de cómo aplicar esto"
          </p>
        </div>
      ),
    },
  ];

  const handleParameterToggle = (parameterId) => {
    const isSelected = selectedParameters.includes(parameterId);
    let newParameters;

    if (isSelected) {
      newParameters = selectedParameters.filter((id) => id !== parameterId);
    } else {
      newParameters = [...selectedParameters, parameterId];
    }

    onParameterChange(newParameters);
  };

  const getColorClasses = (color, isSelected) => {
    const baseClasses = "transition-all duration-200 hover:scale-105";

    if (isSelected) {
      switch (color) {
        case "blue":
          return `${baseClasses} bg-blue-500 text-white border-blue-500 shadow-md`;
        case "emerald":
          return `${baseClasses} bg-emerald-500 text-white border-emerald-500 shadow-md`;
        case "orange":
          return `${baseClasses} bg-orange-500 text-white border-orange-500 shadow-md`;
        case "purple":
          return `${baseClasses} bg-purple-500 text-white border-purple-500 shadow-md`;
        case "teal":
          return `${baseClasses} bg-teal-500 text-white border-teal-500 shadow-md`;
        default:
          return `${baseClasses} bg-gray-500 text-white border-gray-500 shadow-md`;
      }
    } else {
      return `${baseClasses} ${
        isDarkMode
          ? "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
      }`;
    }
  };

  return (
    shouldShow && (
      <div className="px-4 py-2">
        <div className="flex flex-wrap gap-2 justify-center">
          {parameters.map((param) => {
            const isSelected = selectedParameters.includes(param.id);
            return (
              <Tooltip
                key={param.id}
                content={param.detailedDescription}
                position="top"
                isDarkMode={isDarkMode}
              >
                <button
                  onClick={() => handleParameterToggle(param.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-medium ${getColorClasses(
                    param.color,
                    isSelected
                  )}`}
                  aria-label={param.description}
                >
                  <i className={param.icon}></i>
                  <span>{param.label}</span>
                  {isSelected && <i className="fas fa-check text-xs"></i>}
                </button>
              </Tooltip>
            );
          })}

          {generarMapaMental && (
            <Tooltip
              content={
                <div>
                  <p className="font-semibold mb-1">Generar Mapa Mental</p>
                  <p className="text-xs mb-2">
                    Crea una visualización interactiva del contenido de la
                    conversación.
                  </p>
                  <p className="text-xs italic">
                    Útil para organizar ideas y conceptos complejos
                  </p>
                </div>
              }
              position="top"
              isDarkMode={isDarkMode}
            >
              <button
                type="button"
                onClick={() => generarMapaMental()}
                disabled={isTyping}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-medium ${getColorClasses(
                  "teal",
                  false
                )} ${isTyping ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label="Generar mapa mental del contenido"
              >
                <i className="fas fa-project-diagram"></i>
                <span>Mapa Mental</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    )
  );
};

export default ContextParameters;
