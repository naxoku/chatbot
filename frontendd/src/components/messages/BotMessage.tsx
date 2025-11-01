import React from "react";
import { Bot } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface BotMessageProps {
  message: Message;
}

export const BotMessage: React.FC<BotMessageProps> = ({ message }) => {
  // Lógica específica del mensaje del bot
  const formatBotMessage = (content: string) => {
    // Aquí se puede agregar lógica para formatear mensajes del bot
    // Por ejemplo, detección de comandos, enlaces, formato markdown, etc.
    return content;
  };

  const isSystemMessage =
    message.content.includes("¡") || message.content.includes("Hola");

  return (
    <div className="flex gap-3 justify-start">
      {/* Avatar del bot */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Bot className="h-4 w-4 text-primary" />
      </div>

      {/* Contenido del mensaje */}
      <div className="max-w-[70%] p-3 rounded-lg bg-muted border border-border/50">
        <p className="text-sm leading-relaxed">
          {formatBotMessage(message.content)}
        </p>

        {/* Timestamp y estado */}
        <div className="flex items-center gap-2 mt-2">
          <p className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString()}
          </p>
          {isSystemMessage && (
            <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full">
              Sistema
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
