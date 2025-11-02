// frontendd/src/components/ChatInput.tsx
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";

interface QuotedMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
}

interface ChatInputProps {
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isBotOnline: boolean;
  disabled?: boolean;
  quotedMessage?: QuotedMessage | null;
  onClearQuotedMessage?: () => void;
  isTyping?: boolean;
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
  isTyping = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize del textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [inputMessage]);

  const handleSendClick = () => {
    if (!disabled && !isTyping && inputMessage.trim()) {
      console.log("🖱️ Botón de envío clickeado");
      onSendMessage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter para nueva línea
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const cursorPos = textareaRef.current?.selectionStart || 0;
      const newValue =
        inputMessage.substring(0, cursorPos) +
        "\n" +
        inputMessage.substring(cursorPos);
      onInputChange(newValue);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = cursorPos + 1;
          textareaRef.current.selectionEnd = cursorPos + 1;
        }
      }, 0);
    }
    // Enter solo para enviar
    else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !isTyping && inputMessage.trim()) {
        console.log("⌨️ Enter presionado para enviar");
        onSendMessage();
      }
    }

    // Llamar al handler adicional si existe
    onKeyPress(e);
  };

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
                  type="button"
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
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje aquí..."
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              disabled={!isBotOnline || disabled || isTyping}
              style={{
                maxHeight: "120px",
                minHeight: "60px",
              }}
            />
          </div>
          <Button
            onClick={handleSendClick}
            disabled={
              !inputMessage.trim() || !isBotOnline || disabled || isTyping
            }
            className="px-6 shrink-0"
            type="button"
          >
            {isTyping ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              </div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Estados del bot */}
        {!isBotOnline && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            El bot está desconectado. No se pueden enviar mensajes.
          </p>
        )}

        {isTyping && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            El asistente está escribiendo...
          </p>
        )}

        {/* Ayuda de atajos */}
        <div className="text-xs text-muted-foreground mt-2 text-center">
          <span className="opacity-70">
            Presiona{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
              Enter
            </kbd>{" "}
            para enviar
            {" • "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
              Ctrl+Enter
            </kbd>{" "}
            para nueva línea
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
