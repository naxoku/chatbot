import React, { useState } from "react";
import MindElixirMap from "../../utils/MindElixirMap";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DocumentReference {
  document: string;
  section: string;
  page: string;
  quote: string;
}

interface MindMapNodeData {
  name: string;
  subtitle?: string;
  icon?: string;
  reference?: DocumentReference;
  value?: number;
  children?: MindMapNodeData[];
}

interface MindMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: {
    name: string;
    data: {
      name: string;
      subtitle?: string;
      icon?: string;
      reference?: DocumentReference;
      children?: Array<{
        name: string;
        subtitle?: string;
        icon?: string;
        reference?: DocumentReference;
        value?: number;
        children?: Array<{
          name: string;
          subtitle?: string;
          icon?: string;
          reference?: DocumentReference;
          value?: number;
          children?: Array<{
            name: string;
            subtitle?: string;
            icon?: string;
            reference?: DocumentReference;
            value?: number;
            children?: unknown[];
          }>;
        }>;
      }>;
    };
    description?: string;
    createdAt?: string;
  };
  onNodeClick?: (nodeData: MindMapNodeData) => void;
}

export const MindMapModal: React.FC<MindMapModalProps> = ({
  isOpen,
  onClose,
  artifact,
  // onNodeClick no se usa actualmente
}) => {
  const [referenceModalOpen, setReferenceModalOpen] = useState(false);
  // setSelectedNodeData no se usa actualmente pero podría usarse en el futuro
  const [selectedNodeData, _setSelectedNodeData] =
    useState<MindMapNodeData | null>(null);

  // Debug logs
  console.log("🗺️ [MindMapModal] Props recibidas:", {
    isOpen,
    hasArtifact: !!artifact,
    artifactName: artifact?.name,
    hasData: !!artifact?.data,
  });

  if (!isOpen) return null;
  if (!artifact || !artifact.name || !artifact.data) {
    return (
       <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle className="text-destructive dark:text-destructive/80">
               Error
             </DialogTitle>
             <DialogDescription>
               No se pudieron cargar los datos del mapa mental.
             </DialogDescription>
           </DialogHeader>
         </DialogContent>
       </Dialog>
    );
  }

  if (!artifact.data.name) {
    return (
       <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle className="text-destructive dark:text-destructive/80">
               Error
             </DialogTitle>
             <DialogDescription>
               La estructura del mapa mental no es válida.
             </DialogDescription>
           </DialogHeader>
         </DialogContent>
       </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[99vw] h-[98vh] max-w-none max-h-none p-0">
          {/* Header minimalista */}
          <DialogHeader className="px-6 py-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                   <i className="fas fa-project-diagram text-primary dark:text-primary/80"></i>
                 </div>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    {artifact.name}
                  </DialogTitle>
                  {artifact.description && (
                    <DialogDescription className="text-sm mt-0.5">
                      {artifact.description}
                    </DialogDescription>
                  )}
                </div>
              </div>
              {artifact.createdAt && (
                <div className="text-xs text-muted-foreground">
                  {new Date(artifact.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Contenedor del mapa */}
          <div className="flex-1 w-full h-[calc(100%-70px)] p-4" style={{ minHeight: '600px' }}>
            <MindElixirMap data={artifact.data} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de referencias - Minimalista */}
      <Dialog open={referenceModalOpen} onOpenChange={setReferenceModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{selectedNodeData?.icon || "📄"}</span>
              {selectedNodeData?.name}
            </DialogTitle>
            <DialogDescription>Referencia del documento</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedNodeData?.reference && (
              <>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Documento
                  </div>
                  <div className="text-sm bg-muted/50 p-3 rounded-lg">
                    {selectedNodeData.reference.document}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Sección
                    </div>
                    <div className="text-sm bg-muted/50 p-3 rounded-lg">
                      {selectedNodeData.reference.section}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Página
                    </div>
                    <div className="text-sm bg-muted/50 p-3 rounded-lg">
                      {selectedNodeData.reference.page}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Cita textual
                  </div>
                  <div className="text-sm bg-amber-50 dark:bg-amber-950/20 border-l-2 border-amber-500 p-3 rounded-lg italic">
                    "{selectedNodeData.reference.quote}"
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Formato de citación
                  </div>
                  <div className="text-sm font-mono bg-muted/50 p-3 rounded-lg">
                    {selectedNodeData.reference.document},{" "}
                    {selectedNodeData.reference.section}, p.{" "}
                    {selectedNodeData.reference.page}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={() => setReferenceModalOpen(false)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MindMapModal;
