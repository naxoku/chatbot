import React from "react";

interface ChatHeaderProps {
  conversationTitle: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversationTitle,
}) => {
  return (
    <div className="p-3 bg-card shrink-0 h-14">
      <div className="flex items-center h-full justify-center">
        <h2 className="text-lg font-medium text-center truncate max-w-55 md:max-w-md">
          {conversationTitle || "Chat Asistente"}
        </h2>
      </div>
    </div>
  );
};

export default ChatHeader;
