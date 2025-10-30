
import useDebouncedSearch from "../hooks/useDebouncedSearch";

const ArtifactsModal = ({
  isOpen,
  onClose,
  artifacts = [],
  onOpenArtifact,
  onDeleteArtifact,
  isDarkMode,
}) => {
  // Usar debounced search para optimizar el filtrado (SIEMPRE llamado en el mismo orden)
  const {
    searchTerm,
    setSearchTerm,
    filteredItems: filteredArtifacts
  } = useDebouncedSearch(
    artifacts,
    // Función de filtro personalizada para artefactos
    (artifact, term) => {
      if (!term.trim()) return true;
      
      const searchLower = term.toLowerCase();
      const nameMatch = artifact.name?.toLowerCase().includes(searchLower);
      const descriptionMatch = artifact.description?.toLowerCase().includes(searchLower);
      const typeMatch = artifact.type?.toLowerCase().includes(searchLower);
      
      return nameMatch || descriptionMatch || typeMatch;
    },
    300 // 300ms de delay
  );

  if (!isOpen) return null;

  const typeConfig = {
    mindmap: {
      label: "Mapa Mental",
      icon: "fas fa-project-diagram",
      color: isDarkMode
        ? "text-purple-400 bg-purple-900/20"
        : "text-purple-600 bg-purple-50",
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl ${
          isDarkMode
            ? "bg-[#1a1a1a] border border-gray-800"
            : "bg-white border border-gray-200"
        }`}
      >
        <div
          className={`flex items-center justify-between p-5 border-b ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div>
            <h2
              className={`text-base font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Artefactos
            </h2>
            <p
              className={`text-xs mt-0.5 ${
                isDarkMode ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {filteredArtifacts.length} de {artifacts.length} artefactos
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "text-gray-500 hover:text-white hover:bg-gray-800"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <div
          className={`p-5 border-b ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="relative">
            <i
              className={`fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-xs ${
                isDarkMode ? "text-gray-600" : "text-gray-400"
              }`}
            ></i>
            <input
              type="text"
              placeholder="Buscar artefactos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:border-gray-600"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-gray-300"
              } focus:outline-none`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredArtifacts.length === 0 ? (
            <div className="text-center py-12">
              <div
                className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <i
                  className={`fas fa-layer-group text-lg ${
                    isDarkMode ? "text-gray-600" : "text-gray-400"
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
                  isDarkMode ? "text-gray-600" : "text-gray-500"
                }`}
              >
                {searchTerm
                  ? "Intenta otro término"
                  : "Genera tu primer artefacto en el chat"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredArtifacts.map((artifact) => {
                const config = typeConfig[artifact.type] || typeConfig.mindmap;
                return (
                  <div
                    key={artifact.id || artifact.name}
                    className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                      isDarkMode
                        ? "border-gray-800 hover:border-gray-700 hover:bg-gray-800/50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => onOpenArtifact?.(artifact)}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}
                      >
                        <i className={`${config.icon} text-xs`}></i>
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
                            isDarkMode ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          {artifact.description || config.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenArtifact?.(artifact);
                        }}
                        className={`p-1.5 rounded-lg ${
                          isDarkMode
                            ? "text-gray-500 hover:text-blue-400 hover:bg-blue-900/20"
                            : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        title="Abrir"
                      >
                        <i className="fas fa-eye text-xs"></i>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteArtifact?.(artifact.id);
                        }}
                        className={`p-1.5 rounded-lg ${
                          isDarkMode
                            ? "text-gray-500 hover:text-red-400 hover:bg-red-900/20"
                            : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                        }`}
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
      </div>
    </div>
  );
};

export default ArtifactsModal;
