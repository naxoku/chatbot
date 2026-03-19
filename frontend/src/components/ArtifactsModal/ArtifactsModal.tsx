import React from "react";
import { X, FileText, Brain } from "lucide-react";
import type { Message } from "@/services/backendService";

interface Artifact {
  id: string;
  type: "mind-map" | "document" | "chart" | "other";
  title: string;
  content: unknown;
  createdAt: Date;
  messageId: string;
  metadata?: Record<string, unknown>;
}

interface ArtifactItemProps {
  artifact: Artifact;
  onViewMindMap?: (artifactData: unknown, title?: string) => void;
}

const ArtifactItem: React.FC<ArtifactItemProps> = ({
  artifact,
  onViewMindMap,
}) => {
  const handleView = () => {
    if (artifact.type === "mind-map") {
      onViewMindMap?.(artifact.content);
    }
  };

  const getIcon = () => {
    switch (artifact.type) {
      case "mind-map":
        return <Brain className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getColor = () => {
    switch (artifact.type) {
      case "mind-map":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "document":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <div
      className="group flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-all border-border hover:border-primary/50 hover:bg-accent/50 dark:border-gray-700 dark:hover:border-gray-600 dark:bg-gray-900/30 dark:hover:bg-gray-900/50 cursor-pointer bg-card"
      onClick={handleView}
    >
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${getColor()}`}
      >
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm mb-0.5 line-clamp-1 text-card-foreground">
          {artifact.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {artifact.type === "mind-map" ? "Mapa Mental" : "Documento"} •{" "}
          {artifact.createdAt.toLocaleDateString()}
        </p>
      </div>
      {artifact.type === "mind-map" && (
        <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors shrink-0">
          Ver
        </span>
      )}
    </div>
  );
};

interface ArtifactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onViewMindMap?: (artifactData: unknown, title?: string) => void;
}

export const ArtifactsModal: React.FC<ArtifactsModalProps> = ({
  isOpen,
  onClose,
  messages,
  onViewMindMap,
}) => {
  if (!isOpen) return null;

  // Extraer artefactos de los mensajes
  const artifacts: Artifact[] = [];

  messages.forEach((message) => {
    // Documentos relacionados
    if (message.documentLinks && message.documentLinks.length > 0) {
      message.documentLinks.forEach((doc, idx) => {
        artifacts.push({
          id: `doc-${message.id}-${idx}`,
          type: "document",
          title: doc.title,
          content: doc,
          createdAt: message.timestamp,
          messageId: message.id,
          metadata: { url: doc.url, type: doc.type },
        });
      });
    }

    // Mapas mentales
    if (message.artifact && message.artifactData) {
      artifacts.push({
        id: `mindmap-${message.id}`,
        type: "mind-map",
        title: "Mapa Mental",
        content: message.artifactData,
        createdAt: message.timestamp,
        messageId: message.id,
        metadata: message.artifactData as Record<string, unknown>,
      });
    }
  });

  // Ordenar por fecha de creación (más recientes primero)
  artifacts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[80vh] bg-background rounded-xl shadow-2xl border border-border animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <h2 className="text-lg sm:text-xl font-semibold text-card-foreground truncate">
            Artefactos de la Conversación
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh] sm:max-h-[60vh]">
          {artifacts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No hay artefactos en esta conversación
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {artifacts.map((artifact) => (
                <ArtifactItem
                  key={artifact.id}
                  artifact={artifact}
                  onViewMindMap={onViewMindMap}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtifactsModal;
