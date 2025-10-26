import { useState } from "react";

/**
 * Panel de Ayuda Rápida
 *
 * Muestra información útil para el usuario:
 * - Shortcuts de teclado
 * - Tips de uso
 * - Funcionalidades disponibles
 */
const HelpPanel = ({ isDarkMode, onClose }) => {
  const [activeTab, setActiveTab] = useState("shortcuts");

  const shortcuts = [
    { keys: ["Enter"], description: "Enviar mensaje" },
    { keys: ["Shift", "Enter"], description: "Nueva línea en el mensaje" },
    { keys: ["Esc"], description: "Cerrar modales abiertos" },
    { keys: ["Ctrl", "K"], description: "Abrir panel de ayuda" },
  ];

  const tips = [
    {
      title: "Parámetros de Contexto",
      description:
        "Usa los botones de contexto (Resumir, Explicar mejor, etc.) para modificar cómo el asistente responde a tus preguntas.",
      icon: "fas fa-sliders-h",
    },
    {
      title: "Mapas Mentales",
      description:
        "Genera mapas mentales de cualquier conversación para visualizar mejor la información. Haz clic en el botón de mapa mental en la barra superior.",
      icon: "fas fa-project-diagram",
    },
    {
      title: "Documentos",
      description:
        "Puedes consultar documentos específicos desde el sidebar. El asistente buscará información relevante en ellos.",
      icon: "fas fa-folder-open",
    },
    {
      title: "Feedback",
      description:
        "Ayúdanos a mejorar dando feedback sobre las respuestas. Usa los botones de pulgar arriba/abajo.",
      icon: "fas fa-comment-dots",
    },
  ];

  const features = [
    {
      name: "Búsqueda Semántica",
      description:
        "El asistente busca información relevante en la base de conocimientos usando IA avanzada.",
      icon: "fas fa-search",
    },
    {
      name: "Conversaciones Persistentes",
      description:
        "Todas tus conversaciones se guardan automáticamente. Puedes volver a ellas en cualquier momento.",
      icon: "fas fa-save",
    },
    {
      name: "Modo Oscuro",
      description:
        "Cambia entre modo claro y oscuro según tu preferencia desde el sidebar.",
      icon: "fas fa-moon",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        } max-h-[80vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div
          className={`p-6 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <i className="fas fa-question-circle text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Centro de Ayuda</h2>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Aprende a usar el asistente DDPER
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className={`flex border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
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
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? isDarkMode
                    ? "bg-gray-700 text-white border-b-2 border-blue-500"
                    : "bg-gray-50 text-gray-900 border-b-2 border-blue-600"
                  : isDarkMode
                  ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "shortcuts" && (
            <div className="space-y-3">
              <p
                className={`text-sm mb-4 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Usa estos atajos de teclado para navegar más rápido:
              </p>
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    {shortcut.description}
                  </span>
                  <div className="flex space-x-1">
                    {shortcut.keys.map((key, i) => (
                      <kbd
                        key={i}
                        className={`px-3 py-1 rounded font-mono text-sm ${
                          isDarkMode
                            ? "bg-gray-600 text-gray-200 border border-gray-500"
                            : "bg-white text-gray-700 border border-gray-300 shadow-sm"
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
            <div className="space-y-4">
              <p
                className={`text-sm mb-4 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Consejos para aprovechar al máximo el asistente:
              </p>
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <i className={`${tip.icon} text-white`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{tip.title}</h3>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
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
            <div className="space-y-4">
              <p
                className={`text-sm mb-4 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Funcionalidades principales del asistente:
              </p>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <i className={`${feature.icon} text-white`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{feature.name}</h3>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
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

        {/* Footer */}
        <div
          className={`p-4 border-t ${
            isDarkMode
              ? "border-gray-700 bg-gray-700/30"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <p
            className={`text-sm text-center ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            ¿Necesitas más ayuda? Contacta a{" "}
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
