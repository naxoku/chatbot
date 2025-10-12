import { useState } from "react";

const ArtifactsModal = ({
  isOpen,
  onClose,
  artifacts = [],
  onOpenArtifact,
  onDeleteArtifact,
  onGenerateArtifact,
  isDarkMode,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const typeConfig = {
    mindmap: {
      label: "Mapa Mental",
      icon: "fas fa-project-diagram",
      color:
        "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10",
    },
  };

  const filteredArtifacts = artifacts.filter((artifact) => {
    const matchesSearch =
      artifact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artifact.description &&
        artifact.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleGenerate = () => {
    if (onGenerateArtifact) {
      onGenerateArtifact("Genera un mapa mental sobre los beneficios DDPER");
    }
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border transition-all duration-300 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-layer-group text-white text-lg"></i>
            </div>
            <div>
              <h2
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Artefactos
              </h2>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {filteredArtifacts.length} de {artifacts.length} artefactos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Search */}
        <div
          className={`p-6 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="relative">
            <i
              className={`fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            ></i>
            <input
              type="text"
              placeholder="Buscar artefactos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
              } focus:outline-none focus:ring-2`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredArtifacts.length === 0 ? (
            <div className="text-center py-12">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <i
                  className={`fas fa-layer-group text-2xl ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                ></i>
              </div>
              <p
                className={`text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {searchTerm ? "Sin resultados" : "Sin artefactos"}
              </p>
              <p
                className={`text-xs mb-4 ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                {searchTerm
                  ? "Intenta otro término"
                  : "Genera tu primer artefacto en el chat"}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Crear Artefacto
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArtifacts.map((artifact) => {
                const config = typeConfig[artifact.type] || typeConfig.mindmap;
                return (
                  <div
                    key={artifact.id || artifact.name}
                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                      isDarkMode
                        ? "border-gray-700 hover:border-purple-600 hover:bg-purple-900/5"
                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                    onClick={() => onOpenArtifact?.(artifact)}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color} shadow-sm`}
                      >
                        <i className={`${config.icon} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {artifact.name}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {artifact.description || config.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenArtifact?.(artifact);
                        }}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isDarkMode
                            ? "text-gray-400 hover:text-blue-400 hover:bg-blue-900/20"
                            : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        title="Abrir"
                        aria-label="Abrir artefacto"
                      >
                        <i className="fas fa-eye text-xs"></i>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteArtifact?.(artifact.id);
                        }}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isDarkMode
                            ? "text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                            : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                        }`}
                        title="Eliminar"
                        aria-label="Eliminar artefacto"
                      >
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtifactsModal;
