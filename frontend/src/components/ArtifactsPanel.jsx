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
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredArtifacts = artifacts.filter((artifact) => {
    const matchesFilter = filter === "all" || artifact.type === filter;
    const matchesSearch =
      artifact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artifact.description &&
        artifact.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getFilterButtonClass = (buttonFilter) =>
    `text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
      filter === buttonFilter
        ? `bg-purple-600 text-white`
        : `bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`
    }`;

  const typeConfig = {
    mindmap: {
      label: "Mapa Mental",
      icon: "fas fa-project-diagram",
      color: "purple",
    },
    summary: {
      label: "Resumen",
      icon: "fas fa-file-alt",
      color: "blue",
    },
    analysis: {
      label: "Análisis",
      icon: "fas fa-chart-bar",
      color: "green",
    },
    diagram: {
      label: "Diagrama",
      icon: "fas fa-vector-square",
      color: "orange",
    },
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-20 right-4 z-50 p-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
      >
        <i className="fas fa-layer-group text-lg"></i>
      </button>
    );
  }

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-full flex flex-col transition-all duration-300 ease-in-out z-40 ${
          isCollapsed ? "w-16" : "w-80"
        } ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div
          className={`p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 ${
            isCollapsed && "justify-center"
          }`}
        >
          {!isCollapsed && (
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Herramientas
            </h3>
          )}
          <div className="flex items-center space-x-2">
            <button
              onClick={onCollapse}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <i
                className={`fas ${
                  isCollapsed ? "fa-expand-alt" : "fa-compress-alt"
                }`}
              ></i>
            </button>
            
          </div>
        </div>

        {/* Contenido (oculto si está colapsado) */}
        {!isCollapsed && (
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Filtrar por tipo
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={getFilterButtonClass("all")}
                >
                  Todos
                </button>
                {Object.keys(typeConfig).map((key) => {
                  const config = typeConfig[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={getFilterButtonClass(key)}
                    >
                      <i className={`${config.icon} mr-1`}></i>
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Lista de artefactos */}
        <div
          className={`flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 ${
            isCollapsed ? "justify-center" : "flex flex-col"
          }`}
        >
          {filteredArtifacts.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <i className="fas fa-box-open text-3xl mb-2"></i>
              <p className="text-sm">
                {searchTerm
                  ? "No se encontraron resultados"
                  : "No hay artefactos"}
              </p>
            </div>
          ) : (
            <>
              {filteredArtifacts.map((artifact) => {
                const typeConfig =
                  typeConfig[artifact.type] || typeConfig.diagram; // Fallback a 'diagram'
                return (
                  <div
                    key={artifact.id}
                    className="group flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-xl p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-${typeConfig.color}-50 dark:bg-${typeConfig.color}-900/20 text-${typeConfig.color}-600 dark:text-${typeConfig.color}-400`}
                        >
                          <i className={`${typeConfig.icon} text-sm`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {artifact.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {typeConfig.label}
                          </p>
                        </div>
                      </div>
                    )}
                    <div
                      className={`flex space-x-1 ${
                        isCollapsed ? "flex-col space-y-2" : ""
                      }`}
                    >
                      <button
                        onClick={() => onDeleteArtifact(artifact.id)}
                        className={`p-2 rounded-full text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors ${
                          !isCollapsed && "opacity-0 group-hover:opacity-100"
                        }`}
                        title="Eliminar"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                      <button
                        onClick={() => onOpenArtifact(artifact)}
                        className={`p-2 rounded-full text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors ${
                          !isCollapsed && "opacity-0 group-hover:opacity-100"
                        }`}
                        title="Abrir"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {!isCollapsed && (
          /* Footer */
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {artifacts.length > 0 ? (
                  <>
                    Mostrando {filteredArtifacts.length} de {artifacts.length}{" "}
                    artefactos
                  </>
                ) : (
                  "Comienza creando tu primer artefacto"
                )}
              </div>
              {artifacts.length > 0 && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilter("all");
                  }}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                >
                  <i className="fas fa-refresh mr-1"></i>
                  Mostrar todos
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ArtifactsPanel;