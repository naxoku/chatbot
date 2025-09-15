import React, { useState } from "react";

const DocumentsPanel = ({
  documents,
  onDocumentSelect,
  isOpen,
  onToggle,
  isCollapsed,
  onCollapse,
  isDarkMode,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Simplified document types with just one example
  const documentTypes = [
    { type: "reglamento", label: "Reglamentos", icon: "fas fa-gavel", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10" },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  });

  // Mobile toggle button when panel is closed
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-20 left-4 z-50 p-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
      >
        <i className="fas fa-file-alt text-lg"></i>
      </button>
    );
  }

  const getDocumentIcon = (type) => {
    switch (type) {
      case "reglamento": return "fas fa-gavel";
      case "formulario": return "fas fa-file-alt";
      case "instructivo": return "fas fa-book";
      case "beneficio": return "fas fa-gift";
      default: return "fas fa-file";
    }
  };

  const getDocumentColor = (type) => {
    switch (type) {
      case "reglamento": return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10";
      case "formulario": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10";
      case "instructivo": return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10";
      case "beneficio": return "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10";
      default: return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/10";
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-80"
      }`}
    >
      {/* Minimalist Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Documentos
            </h3>
          )}
          <button
            onClick={onCollapse}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            title={isCollapsed ? "Expandir" : "Colapsar"}
          >
            <i
              className={`fas ${
                isCollapsed ? "fa-chevron-right" : "fa-chevron-left"
              }`}
            ></i>
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
                placeholder="Buscar documentos..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                  <i className="fas fa-file-alt text-2xl text-gray-400"></i>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {searchTerm ? "Sin resultados" : "Sin documentos"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {searchTerm ? "Intenta otro término" : "No hay documentos disponibles"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onDocumentSelect(doc)}
                    className="group flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getDocumentColor(doc.type)}`}>
                        <i className={`${getDocumentIcon(doc.type)} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {doc.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.category}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action button */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(doc.url, "_blank");
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                        title="Ver documento"
                      >
                        <i className="fas fa-external-link-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simple Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredDocuments.length} de {documents.length} documentos
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Limpiar búsqueda
                </button>
              )}
              <div>
                <a
                  href="mailto:ddper@uct.cl"
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  ddper@uct.cl
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Collapsed state indicator */}
      {isCollapsed && (
        <div className="p-4 flex flex-col items-center space-y-4">
          <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-file-alt text-blue-600 dark:text-blue-400 text-sm"></i>
          </div>
          {documents.length > 0 && (
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
              {documents.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentsPanel;