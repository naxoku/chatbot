import React from "react";

interface ChatHeaderProps {
  conversationTitle: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversationTitle,
}) => {
  return (
    <div className="p-6 border-b border-border bg-card shrink-0">
      <div className="flex justify-center">
        <h2 className="text-xl font-semibold text-center">
          {conversationTitle || "Chat Asistente"}
        </h2>
      </div>
    </div>
  );
};

export default ChatHeader;
