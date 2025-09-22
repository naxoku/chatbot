import { useState } from "react";

const ArtifactsPanel = ({
  artifacts = [],
  onOpenArtifact,
  onDeleteArtifact,
  isDarkMode,
  onClose,
  onGenerateArtifact,
  isCollapsed = false,
  onCollapse = onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

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

  const effectiveCollapsed = isCollapsed;

  return (
    <div
      className={`
        h-full w-full
        flex flex-col
        border-l border-gray-200 dark:border-gray-700 shadow-xl
        ${isDarkMode ? "bg-gray-800" : "bg-white"}
      `}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <i className="fas fa-layer-group text-white text-sm"></i>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Artefactos
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {artifacts.length} elemento{artifacts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={onCollapse}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200"
          title="Cerrar panel"
          aria-label="Cerrar panel"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="p-4">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm"></i>
          <input
            type="text"
            placeholder="Buscar artefactos..."
            className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filteredArtifacts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-layer-group text-2xl text-gray-400 dark:text-gray-500"></i>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
              {searchTerm ? "Sin resultados" : "Sin artefactos"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
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
                  className="group flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/5 transition-all duration-200 cursor-pointer hover:shadow-sm"
                  onClick={() => onOpenArtifact?.(artifact)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color} shadow-sm`}
                    >
                      <i className={`${config.icon} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {artifact.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
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
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
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

      {artifacts.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/30">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {filteredArtifacts.length} de {artifacts.length} artefactos
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-colors duration-200 font-medium"
              >
                <i className="fas fa-times mr-1"></i>
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtifactsPanel;
