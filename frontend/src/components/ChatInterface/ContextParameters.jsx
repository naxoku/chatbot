const ContextParameters = ({
  onParameterChange,
  isDarkMode,
  selectedParameters = [],
  generarMapaMental,
  isTyping,
}) => {
  const parameters = [
    {
      id: "resumen",
      label: "Resumir",
      icon: "fas fa-compress-alt",
      color: "emerald",
      description: "Proporciona respuestas concisas y resumidas",
    },
    {
      id: "detallado",
      label: "Explicar mejor",
      icon: "fas fa-expand-alt",
      color: "orange",
      description: "Respuestas detalladas y explicaciones completas",
    },
    {
      id: "ejemplo",
      label: "Dar ejemplo",
      icon: "fas fa-lightbulb",
      color: "blue",
      description: "Incluye ejemplos prácticos en las respuestas",
    },
    {
      id: "continuar",
      label: "Continuar",
      icon: "fas fa-arrow-right",
      color: "purple",
      description: "Continúa o profundiza en el tema anterior",
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
    <div className="px-4 py-2">
      <div className="flex flex-wrap gap-2 justify-center">
        {parameters.map((param) => {
          const isSelected = selectedParameters.includes(param.id);
          return (
            <button
              key={param.id}
              onClick={() => handleParameterToggle(param.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-medium ${getColorClasses(
                param.color,
                isSelected
              )}`}
              title={param.description}
            >
              <i className={param.icon}></i>
              <span>{param.label}</span>
            </button>
          );
        })}

        {generarMapaMental && (
          <button
            type="button"
            onClick={() => generarMapaMental()}
            disabled={isTyping}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-medium ${getColorClasses(
              "teal",
              false
            )} ${isTyping ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Generar mapa mental del contenido"
          >
            <i className="fas fa-project-diagram"></i>
            <span>Mapa Mental</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ContextParameters;
