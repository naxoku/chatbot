/**
 * Componente para mostrar parámetros del mensaje
 * Renderiza badges con iconos para cada parámetro aplicado
 */

import { parameterLabels } from "../config/quickActions";

/**
 * Componente MessageParameters
 * @param {Object} props - Props del componente
 * @param {Array} props.parameters - Array de parámetros del mensaje
 * @param {boolean} props.isUser - Si el mensaje es del usuario
 * @param {boolean} props.isDarkMode - Modo oscuro activado
 */
const MessageParameters = ({ parameters = [], isUser, isDarkMode }) => {
  if (!parameters || parameters.length === 0) {
    return null;
  }

  return (
    <div
      className={`mb-2 pb-2 border-b ${
        isUser
          ? "border-white/10"
          : isDarkMode
          ? "border-gray-700"
          : "border-gray-200"
      }`}
    >
      <div className="flex flex-wrap gap-1.5">
        {parameters.map((param) => {
          const paramInfo = parameterLabels[param] || {
            label: param,
            icon: "fas fa-tag",
          };

          return (
            <span
              key={param}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                isUser
                  ? "bg-white/20 text-white"
                  : isDarkMode
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <i className={`${paramInfo.icon} text-xs`}></i>
              <span>{paramInfo.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default MessageParameters;