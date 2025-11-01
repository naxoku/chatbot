import React from "react";
import { User } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface UserMessageProps {
  message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  // Lógica específica del mensaje del usuario
  const getMessageType = (content: string): "text" | "command" | "question" => {
    if (content.startsWith("/")) return "command";
    if (content.includes("?")) return "question";
    return "text";
  };

  const messageType = getMessageType(message.content);

  return (
    <div className="flex gap-3 justify-end">
      {/* Contenido del mensaje */}
      <div className="max-w-[70%] p-3 rounded-lg bg-primary text-primary-foreground">
        <p className="text-sm leading-relaxed">{message.content}</p>

        {/* Metadata del mensaje */}
        <div className="flex items-center justify-between gap-2 mt-2">
          <p className="text-xs text-primary-foreground/70">
            {message.timestamp.toLocaleTimeString()}
          </p>
          {messageType !== "text" && (
            <span className="text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full">
              {messageType === "command" ? "Comando" : "Pregunta"}
            </span>
          )}
        </div>
      </div>

      {/* Avatar del usuario */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
        <User className="h-4 w-4 text-secondary-foreground" />
      </div>
    </div>
  );
};
