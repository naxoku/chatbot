import React, { useState } from "react";

const DocumentsPanel = ({
  documents,
  onDocumentSelect,
  isOpen,
  // onToggle,
  isCollapsed,
  onCollapse,
  isDarkMode,
}) => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Categorías y tipos para los filtros
  const documentTypes = [
    { type: "reglamento", label: "Reglamentos", icon: "fas fa-gavel" },
    { type: "formulario", label: "Formularios", icon: "fas fa-file-alt" },
    { type: "instructivo", label: "Instructivos", icon: "fas fa-book" },
    { type: "beneficio", label: "Beneficios", icon: "fas fa-gift" },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesFilter =
      filter === "all" || doc.category === filter || doc.type === filter;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const getFilterButtonClass = (buttonFilter) =>
    `text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
      filter === buttonFilter
        ? `bg-purple-600 text-white`
        : `bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`
    }`;

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-20 left-4 z-50 p-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
      >
        <i className="fas fa-bars text-lg"></i>
      </button>
    );
  }

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col transition-all duration-300 ease-in-out z-40 ${
          isCollapsed ? "w-16" : "w-80"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div
          className={`p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 ${
            isCollapsed && "justify-center"
          }`}
        >
          {!isCollapsed && (
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Documentos
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
                {documentTypes.map((docType) => (
                  <button
                    key={docType.type}
                    onClick={() => setFilter(docType.type)}
                    className={getFilterButtonClass(docType.type)}
                  >
                    <i className={`${docType.icon} mr-1`}></i>
                    {docType.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lista de documentos */}
        <div
          className={`flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 ${
            isCollapsed ? "justify-center" : "flex flex-col"
          }`}
        >
          {filteredDocuments.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <i className="fas fa-file-alt text-3xl mb-2"></i>
              <p className="text-sm">
                {searchTerm
                  ? "No se encontraron resultados"
                  : "No hay documentos disponibles"}
              </p>
            </div>
          ) : (
            <>
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onDocumentSelect(doc)}
                  className="group flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-xl p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {doc.category}
                      </p>
                    </div>
                  )}
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(doc.url, "_blank");
                      }}
                      className="p-2 rounded-full text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors"
                      title="Ver documento"
                    >
                      <i className="fas fa-external-link-alt"></i>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {!isCollapsed && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {filteredDocuments.length} de {documents.length} documentos
              </div>
              <a
                href="https://ddper.uct.cl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
              >
                <i className="fas fa-globe"></i>
                <span>Visitar sitio DDPER</span>
                <i className="fas fa-external-link-alt"></i>
              </a>
              <div className="mt-2">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilter("all");
                  }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <i className="fas fa-eraser mr-1"></i>
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentsPanel;