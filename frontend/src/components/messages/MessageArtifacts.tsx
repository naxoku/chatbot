import React from "react";
import { FileText, Brain } from "lucide-react";
import type { Message } from "../../services/backendService";
import { getDocumentIcon, getDocumentColor } from "./utils/artifactUtils";

/**
 * Componente para mostrar artefactos del mensaje (documentos y mapas mentales)
 * Maneja tanto documentos relacionados como artefactos generados
 */

interface Artifact {
  id: string;
  type: "mind-map" | "document" | "chart" | "other";
  title: string;
  content: unknown;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

interface MessageArtifactsProps {
  documentLinks?: Message["documentLinks"];
  artifact?: boolean | Artifact;
  artifactData?: Message["artifactData"];
  onViewMindMap?: (artifactData: unknown) => void;
}

/**
 * Componente para mostrar un documento individual
 */
interface DocumentItemProps {
  document: NonNullable<Message["documentLinks"]>[0];
}

const DocumentItem: React.FC<DocumentItemProps> = ({ document }) => (
   <a
     href={document.url}
     target="_blank"
     rel="noopener noreferrer"
     className="group/doc flex items-center gap-3 p-3 rounded-lg border transition-all border-muted hover:border-muted/80 bg-card hover:bg-muted/10 dark:border-muted dark:hover:border-muted/80"
   >
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getDocumentColor(
        document.type,
      )}`}
    >
      <i className={`${getDocumentIcon(document.url)} text-sm`}></i>
    </div>
     <div className="flex-1 min-w-0">
       <h3 className="font-medium text-sm mb-0.5 line-clamp-1 text-card-foreground dark:text-card-foreground">
         {document.title}
       </h3>
       {document.description && (
         <p className="text-xs line-clamp-1 text-muted-foreground dark:text-muted-foreground">
           {document.description}
         </p>
       )}
     </div>
    <i className="fas fa-arrow-right text-xs transition-transform group-hover/doc:translate-x-0.5 text-gray-400 dark:text-gray-600"></i>
  </a>
);

/**
 * Componente para mostrar el mapa mental generado
 */
interface MindMapArtifactProps {
  artifactData: unknown;
  onViewMindMap?: (artifactData: unknown) => void;
}

const MindMapArtifact: React.FC<MindMapArtifactProps> = ({
  artifactData,
  onViewMindMap,
}) => (
   <div className="mt-3 animate-in fade-in slide-in-from-bottom-1 duration-300 p-3 rounded-lg border transition-all border-accent/30 bg-accent/5 hover:bg-accent/10 dark:border-accent/80 dark:bg-accent/10 dark:hover:bg-accent/20">
    <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
         <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent/10 dark:bg-accent/20">
           <Brain className="w-4 h-4 text-accent-foreground dark:text-accent-foreground/80" />
         </div>
         <div className="flex-1 min-w-0">
           <p className="text-sm font-medium text-accent-foreground dark:text-accent-foreground/80">
             Mapa Mental
           </p>
           <p className="text-xs text-accent-foreground/60 dark:text-accent-foreground/40">
             Visualización generada
           </p>
         </div>
      </div>
       <button
         onClick={() => onViewMindMap?.(artifactData)}
         className="w-full justify-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 bg-accent/10 text-accent-foreground hover:bg-accent/20 dark:bg-accent/10 dark:text-accent-foreground/80 dark:hover:bg-accent/20 sm:w-auto"
       >
         <span>Ver Mapa</span>
         <i className="fas fa-arrow-right text-xs"></i>
       </button>
    </div>
  </div>
);

export const MessageArtifacts: React.FC<MessageArtifactsProps> = ({
  documentLinks = [],
  artifact,
  artifactData,
  onViewMindMap,
}) => {
  const hasDocuments = documentLinks && documentLinks.length > 0;
  const hasMindMap = artifact && artifactData;

  // Si no hay artefactos que mostrar, retornar null
  if (!hasDocuments && !hasMindMap) {
    return null;
  }

  return (
    <>
      {/* Documentos relacionados */}
      {hasDocuments && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium mb-2.5 flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <FileText className="w-3 h-3" />
            Documentos relacionados
          </p>
          <div className="space-y-2">
            {documentLinks.map((document, idx) => (
              <DocumentItem key={idx} document={document} />
            ))}
          </div>
        </div>
      )}

      {/* Artefacto generado (Mapa Mental) */}
      {hasMindMap && (
        <MindMapArtifact
          artifactData={artifactData}
          onViewMindMap={onViewMindMap}
        />
      )}
    </>
  );
};

export default MessageArtifacts;
