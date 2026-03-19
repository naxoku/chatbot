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
  Download,
  ExternalLink,

  Eye,
} from "lucide-react";
import { useDocuments } from "./hooks/useDocuments";
import { useDebouncedSearch } from "./hooks/useDebouncedSearch";
import { getDocumentIcon } from "./utils/documentUtils";

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
  const [previewDoc, setPreviewDoc] = useState<DocumentData | null>(null);

  // Estados para la vista previa (carga vía fetch -> blob)
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);


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

  // Establecer el primer documento como vista previa por defecto si hay resultados
  useEffect(() => {
    if (!previewDoc && filteredDocuments.length > 0) {
      setPreviewDoc(filteredDocuments[0]);
    }
  }, [filteredDocuments, previewDoc]);

  // Limpiar vista previa cuando se cierre el modal
  useEffect(() => {
    if (!isOpen) {
      setPreviewDoc(null);
      setPreviewBlobUrl(null);
      setPreviewError(null);
      setPreviewLoading(false);
    }
  }, [isOpen]);

  // Cargar vista previa (fetch -> blob) cuando previewDoc cambie
  useEffect(() => {
    let currentBlob: string | null = null;
    const controller = new AbortController();

    async function loadPreview() {
      setPreviewError(null);
      setPreviewBlobUrl(null);

      if (!previewDoc) return;

      const extension = previewDoc.url.split('.').pop()?.toLowerCase() || '';
      const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
      const isPdf = extension === 'pdf' || previewDoc.type === 'reglamento' || previewDoc.title.toLowerCase().endsWith('.pdf');

      // Solo intentamos cargar si el tipo es compatible con vista previa
      if (!isImage && !isPdf) return;

      setPreviewLoading(true);
      try {
        const separator = previewDoc.url.includes('?') ? '&' : '?';
        const url = `${previewDoc.url}${separator}inline=true`;

        const resp = await fetch(url, { signal: controller.signal, credentials: 'same-origin' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const contentType = resp.headers.get('content-type') || '';
        // Validar que no sea HTML (página de error)
        if (contentType.includes('html')) {
          throw new Error('El servidor devolvió una página HTML en lugar del archivo');
        }
        // Para PDFs, aceptar application/pdf o application/octet-stream
        if (isPdf && !contentType.includes('pdf') && !contentType.includes('octet-stream')) {
          console.warn(`Content-Type inesperado para PDF: ${contentType}`);
        }
        // Para imágenes, validar que sea imagen
        if (isImage && !contentType.startsWith('image/') && !contentType.includes('octet-stream')) {
          console.warn(`Content-Type inesperado para imagen: ${contentType}`);
        }

        const blob = await resp.blob();
        const objUrl = URL.createObjectURL(blob);
        currentBlob = objUrl;
        setPreviewBlobUrl(objUrl);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Error cargando vista previa:', err);
        setPreviewError('No se pudo cargar la vista previa');
      } finally {
        setPreviewLoading(false);
      }
    }

    loadPreview();

    return () => {
      controller.abort();
      if (currentBlob) {
        URL.revokeObjectURL(currentBlob);
      }
    };
  }, [previewDoc]);

  if (!isOpen) return null;

  const categories = getCategories() || ["all"];
  const safeCategories = Array.isArray(categories) ? categories : ["all"];

  // Funciones para manejar selección múltiple
  const toggleDocumentSelection = (doc: DocumentData) => {
    setSelectedDocuments((prev) => {
      const isSelected = prev.some((d) => d.id === doc.id);
      if (isSelected) {
        return prev.filter((d) => d.id !== doc.id);
      } else {
        return [...prev, doc];
      }
    });
  };

  const handleDocumentClick = (doc: DocumentData) => {
    setPreviewDoc(doc);
  };

  const handleCheckboxChange = (doc: DocumentData) => {
    toggleDocumentSelection(doc);
  };

  const handleConfirmSelection = () => {
    onDocumentsSelect(selectedDocuments);
    onClose();
  };

  const isDocumentSelected = (doc: DocumentData) => {
    return selectedDocuments.some((d) => d.id === doc.id);
  };

  const handleDownload = async (e: React.MouseEvent, doc: DocumentData) => {
    e.stopPropagation();
    try {
      // Usar fetch para descargar como Blob, igual que en el ejemplo de referencia
      // Esto evita problemas con popups bloqueados y maneja mejor la descarga
      const response = await fetch(doc.url);
      if (!response.ok) throw new Error('Error en la descarga');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title; // Usar el título del documento como nombre de archivo
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar:', error);
      // Fallback a window.open si fetch falla
      window.open(doc.url, "_blank");
    }
  };


  const renderPreviewContent = () => {
    if (!previewDoc) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
          <Eye className="h-16 w-16 mb-4 opacity-20" />
          <p>Selecciona un documento para visualizarlo</p>
        </div>
      );
    }

    const extension = previewDoc.url.split(".").pop()?.toLowerCase() || "";
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
    const isPdf = extension === "pdf" || previewDoc.type === "reglamento" || previewDoc.title.toLowerCase().endsWith(".pdf");

    // Estado de carga/error: mostrar mensajes claros
    if (previewLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Cargando vista previa...</p>
        </div>
      );
    }

    if (previewError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-destructive p-8">
          <AlertCircle className="h-10 w-10 mb-3" />
          <p className="text-sm">{previewError}</p>
          <p className="text-xs text-muted-foreground mt-2">Si deseas, puedes descargar el archivo para verlo.</p>
          <div className="mt-4">
            <Button onClick={(e) => handleDownload(e, previewDoc)}>
              <Download className="mr-2 h-4 w-4" />
              Descargar Archivo
            </Button>
          </div>
        </div>
      );
    }

    if (isImage) {
      if (!previewBlobUrl) {
        return (
          <div className="flex items-center justify-center h-full p-8">
            <p className="text-sm text-muted-foreground">Preparando vista previa de la imagen...</p>
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center h-full overflow-auto bg-slate-50 p-4">
          <img
            src={previewBlobUrl}
            alt={previewDoc.title}
            className="max-w-full shadow-lg"
          />
        </div>
      );
    }

    if (isPdf) {
      if (!previewBlobUrl) {
        return (
          <div className="flex items-center justify-center h-full p-8">
            <p className="text-sm text-muted-foreground">Preparando vista previa del PDF...</p>
          </div>
        );
      }

      return (
        <embed src={previewBlobUrl} type="application/pdf" width="100%" height="100%" className="w-full h-full" />
      );
    }

    // Fallback para otros tipos de archivos
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 bg-slate-50">
        <div className="w-24 h-24 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
          {getDocumentIcon(previewDoc.url)}
        </div>
        <h3 className="text-xl font-medium text-foreground mb-2">{previewDoc.title}</h3>
        <p className="max-w-md text-center mb-6">
          La vista previa no está disponible para este tipo de archivo.
          Puedes descargarlo para verlo.
        </p>
        <Button onClick={(e) => handleDownload(e, previewDoc)}>
          <Download className="mr-2 h-4 w-4" />
          Descargar Archivo
        </Button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-7xl h-[90vh] bg-background rounded-xl shadow-2xl border border-border flex flex-col animate-in zoom-in-95 fade-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Documentos DDPER</h2>
              <p className="text-xs text-muted-foreground">
                {filteredDocuments.length} de {documents.length} documentos • {selectedDocuments.length} seleccionados
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Content - Two Columns */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Sidebar - Document List */}
          <div className="w-1/3 min-w-[320px] max-w-md border-r border-border flex flex-col bg-card/50">
            {/* Search & Filters */}
            <div className="p-4 space-y-4 border-b border-border bg-card">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {safeCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full text-xs h-7"
                  >
                    {category === "all" ? "Todos" : category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Cargando...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3 text-center p-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <p className="text-sm text-muted-foreground">Error al cargar documentos</p>
                  <Button variant="outline" size="sm" onClick={reloadDocuments}>Reintentar</Button>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4 space-y-2">
                  <Search className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No se encontraron documentos</p>
                </div>
              ) : (
                filteredDocuments.map((doc) => {
                  const isSelected = isDocumentSelected(doc);
                  const isPreview = previewDoc?.id === doc.id;
                  
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc)}
                      className={`group flex items-center p-3 rounded-lg border transition-all cursor-pointer ${
                        isPreview
                          ? "bg-primary/5 border-primary/20 ring-1 ring-primary/10"
                          : "bg-background border-transparent hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <div className="mr-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleCheckboxChange(doc)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </div>
                      
                      <div className="mr-3 shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                        {getDocumentIcon(doc.url)}
                      </div>

                      <div className="flex-1 min-w-0 mr-2">
                        <h4 className={`text-sm font-medium truncate ${isPreview ? 'text-primary' : 'text-foreground'}`}>
                          {doc.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded-sm bg-muted">
                            {doc.type}
                           </span>
                        </div>
                      </div>

                      {isPreview && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
                          onClick={(e) => handleDownload(e, doc)}
                          title="Descargar"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 flex flex-col bg-muted/10 h-full min-w-0">
            {/* Preview Toolbar */}
            <div className="h-12 border-b border-border bg-card/50 flex items-center justify-between px-4">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Vista Previa
              </span>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-muted-foreground hover:text-primary"
                onClick={() => {
                  if (!previewDoc) return;
                  if (previewBlobUrl) {
                    window.open(previewBlobUrl, "_blank");
                    return;
                  }
                  // Abrir URL con inline=true para intentar mostrar en navegador
                  const separator = previewDoc.url.includes('?') ? '&' : '?';
                  window.open(`${previewDoc.url}${separator}inline=true`, "_blank");
                }}
                disabled={!previewDoc}
                title="Abrir en nueva pestaña"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto relative bg-slate-100/50 p-6 flex flex-col items-center">
              <div className="w-full flex-1 bg-white shadow-xl rounded-sm transition-all duration-300 overflow-hidden">
                {renderPreviewContent()}
              </div>
            </div>

            {/* Preview Footer / Pagination (Simulated) */}
            {previewDoc && (
              <div className="h-10 border-t border-border bg-card flex items-center justify-center text-xs text-muted-foreground gap-4">
               {/* Si tuviéramos paginación real de PDF, iría aquí */}
               <span>Mostrando documento completo</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 p-4 border-t border-border bg-card flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
                Selecciona documentos para usar como contexto.
            </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose} className="min-w-[100px]">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmSelection} 
              className="min-w-[140px]"
              disabled={selectedDocuments.length === 0}
            >
              Seleccionar {selectedDocuments.length > 0 && `(${selectedDocuments.length})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
