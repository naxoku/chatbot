/**
 * Indicador de Carga Mejorado
 *
 * Muestra el estado de operaciones en curso con mensajes descriptivos
 */
const LoadingIndicator = ({
  message = "Cargando...",
  type = "default",
  isDarkMode = false,
}) => {
  const typeConfig = {
    default: {
      icon: "fas fa-spinner fa-spin",
      color: "text-blue-500",
      bgColor: isDarkMode ? "bg-blue-500/10" : "bg-blue-50",
    },
    processing: {
      icon: "fas fa-cog fa-spin",
      color: "text-purple-500",
      bgColor: isDarkMode ? "bg-purple-500/10" : "bg-purple-50",
    },
    saving: {
      icon: "fas fa-save fa-pulse",
      color: "text-green-500",
      bgColor: isDarkMode ? "bg-green-500/10" : "bg-green-50",
    },
    generating: {
      icon: "fas fa-magic fa-spin",
      color: "text-teal-500",
      bgColor: isDarkMode ? "bg-teal-500/10" : "bg-teal-50",
    },
  };

  const config = typeConfig[type] || typeConfig.default;

  return (
    <div
      className={`flex items-center space-x-3 p-3 rounded-lg ${config.bgColor}`}
    >
      <i className={`${config.icon} ${config.color} text-lg`}></i>
      <span
        className={`text-sm font-medium ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {message}
      </span>
    </div>
  );
};

export default LoadingIndicator;
