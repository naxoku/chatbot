import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  FolderOpen,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useDocuments } from "./hooks/useDocuments";
import { useDebouncedSearch } from "./hooks/useDebouncedSearch";
import { getDocumentIcon, getDocumentColor } from "./utils/documentUtils";

interface Document {
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
  onDocumentSelect: (document: Document) => void;
}

export const DocumentsModal: React.FC<DocumentsModalProps> = ({
  isOpen,
  onClose,
  onDocumentSelect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  if (!isOpen) return null;

  const categories = getCategories() || ["all"];
  const safeCategories = Array.isArray(categories) ? categories : ["all"];

  const handleDocumentClick = (doc: Document) => {
    onDocumentSelect(doc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl border bg-card border-border animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <FolderOpen className="text-accent-foreground h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">
                Documentos DDPER
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredDocuments.length} de {documents.length} documentos
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-lg"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-border space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {safeCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-lg"
              >
                {category === "all" ? "Todos" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
                <AlertCircle className="text-destructive h-8 w-8" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Error al cargar documentos
              </p>
              <Button onClick={reloadDocuments} variant="default">
                Reintentar
              </Button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">
                Cargando documentos...
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
                <Search className="text-muted-foreground h-8 w-8" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                No se encontraron documentos
              </p>
              <p className="text-xs text-muted-foreground">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleDocumentClick(doc)}
                  className="p-4 rounded-xl border border-border cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:bg-accent/50 group"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getDocumentColor(
                        doc.type
                      )}`}
                    >
                      {getDocumentIcon(doc.url)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2 text-card-foreground">
                        {doc.title}
                      </h3>
                      <p className="text-xs mb-2 line-clamp-2 text-muted-foreground">
                        {doc.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                          {doc.category}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Selecciona un documento para obtener información específica
            </p>
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
