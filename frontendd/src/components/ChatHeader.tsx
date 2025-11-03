import React from "react";
import { FileText } from "lucide-react";

interface ChatHeaderProps {
  conversationTitle: string;
  onOpenArtifacts?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversationTitle,
  onOpenArtifacts,
}) => {
  return (
    <div className="p-3 bg-card shrink-0 h-14">
      <div className="flex items-center h-full relative">
        {/* Botón de artefactos - posicionado absoluta a la derecha */}
        {onOpenArtifacts && (
          <button
            onClick={onOpenArtifacts}
            className="absolute right-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
            title="Ver artefactos"
          >
            <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}

        {/* Título centrado */}
        <div className="flex-1 flex justify-center items-center">
          <h2 className="text-lg font-medium text-center truncate max-w-md">
            {conversationTitle || "Chat Asistente"}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
