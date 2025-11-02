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
  isUser: boolean;
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
    className="group/doc flex items-center gap-3 p-3 rounded-lg border transition-all border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:bg-gray-900/30 dark:hover:bg-gray-900/50"
  >
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getDocumentColor(
        document.type
      )}`}
    >
      <i className={`${getDocumentIcon(document.url)} text-sm`}></i>
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-medium text-sm mb-0.5 line-clamp-1 text-gray-900 dark:text-white">
        {document.title}
      </h3>
      {document.description && (
        <p className="text-xs line-clamp-1 text-gray-500 dark:text-gray-500">
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
  <div className="mt-3 p-3 rounded-lg border transition-all border-purple-200 bg-purple-50 hover:bg-purple-100 dark:border-purple-800/30 dark:bg-purple-900/10 dark:hover:bg-purple-900/20">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
          <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Mapa Mental
          </p>
          <p className="text-xs text-purple-600/60 dark:text-purple-400/60">
            Visualización generada
          </p>
        </div>
      </div>
      <button
        onClick={() => onViewMindMap?.(artifactData)}
        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
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
  isUser,
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
