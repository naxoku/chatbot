import React, { useState } from "react";

const ArtifactsPanel = ({
  artifacts,
  onOpenArtifact,
  onDeleteArtifact,
  isOpen,
  onToggle,
  isCollapsed,
  onCollapse,
  isDarkMode,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Simplified with just one example artifact type
  const typeConfig = {
    mindmap: {
      label: "Mapa Mental",
      icon: "fas fa-project-diagram",
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10",
    },
  };

  const filteredArtifacts = artifacts.filter((artifact) => {
    const matchesSearch =
      artifact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artifact.description &&
        artifact.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-full flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-80"
      }`}
    >
      {/* Minimalist Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Herramientas
            </h3>
          )}
          <button
  onClick={onCollapse}
  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
  title={isCollapsed ? "Expandir" : "Colapsar"}
>
  <i className={`fas ${isCollapsed ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
</button>
        </div>
      </div>

      {/* Content (hidden when collapsed) */}
      {!isCollapsed && (
        <>
          {/* Simple Search */}
          <div className="p-4">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder="Buscar herramientas..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Artifacts List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {filteredArtifacts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                  <i className="fas fa-layer-group text-2xl text-gray-400"></i>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {searchTerm ? "Sin resultados" : "Sin herramientas"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {searchTerm ? "Intenta otro término" : "Crea tu primera herramienta"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredArtifacts.map((artifact) => {
                  const config = typeConfig[artifact.type] || typeConfig.mindmap;
                  return (
                    <div
                      key={artifact.id}
                      className="group flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                          <i className={`${config.icon} text-sm`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {artifact.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {config.label}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenArtifact(artifact);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                          title="Abrir"
                        >
                          <i className="fas fa-eye text-xs"></i>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteArtifact(artifact.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                          title="Eliminar"
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

          {/* Simple Footer */}
          {artifacts.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {filteredArtifacts.length} de {artifacts.length} herramientas
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ArtifactsPanel;