import React from "react";
import { Download } from "lucide-react";
import ReactFlowMindMap from "../../utils/ReactFlowMindMap";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

  const handleExport = () => {
    // Función de exportación para react-flow
    const element = document.querySelector(".react-flow");
    if (!element) return;

    const svg = element.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = element.clientWidth;
    canvas.height = element.clientHeight;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);

      const link = document.createElement("a");
      link.download = `${artifact.name.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

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
        <DialogContent className="max-w-[96vw] max-h-[92vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>Error: Datos de mapa mental faltantes</DialogTitle>
            <DialogDescription>
              No se pudieron cargar los datos del mapa mental.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
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
        <DialogContent className="max-w-[96vw] max-h-[92vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>Error: Estructura de datos inválida</DialogTitle>
            <DialogDescription>
              La estructura del mapa mental no es válida.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <p className="text-sm text-muted-foreground">
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
      <DialogContent className="max-w-[96vw] max-h-[92vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <i className="fas fa-project-diagram text-sm text-primary"></i>
              </div>
              <div>
                <DialogTitle>{artifact.name}</DialogTitle>
                {artifact.description && (
                  <DialogDescription>{artifact.description}</DialogDescription>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-3 border-b bg-muted/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <i className="fas fa-mouse text-xs"></i>
                Clic para expandir/colapsar
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fas fa-hand-pointer text-xs"></i>
                Arrastra para mover
              </span>
            </div>

            {artifact.createdAt && (
              <span className="flex items-center gap-1.5">
                <i className="fas fa-clock text-xs"></i>
                {new Date(artifact.createdAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 w-full h-[calc(100%-120px)]">
          <ReactFlowMindMap data={artifact.data} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MindMapModal;
