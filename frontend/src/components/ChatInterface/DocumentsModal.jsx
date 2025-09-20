import React, { useState } from "react";

const DocumentsModal = ({ documents, onClose, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description &&
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  });

  const getDocumentIcon = (type) => {
    switch (type) {
      case "reglamento":
        return "fas fa-gavel";
      case "formulario":
        return "fas fa-file-alt";
      case "instructivo":
        return "fas fa-book";
      case "beneficio":
        return "fas fa-gift";
      default:
        return "fas fa-file";
    }
  };

  const getDocumentColor = (type) => {
    switch (type) {
      case "reglamento":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10";
      case "formulario":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10";
      case "instructivo":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10";
      case "beneficio":
        return "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/10";
    }
  };

  return (
    <>
      {/* Fondo oscuro */}
      <div
        className="fixed inset-0 bg-black/30 dark:bg-gray-900/30 z-50"
        onClick={onClose}
      />
      {/* Contenedor modal */}
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Biblioteca de Documentos DDPER
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Gestiona y accede a todos tus documentos
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              aria-label="Cerrar modal"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* Contenido */}
          <div
            className="p-6 overflow-y-auto"
            style={{ maxHeight: "calc(80vh - 160px)" }}
          >
            {/* Buscador */}
            <div className="relative mb-6">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
              <input
                type="text"
                placeholder="Buscar documentos..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Lista */}
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-file-alt text-4xl text-gray-400 dark:text-gray-500 mb-4"></i>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {searchTerm ? "Sin resultados" : "No hay documentos"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {searchTerm
                    ? "Intenta con otros términos"
                    : "Los documentos aparecerán aquí"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="group p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={onClose}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${getDocumentColor(
                          doc.type
                        )}`}
                      >
                        <i
                          className={`${getDocumentIcon(doc.type)} text-lg`}
                        ></i>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                        {doc.type}
                      </span>
                    </div>

                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {doc.title}
                    </h4>

                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      {doc.description || doc.category || "Sin descripción"}
                    </p>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Actualizado hace 2 días
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredDocuments.length} de {documents.length} documentos
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentsModal;
