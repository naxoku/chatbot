import React from "react";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";

interface ChatInputProps {
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isBotOnline: boolean;
  disabled?: boolean;
  quotedMessage?: {
    id: string;
    content: string;
    sender: "user" | "bot";
  } | null;
  onClearQuotedMessage?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputMessage,
  onInputChange,
  onSendMessage,
  onKeyPress,
  isBotOnline,
  disabled = false,
  quotedMessage,
  onClearQuotedMessage,
}) => {
  return (
    <div className="p-6 border-t border-border bg-card shrink-0">
      <div className="max-w-4xl mx-auto">
        {/* Mensaje citado - estilo WhatsApp */}
        {quotedMessage && (
          <div className="mb-3 p-3 rounded-lg bg-muted/50 border-l-2 border-l-primary">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary">
                    {quotedMessage.sender === "user" ? "Tú" : "Asistente"}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {quotedMessage.content}
                </p>
              </div>
              {onClearQuotedMessage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearQuotedMessage}
                  className="h-6 w-6 p-0 shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyUp={onKeyPress}
              placeholder="Escribe tu mensaje aquí..."
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              disabled={!isBotOnline || disabled}
            />
          </div>
          <Button
            onClick={onSendMessage}
            disabled={!inputMessage.trim() || !isBotOnline || disabled}
            className="px-6 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {!isBotOnline && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            El bot está desconectado. No se pueden enviar mensajes.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
