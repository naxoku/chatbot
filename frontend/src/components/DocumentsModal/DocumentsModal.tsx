import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  X,
  FolderOpen,
  AlertCircle,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import { useDocuments } from "./hooks/useDocuments";
import { useDebouncedSearch } from "./hooks/useDebouncedSearch";
import { getDocumentIcon, getDocumentColor } from "./utils/documentUtils";

// Tipo simple para documentos
interface DocumentData {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  url: string;
  keywords?: string[];
}

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentsSelect: (documents: DocumentData[]) => void;
  preselectedDocuments?: DocumentData[];
}

export const DocumentsModal: React.FC<DocumentsModalProps> = ({
  isOpen,
  onClose,
  onDocumentsSelect,
  preselectedDocuments = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentData[]>(preselectedDocuments);

  const { documents, loading, error, reloadDocuments, getCategories } =
    useDocuments();

  const {
    searchTerm,
    setSearchTerm,
    filteredItems: filteredDocuments,
  } = useDebouncedSearch(
    documents,
    (doc, term) => {
      if (!term.trim()) {
        return selectedCategory === "all" || doc.category === selectedCategory;
      }

      const searchLower = term.toLowerCase();
      const titleMatch = doc.title?.toLowerCase().includes(searchLower);
      const descMatch = doc.description?.toLowerCase().includes(searchLower);
      const categoryMatch = doc.category?.toLowerCase().includes(searchLower);

      const categoryFilter =
        selectedCategory === "all" || doc.category === selectedCategory;

      return categoryFilter && (titleMatch || descMatch || categoryMatch);
    },
    300
  );

  // Sincronizar documentos preseleccionados cuando cambian
  useEffect(() => {
    setSelectedDocuments(preselectedDocuments);
  }, [preselectedDocuments]);

  if (!isOpen) return null;

  const categories = getCategories() || ["all"];
  const safeCategories = Array.isArray(categories) ? categories : ["all"];

  // Funciones para manejar selección múltiple
  const toggleDocumentSelection = (doc: DocumentData) => {
    setSelectedDocuments(prev => {
      const isSelected = prev.some(d => d.id === doc.id);
      if (isSelected) {
        return prev.filter(d => d.id !== doc.id);
      } else {
        return [...prev, doc];
      }
    });
  };

  const handleDocumentClick = (doc: DocumentData) => {
    toggleDocumentSelection(doc);
  };

  const handleConfirmSelection = () => {
    onDocumentsSelect(selectedDocuments);
    onClose();
  };

  const selectAllDocuments = () => {
    setSelectedDocuments(filteredDocuments);
  };

  const clearAllSelections = () => {
    setSelectedDocuments([]);
  };

  const isDocumentSelected = (doc: DocumentData) => {
    return selectedDocuments.some(d => d.id === doc.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] rounded-xl shadow-2xl border bg-card border-border animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
              <FolderOpen className="text-accent-foreground h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-card-foreground truncate">
                Documentos DDPER
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {filteredDocuments.length} de {documents.length} documentos • {selectedDocuments.length} seleccionados
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {selectedDocuments.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllSelections}
                  className="rounded-lg px-2 sm:px-3"
                  aria-label="Limpiar selección"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Limpiar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllDocuments}
                  className="rounded-lg px-2 sm:px-3"
                  aria-label="Seleccionar todos"
                >
                  <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Todo</span>
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-lg shrink-0"
              aria-label="Cerrar modal"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 sm:p-6 border-b border-border space-y-3 sm:space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {safeCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-lg text-xs sm:text-sm"
              >
                {category === "all" ? "Todos" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[50vh] sm:max-h-96 overflow-y-auto">
          {error ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
                <AlertCircle className="text-destructive h-6 w-6 sm:h-8 sm:w-8" aria-hidden="true" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Error al cargar documentos
              </p>
              <Button onClick={reloadDocuments} variant="default" size="sm">
                Reintentar
              </Button>
            </div>
          ) : loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center">
                <Loader2 className="text-muted-foreground h-5 w-5 sm:h-6 sm:w-6 animate-spin" aria-hidden="true" />
              </div>
              <p className="text-sm text-muted-foreground">
                Cargando documentos...
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
                <Search className="text-muted-foreground h-6 w-6 sm:h-8 sm:w-8" aria-hidden="true" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                No se encontraron documentos
              </p>
              <p className="text-sm text-muted-foreground">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {filteredDocuments.map((doc) => {
                const selected = isDocumentSelected(doc);
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleDocumentClick(doc)}
                    className={`p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                      selected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center space-x-2 shrink-0">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => handleDocumentClick(doc)}
                          className="mt-1"
                        />
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${getDocumentColor(
                            doc.type
                          )}`}
                        >
                          {getDocumentIcon(doc.title)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm mb-1 line-clamp-2 text-card-foreground">
                          {doc.title}
                        </h3>
                        <p className="text-sm mb-2 line-clamp-2 text-muted-foreground">
                          {doc.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                            {doc.category}
                          </span>
                          {selected ? (
                            <CheckSquare className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-muted-foreground min-w-0">
              {selectedDocuments.length > 0 ? (
                <span className="truncate block sm:inline">
                  {selectedDocuments.length} documento{selectedDocuments.length !== 1 ? 's' : ''} seleccionado{selectedDocuments.length !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="truncate block sm:inline">Selecciona documentos para usar como contexto</span>
              )}
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button onClick={onClose} variant="outline" size="sm" className="flex-1 sm:flex-none">
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmSelection}
                disabled={selectedDocuments.length === 0}
                size="sm"
                className="flex-1 sm:flex-none min-w-[120px]"
              >
                {selectedDocuments.length > 0 ? (
                  <>
                    <CheckSquare className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                    <span className="hidden sm:inline">Usar Documentos</span>
                    <span className="sm:hidden">Usar ({selectedDocuments.length})</span>
                  </>
                ) : (
                  'Seleccionar'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
