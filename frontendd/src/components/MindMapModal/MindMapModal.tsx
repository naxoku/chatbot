import React from "react";
import ReactFlowMindMap from "../../utils/ReactFlowMindMap";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface MindMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: {
    name: string;
    data: {
      name: string;
      subtitle?: string;
      icon?: string;
      children?: Array<{
        name: string;
        subtitle?: string;
        icon?: string;
        children?: Array<{
          name: string;
          subtitle?: string;
          icon?: string;
          children?: Array<{
            name: string;
            subtitle?: string;
            icon?: string;
            children?: unknown[];
          }>;
        }>;
      }>;
    };
    description?: string;
    createdAt?: string;
  };
}

export const MindMapModal: React.FC<MindMapModalProps> = ({
  isOpen,
  onClose,
  artifact,
}) => {
  // Debug logs para diagnosticar problemas
  console.log("🗺️ [MindMapModal] Props recibidas:", {
    isOpen,
    hasArtifact: !!artifact,
    artifactName: artifact?.name,
    hasData: !!artifact?.data,
    dataKeys: artifact?.data ? Object.keys(artifact.data) : null,
  });

  if (artifact?.data) {
    console.log(
      "📋 [MindMapModal] Estructura del artifact.data:",
      JSON.stringify(artifact.data, null, 2)
    );
  }

  if (artifact) {
    console.log(
      "🔍 [MindMapModal] Artifact completo:",
      JSON.stringify(artifact, null, 2)
    );
  }

  // Validación más robusta con logs detallados
  if (!isOpen) {
    console.log("🚪 [MindMapModal] Modal no está abierto");
    return null;
  }

  if (!artifact) {
    console.error("❌ [MindMapModal] Error: No se recibió artifact");
    return null;
  }

  if (!artifact.name) {
    console.error("❌ [MindMapModal] Error: artifact.name está faltando");
    return null;
  }

  if (!artifact.data) {
    console.error("❌ [MindMapModal] Error: artifact.data está faltando");
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[98vw] h-[95vh] max-w-none max-h-none p-0 max-w-sm sm:max-w-4xl">
          <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border">
            <DialogTitle className="text-lg sm:text-xl">
              Error: Datos de mapa mental faltantes
            </DialogTitle>
            <DialogDescription className="text-sm">
              No se pudieron cargar los datos del mapa mental.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 sm:p-6">
            <p className="text-sm text-muted-foreground">
              Los datos del mapa mental no están disponibles. Por favor, intenta
              generar un nuevo mapa mental.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Validación adicional de la estructura de datos
  if (!artifact.data.name) {
    console.error("❌ [MindMapModal] Error: artifact.data.name está faltando");
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[96vw] max-h-[92vh] p-0 max-w-sm sm:max-w-4xl">
          <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border">
            <DialogTitle className="text-lg sm:text-xl">
              Error: Estructura de datos inválida
            </DialogTitle>
            <DialogDescription className="text-sm">
              La estructura del mapa mental no es válida.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground font-mono break-all">
              El mapa mental no tiene un nodo raíz válido. Estructura recibida:{" "}
              {JSON.stringify(artifact.data, null, 2)}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  console.log("✅ [MindMapModal] Modal se renderizará correctamente");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[96vw] max-h-[92vh] p-0 max-w-sm sm:max-w-4xl">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <i className="fas fa-project-diagram text-sm text-amber-600 dark:text-amber-400"></i>
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg sm:text-xl truncate">
                {artifact.name}
              </DialogTitle>
              {artifact.description && (
                <DialogDescription className="text-xs sm:text-sm line-clamp-2">
                  {artifact.description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {artifact.createdAt && (
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-border bg-muted/50">
            <div className="flex items-center justify-end text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1 shrink-0">
                <i className="fas fa-clock text-xs"></i>
                <span className="hidden sm:inline">
                  {new Date(artifact.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="sm:hidden">
                  {new Date(artifact.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 w-full h-[calc(100%-100px)] sm:h-[calc(100%-120px)]">
          <ReactFlowMindMap data={artifact.data} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MindMapModal;
