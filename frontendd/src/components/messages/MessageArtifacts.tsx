import React from "react";
import { FileText, Brain } from "lucide-react";

/**
 * Componente para mostrar artefactos del mensaje (documentos y mapas mentales)
 * Maneja tanto documentos relacionados como artefactos generados
 */
interface MessageArtifactsProps {
  documentLinks?: Array<{
    url: string;
    title: string;
    description?: string;
    type?: string;
  }>;
  artifact?: any;
  artifactData?: any;
  onViewMindMap?: (artifactData: any) => void;
  isUser: boolean;
  isDarkMode?: boolean;
}

const getDocumentIcon = (url: string): string => {
  const extension = url.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "fas fa-file-pdf";
    case "doc":
    case "docx":
      return "fas fa-file-word";
    case "txt":
      return "fas fa-file-alt";
    default:
      return "fas fa-link";
  }
};

const getDocumentColor = (type?: string): string => {
  switch (type) {
    case "pdf":
      return "text-red-500 bg-red-100";
    case "doc":
    case "docx":
      return "text-blue-500 bg-blue-100";
    case "txt":
      return "text-gray-500 bg-gray-100";
    default:
      return "text-green-500 bg-green-100";
  }
};

export const MessageArtifacts: React.FC<MessageArtifactsProps> = ({
  documentLinks = [],
  artifact,
  artifactData,
  onViewMindMap,
  isUser,
  isDarkMode = false,
}) => {
  return (
    <>
      {/* Documentos relacionados */}
      {documentLinks && documentLinks.length > 0 && (
        <div
          className={`mt-3 pt-3 border-t ${
            isUser
              ? "border-white/10"
              : isDarkMode
              ? "border-gray-700"
              : "border-gray-200"
          }`}
        >
          <p
            className={`text-xs font-medium mb-2.5 flex items-center gap-1.5 ${
              isUser
                ? "text-white/80"
                : isDarkMode
                ? "text-gray-400"
                : "text-gray-600"
            }`}
          >
            <FileText className="w-3 h-3" />
            Documentos relacionados
          </p>
          <div className="space-y-2">
            {documentLinks.map((doc, idx) => (
              <a
                key={idx}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group/doc flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isDarkMode
                    ? "border-gray-700 hover:border-gray-600 bg-gray-900/30 hover:bg-gray-900/50"
                    : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getDocumentColor(
                    doc.type
                  )}`}
                >
                  <i className={`${getDocumentIcon(doc.url)} text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-medium text-sm mb-0.5 line-clamp-1 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p
                      className={`text-xs line-clamp-1 ${
                        isDarkMode ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {doc.description}
                    </p>
                  )}
                </div>
                <i
                  className={`fas fa-arrow-right text-xs transition-transform group-hover/doc:translate-x-0.5 ${
                    isDarkMode ? "text-gray-600" : "text-gray-400"
                  }`}
                ></i>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Artefacto generado (Mapa Mental) */}
      {artifact && artifactData && (
        <div
          className={`mt-3 p-3 rounded-lg border transition-all ${
            isDarkMode
              ? "border-purple-800/30 bg-purple-900/10 hover:bg-purple-900/20"
              : "border-purple-200 bg-purple-50 hover:bg-purple-100"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
                }`}
              >
                <Brain
                  className={`w-4 h-4 ${
                    isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-purple-300" : "text-purple-700"
                  }`}
                >
                  Mapa Mental
                </p>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-purple-400/60" : "text-purple-600/60"
                  }`}
                >
                  Visualización generada
                </p>
              </div>
            </div>
            <button
              onClick={() => onViewMindMap?.(artifactData)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isDarkMode
                  ? "bg-purple-900/30 text-purple-300 hover:bg-purple-900/50"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              <span>Ver Mapa</span>
              <i className="fas fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageArtifacts;
