import { useState } from "react";

const HelpPanel = ({ isDarkMode, onClose }) => {
  const [activeTab, setActiveTab] = useState("shortcuts");

  const shortcuts = [
    { keys: ["Enter"], description: "Enviar mensaje" },
    { keys: ["Shift", "Enter"], description: "Nueva línea" },
    { keys: ["Esc"], description: "Cerrar modales" },
  ];

  const tips = [
    {
      title: "Acciones Rápidas",
      description:
        "Usa los botones de acción en cada mensaje para resumir, explicar mejor o generar mapas mentales.",
      icon: "fas fa-bolt",
    },
    {
      title: "Mapas Mentales",
      description:
        "Visualiza información compleja con mapas mentales interactivos.",
      icon: "fas fa-project-diagram",
    },
    {
      title: "Documentos",
      description:
        "Consulta documentos específicos desde el sidebar para obtener información precisa.",
      icon: "fas fa-folder-open",
    },
  ];

  const features = [
    {
      name: "Búsqueda Semántica",
      description:
        "El asistente busca información relevante usando IA avanzada.",
      icon: "fas fa-search",
    },
    {
      name: "Conversaciones Guardadas",
      description: "Todas tus conversaciones se guardan automáticamente.",
      icon: "fas fa-save",
    },
    {
      name: "Modo Oscuro",
      description: "Cambia entre modo claro y oscuro desde el sidebar.",
      icon: "fas fa-moon",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
          isDarkMode
            ? "bg-[#1a1a1a] border border-gray-800"
            : "bg-white border border-gray-200"
        } max-h-[80vh] overflow-hidden flex flex-col`}
      >
        <div
          className={`p-5 border-b ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={`text-base font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Centro de Ayuda
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                Aprende a usar el asistente
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-800 text-gray-500 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>

        <div
          className={`flex border-b ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          {[
            { id: "shortcuts", label: "Atajos", icon: "fas fa-keyboard" },
            { id: "tips", label: "Consejos", icon: "fas fa-lightbulb" },
            { id: "features", label: "Funciones", icon: "fas fa-star" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === tab.id
                  ? isDarkMode
                    ? "bg-gray-800 text-white border-b-2 border-blue-500"
                    : "bg-gray-50 text-gray-900 border-b-2 border-blue-600"
                  : isDarkMode
                  ? "text-gray-500 hover:text-white hover:bg-gray-800/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <i className={`${tab.icon} mr-2 text-xs`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "shortcuts" && (
            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {shortcut.description}
                  </span>
                  <div className="flex space-x-1">
                    {shortcut.keys.map((key, i) => (
                      <kbd
                        key={i}
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          isDarkMode
                            ? "bg-gray-700 text-gray-200 border border-gray-600"
                            : "bg-white text-gray-700 border border-gray-300"
                        }`}
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "tips" && (
            <div className="space-y-2">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isDarkMode
                          ? "bg-blue-900/30 text-blue-400"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <i className={`${tip.icon} text-xs`}></i>
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-medium text-sm mb-1 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {tip.title}
                      </h3>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-gray-500" : "text-gray-600"
                        }`}
                      >
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isDarkMode
                          ? "bg-emerald-900/30 text-emerald-400"
                          : "bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      <i className={`${feature.icon} text-xs`}></i>
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-medium text-sm mb-1 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {feature.name}
                      </h3>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-gray-500" : "text-gray-600"
                        }`}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`p-4 border-t ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <p
            className={`text-xs text-center ${
              isDarkMode ? "text-gray-500" : "text-gray-600"
            }`}
          >
            ¿Necesitas más ayuda?{" "}
            <a
              href="mailto:ddper@uct.cl"
              className="text-blue-500 hover:underline"
            >
              ddper@uct.cl
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpPanel;
