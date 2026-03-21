import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  FileText,
  FileType,
  Info,
  ExternalLink,
  X,
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
  const [showPreview, setShowPreview] = useState(false);

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
  // Limpiar vista previa cuando se cierre el modal
  useEffect(() => {
    if (!isOpen) {
      setPreviewDoc(null);
      setPreviewBlobUrl(null);
      setPreviewError(null);
      setPreviewLoading(false);
      setShowPreview(false);
    }
  }, [isOpen]);

  // Cargar vista previa (fetch -> blob) cuando previewDoc cambie Y showPreview esté activo
  useEffect(() => {
    let currentBlob: string | null = null;
    const controller = new AbortController();

    if (!showPreview || !previewDoc) {
      setPreviewBlobUrl(null);
      setPreviewError(null);
      return;
    }

    const doc = previewDoc;
    const extension = doc.url.split('.').pop()?.toLowerCase() || '';
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
    const isPdf = extension === 'pdf' || doc.type === 'reglamento' || doc.title.toLowerCase().endsWith('.pdf');

    if (!isImage && !isPdf) return;

    setPreviewLoading(true);

    async function loadPreview() {
      try {
        const separator = doc.url.includes('?') ? '&' : '?';
        const url = `${doc.url}${separator}inline=true`;

        const resp = await fetch(url, { signal: controller.signal, credentials: 'same-origin' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('html')) {
          throw new Error('El servidor devolvió una página HTML en lugar del archivo');
        }
        if (isPdf && !contentType.includes('pdf') && !contentType.includes('octet-stream')) {
          console.warn(`Content-Type inesperado para PDF: ${contentType}`);
        }
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
  }, [previewDoc, showPreview]);

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

  const handleViewPreview = (doc: DocumentData) => {
    setPreviewDoc(doc);
    setShowPreview(true);
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
      const response = await fetch(doc.url);
      if (!response.ok) throw new Error('Error en la descarga');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar:', error);
      window.open(doc.url, "_blank");
    }
  };

  const getDocumentTypeIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    if (extension === 'pdf' || url.toLowerCase().includes('.pdf')) {
      return <FileType className="h-6 w-6" />;
    }
    return <FileText className="h-6 w-6" />;
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

  // Renderiza el item de documento para web
  const renderWebDocumentItem = (doc: DocumentData) => {
    const isSelected = isDocumentSelected(doc);
    const isPreview = previewDoc?.id === doc.id;
    
    return (
      <div
        key={doc.id}
        onClick={() => handleDocumentClick(doc)}
        className={`group flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
          isSelected
            ? "bg-blue-50 border border-blue-200 shadow-sm"
            : isPreview
            ? "bg-primary/5 border border-primary/20"
            : "hover:bg-muted border border-transparent hover:shadow-sm"
        }`}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => handleCheckboxChange(doc)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
        
        <div className="text-primary">
          {getDocumentTypeIcon(doc.url)}
        </div>

        <div className="flex-1 min-w-0">
           <h4 className={`text-sm font-semibold truncate ${
             isSelected ? 'text-primary' : isPreview ? 'text-primary' : 'text-foreground'
           }`}>
            {doc.title}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
             <span className={`text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm ${
               isSelected ? 'bg-primary/10 text-primary-foreground' : 'bg-muted/10 text-muted-foreground'
             }`}>
              {doc.type}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={(e) => handleDownload(e, doc)}
          title="Descargar"
        >
          <Download className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            handleViewPreview(doc);
          }}
          title="Ver Previa"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Renderiza el item de documento para móvil
  const renderMobileDocumentItem = (doc: DocumentData) => {
    const isSelected = isDocumentSelected(doc);
    
    return (
      <div
        key={doc.id}
        onClick={() => handleDocumentClick(doc)}
        className="group flex items-center p-4 bg-background rounded-xl transition-all"
      >
        <div className="mr-4" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => handleCheckboxChange(doc)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
        
        <div className="h-12 w-12 flex items-center justify-center rounded-lg mr-4 bg-primary/5 text-primary">
          {getDocumentTypeIcon(doc.url)}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold truncate tracking-tight text-foreground">
            {doc.title}
          </h4>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
            {doc.type}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-primary hover:bg-primary/5 rounded-full mr-2"
          onClick={(e) => handleDownload(e, doc)}
          title="Descargar"
        >
          <Download className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-primary hover:bg-primary/5 rounded-full"
          onClick={async (e) => {
            e.stopPropagation();
            
            // Cargar el documento y abrirlo en nueva pestaña
            try {
              const separator = doc.url.includes('?') ? '&' : '?';
              const url = `${doc.url}${separator}inline=true`;
              
              const resp = await fetch(url, { credentials: 'same-origin' });
              if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
              
              const blob = await resp.blob();
              const blobUrl = URL.createObjectURL(blob);
              
              const newWindow = window.open("", "_blank");
              if (newWindow) {
                const formattedTitle = doc.title
                  .replace(/\.(pdf|jpg|jpeg|png|gif|webp)$/i, '')
                  .split(/[\s_-]+/)
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
                
                newWindow.document.title = formattedTitle || doc.title;
                newWindow.document.body.style.margin = "0";
                newWindow.document.body.style.padding = "0";
                newWindow.document.body.style.overflow = "hidden";
                newWindow.document.body.style.backgroundColor = "#525659";
                
                const iframe = newWindow.document.createElement("iframe");
                iframe.style.position = "absolute";
                iframe.style.top = "0";
                iframe.style.left = "0";
                iframe.style.width = "100%";
                iframe.style.height = "100%";
                iframe.style.border = "none";
                iframe.src = blobUrl;
                newWindow.document.body.appendChild(iframe);
              }
            } catch (error) {
              console.error('Error al abrir vista previa:', error);
              // Fallback: abrir URL directa
              const separator = doc.url.includes('?') ? '&' : '?';
              window.open(`${doc.url}${separator}inline=true`, "_blank");
            }
          }}
          title="Vista previa"
        >
          <Eye className="h-5 w-5" />
        </Button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container - Responsive */}
      <div className="relative w-full max-w-7xl h-[90vh] md:max-h-[900px] bg-background rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden">
        
        {/* ==================== WEB LAYOUT (md+) ==================== */}
        <div className="hidden md:flex flex-1 min-h-0">
          {/* Left Sidebar - 420px */}
          <aside className={`bg-muted/30 flex flex-col border-r border-border transition-all duration-300 ease-in-out ${showPreview ? 'w-[420px]' : 'w-full'}`}>
            <div className="p-6 pb-4">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-background border-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="mt-6 flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-wider uppercase text-muted-foreground">Biblioteca de Documentos</h2>
                <span className="text-xs font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded">
                  {documents.length} Archivos
                </span>
              </div>
              <div className="flex gap-2 mt-4 flex-wrap">
                {safeCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg"
                  >
                    {category === "all" ? "Todos" : category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto px-3 pb-6">
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
                <div className="flex flex-col gap-1">
                  {filteredDocuments.map(renderWebDocumentItem)}
                </div>
              )}
            </div>
          </aside>

          {/* Right Panel - Preview */}
          <main className={`bg-muted/10 flex flex-col relative transition-all duration-300 ease-in-out overflow-hidden ${showPreview ? 'flex-1 opacity-100' : 'w-0 opacity-0'}`}>
            {!showPreview ? null : (
              <>
                {/* Viewer Header */}
                <div className="flex items-center justify-between px-8 py-4 bg-background border-b border-border">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Vista Previa</span>
                    <p className="text-sm font-bold text-foreground">
                      {previewDoc?.title || "Ningún documento seleccionado"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/5"
                      onClick={() => {
                        if (!previewDoc) return;
                        
                        // Si tenemos blobUrl, abrir en nueva ventana con título personalizado
                        if (previewBlobUrl) {
                          const newWindow = window.open("", "_blank");
                          if (newWindow) {
                            // Formatear el título: capitalizar primera letra de cada palabra
                            const formattedTitle = previewDoc.title
                              .replace(/\.(pdf|jpg|jpeg|png|gif|webp)$/i, '') // Quitar extensión
                              .split(/[\s_-]+/) // Dividir por espacios, guiones y guiones bajos
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalizar
                              .join(' '); // Unir con espacios
                            
                            newWindow.document.title = formattedTitle || previewDoc.title;
                            newWindow.document.body.style.margin = "0";
                            newWindow.document.body.style.padding = "0";
                            newWindow.document.body.style.overflow = "hidden";
                            newWindow.document.body.style.backgroundColor = "#525659";
                            
                            const iframe = newWindow.document.createElement("iframe");
                            iframe.style.position = "absolute";
                            iframe.style.top = "0";
                            iframe.style.left = "0";
                            iframe.style.width = "100%";
                            iframe.style.height = "100%";
                            iframe.style.border = "none";
                            iframe.src = previewBlobUrl;
                            newWindow.document.body.appendChild(iframe);
                          }
                          return;
                        }
                        
                        // Fallback: abrir URL directa con inline=true
                        const separator = previewDoc.url.includes('?') ? '&' : '?';
                        window.open(`${previewDoc.url}${separator}inline=true`, "_blank");
                      }}
                      disabled={!previewDoc}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir en nueva pestaña
                    </Button>
                    <div className="w-px h-6 bg-border mx-1"></div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPreview(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 overflow-auto bg-white">
                  {renderPreviewContent()}
                </div>
              </>
            )}
          </main>
        </div>

        {/* ==================== MOBILE LAYOUT (< md) ==================== */}
        <div className="flex flex-col md:hidden h-full">
          {/* Search & Filters */}
          <div className="px-6 pt-6 pb-4 bg-muted/20 shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-12 pr-4 bg-background border-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {safeCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider"
                >
                  {category === "all" ? "Todos" : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Document List */}
          <main className="flex-1 overflow-y-auto px-6 py-4 pb-32">
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
              <div className="space-y-4">
                {filteredDocuments.map(renderMobileDocumentItem)}
              </div>
            )}
          </main>

          {/* Mobile Footer */}
          <footer className="bg-background px-4 py-4 flex gap-3 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] border-t border-border shrink-0">
            <Button 
              variant="outline" 
              className="flex-1 h-11 text-xs font-semibold rounded-lg"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-[1.5] h-11 text-xs font-semibold rounded-lg shadow-md"
              onClick={handleConfirmSelection}
              disabled={selectedDocuments.length === 0}
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Seleccionar {selectedDocuments.length > 0 && `(${selectedDocuments.length})`}
            </Button>
          </footer>
        </div>

        {/* ==================== WEB FOOTER (md+) ==================== */}
        <footer className="hidden md:flex px-8 py-5 bg-background border-t border-border items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Info className="h-4 w-4" />
            <span>{selectedDocuments.length} documento(s) seleccionado(s) para procesar</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-primary hover:bg-muted">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmSelection}
              className="px-8 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg"
              disabled={selectedDocuments.length === 0}
            >
              Seleccionar {selectedDocuments.length > 0 && `(${selectedDocuments.length})`}
            </Button>
          </div>
        </footer>

      </div>
    </div>
  );
};