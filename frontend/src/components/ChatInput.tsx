// frontendd/src/components/ChatInput.tsx
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, X, FileText, Plus } from "lucide-react";

interface QuotedMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
}

interface DocumentData {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  url: string;
  keywords?: string[];
}

interface ChatInputProps {
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  quotedMessage?: QuotedMessage | null;
  onClearQuotedMessage?: () => void;
  isTyping?: boolean;
  selectedDocuments?: DocumentData[];
  onRemoveDocument?: (documentId: string) => void;
  onAddDocuments?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputMessage,
  onInputChange,
  onSendMessage,
  onKeyPress,
  disabled = false,
  quotedMessage,
  onClearQuotedMessage,
  isTyping = false,
  selectedDocuments = [],
  onRemoveDocument,
  onAddDocuments,
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

    onKeyPress(e);
  };

  return (
    <div className="flex justify-center px-4 py-4 shrink-0 bg-background">
      <div className="w-full max-w-4xl">
        {/* Mensaje citado */}
        {quotedMessage && (
          <div className="mb-3 p-3 rounded-lg bg-muted/50 border-l-4 border-l-primary shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    {quotedMessage.sender === "user" ? "Tú" : "Asistente"}
                  </span>
                  <div className="h-1 w-1 rounded-full bg-primary/60" />
                </div>
                <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                  {quotedMessage.content}
                </p>
              </div>
              {onClearQuotedMessage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearQuotedMessage}
                  className="h-6 w-6 p-0 shrink-0 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                  type="button"
                  aria-label="Eliminar mensaje citado"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Contenedor del input con sombra y borde */}
        <div className="rounded-xl bg-card border border-border">
          {/* Tags de documentos */}
          {(selectedDocuments.length > 0 || onAddDocuments) && (
            <div className="px-4 pt-4">
              {selectedDocuments.length === 0 ? (
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-accent hover:border-primary/50 transition-all duration-200 px-3 py-1.5"
                  onClick={onAddDocuments}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs font-medium">Añadir documentos</span>
                </Badge>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedDocuments.map((document) => (
                    <Badge
                      key={document.id}
                      variant="secondary"
                      className="group cursor-default text-xs px-3 py-1.5 hover:bg-secondary/80 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 mr-1.5 text-secondary-foreground/70" />
                      <span className="font-medium">{document.title}</span>
                      {onRemoveDocument && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveDocument(document.id);
                          }}
                          className="h-4 w-4 p-0 ml-2 rounded-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          aria-label={`Eliminar ${document.title}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  ))}
                  {onAddDocuments && (
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-accent hover:border-primary/50 transition-all duration-200 px-3 py-1.5"
                      onClick={onAddDocuments}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      <span className="text-xs font-medium">Añadir más</span>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Área de input */}
          <div className="flex gap-3 p-4">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje aquí..."
                className="flex min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
                disabled={disabled || isTyping}
                style={{
                  maxHeight: "120px",
                  minHeight: "44px",
                }}
                aria-label="Campo de mensaje"
              />
            </div>
            <Button
              onClick={handleSendClick}
              disabled={
                !inputMessage.trim() || disabled || isTyping
              }
              className="h-[44px] w-[44px] shrink-0 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              type="button"
              aria-label="Enviar mensaje"
            >
              {isTyping ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                </div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;