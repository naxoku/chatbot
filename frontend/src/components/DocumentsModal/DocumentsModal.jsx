import { useState } from "react";
import { useDocuments } from "./hooks/useDocuments";
import useDebouncedSearch from "../../hooks/useDebouncedSearch";
import { getDocumentIcon, getDocumentColor } from "../utils/documentUtils";

const DocumentsModal = ({ isOpen, onClose, onDocumentSelect, isDarkMode }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const {
    documents,
    loading,
    error,
    reloadDocuments,
    getCategories
  } = useDocuments();
  
  // Usar debounced search para optimizar el filtrado (SIEMPRE llamado en el mismo orden)
  const {
    searchTerm,
    setSearchTerm,
    filteredItems: filteredDocuments
  } = useDebouncedSearch(
    documents,
    // Función de filtro personalizada que incluye categoría
    (doc, term) => {
      // Si no hay término de búsqueda, solo filtrar por categoría
      if (!term.trim()) {
        return selectedCategory === "all" || doc.category === selectedCategory;
      }
      
      // Buscar en título, descripción, y categoría
      const searchLower = term.toLowerCase();
      const titleMatch = doc.title?.toLowerCase().includes(searchLower);
      const descMatch = doc.description?.toLowerCase().includes(searchLower);
      const categoryMatch = doc.category?.toLowerCase().includes(searchLower);
      
      // Filtrar por categoría y término de búsqueda
      const categoryFilter = selectedCategory === "all" || doc.category === selectedCategory;
      
      return categoryFilter && (titleMatch || descMatch || categoryMatch);
    },
    300 // 300ms de delay
  );

  if (!isOpen) return null;

  // Garantizar que categories siempre sea un array válido
  const categories = getCategories() || ["all"];
  
  // Asegurar que categories sea un array antes de usar .map()
  const safeCategories = Array.isArray(categories) ? categories : ["all"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border transition-all duration-300 ${
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
              <i className="fas fa-folder-open text-white text-lg"></i>
            </div>
            <div>
              <h2
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Documentos DDPER
              </h2>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {filteredDocuments.length} de {documents.length} documentos
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

        {/* Filters */}
        <div
          className={`p-6 border-b space-y-4 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {/* Search */}
          <div className="relative">
            <i
              className={`fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            ></i>
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
              } focus:outline-none focus:ring-2`}
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {safeCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-purple-600 text-white shadow-lg"
                    : isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category === "all" ? "Todos" : category}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {error ? (
            <div className="text-center py-12">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <i
                  className={`fas fa-exclamation-triangle text-2xl ${
                    isDarkMode ? "text-red-500" : "text-red-600"
                  }`}
                ></i>
              </div>
              <p
                className={`text-sm mb-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Error al cargar documentos
              </p>
              <button
                onClick={reloadDocuments}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Reintentar
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div
                className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <i
                  className={`fas fa-spinner fa-spin text-2xl ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                ></i>
              </div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Cargando documentos...
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <i
                  className={`fas fa-search text-2xl ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                ></i>
              </div>
              <p
                className={`text-sm mb-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No se encontraron documentos
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                Intenta con otros términos de búsqueda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    onDocumentSelect(doc);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                    isDarkMode
                      ? "border-gray-700 hover:border-purple-600 hover:bg-purple-900/5"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getDocumentColor(
                        doc.type
                      )}`}
                    >
                      <i className={`${getDocumentIcon(doc.url)} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-medium text-sm mb-1 line-clamp-2 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {doc.title}
                      </h3>
                      <p
                        className={`text-xs mb-2 line-clamp-2 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {doc.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-2 py-1 rounded-md ${
                            isDarkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {doc.category}
                        </span>
                        <i
                          className={`fas fa-arrow-right text-xs transition-transform duration-200 group-hover:translate-x-1 ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-6 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Selecciona un documento para obtener información específica
            </p>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsModal;