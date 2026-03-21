// frontendd/src/components/ChatInput.tsx
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, X, FileText, Paperclip } from "lucide-react";

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
    <div className="sticky bottom-0 z-10 w-full shrink-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-6 pt-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-white/80 dark:bg-zinc-900/80 shadow-sm backdrop-blur-md transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-md dark:focus-within:shadow-primary/20">
          {/* Mensaje citado */}
          {quotedMessage && (
            <div className="mx-4 mt-4 rounded-2xl border border-border/50 bg-muted/60 p-3 animate-in slide-in-from-bottom-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-primary">
                      {quotedMessage.sender === "user" ? "Tú" : "Asistente"}
                    </span>
                    <div className="h-1 w-1 rounded-full bg-primary/60" />
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-foreground/80">
                    {quotedMessage.content}
                  </p>
                </div>
                {onClearQuotedMessage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearQuotedMessage}
                    className="h-6 w-6 shrink-0 rounded-md p-0 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    type="button"
                    aria-label="Eliminar mensaje citado"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Tags de documentos */}
          {selectedDocuments.length > 0 && (
            <div className="border-b border-border/50 px-4 pb-2 pt-3">
              <div className="flex flex-wrap gap-2">
                {selectedDocuments.map((document) => (
                  <Badge
                    key={document.id}
                    variant="secondary"
                    className="group cursor-default px-3 py-1.5 text-xs transition-colors hover:bg-secondary/80"
                  >
                    <FileText className="mr-1.5 h-3.5 w-3.5 text-secondary-foreground/70" />
                    <span className="max-w-[150px] truncate font-medium">
                      {document.title}
                    </span>
                    {onRemoveDocument && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveDocument(document.id);
                        }}
                        className="ml-2 h-4 w-4 rounded-sm p-0 transition-colors hover:bg-destructive hover:text-destructive-foreground"
                        aria-label={`Eliminar ${document.title}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Área de input */}
          <div className="flex items-end gap-2.5 p-3">
            {onAddDocuments && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onAddDocuments}
                className="mb-1 h-10 w-10 shrink-0 rounded-2xl text-muted-foreground transition-all hover:text-foreground hover:bg-accent"
                type="button"
                aria-label="Adjuntar documentos"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            )}

            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje aquí..."
                className="flex min-h-[44px] w-full resize-none bg-transparent px-3 py-3 text-[15px] placeholder:text-muted-foreground transition-all focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disabled || isTyping}
                style={{
                  maxHeight: "150px",
                  minHeight: "44px",
                }}
                aria-label="Campo de mensaje"
              />
            </div>

            <Button
              onClick={handleSendClick}
              disabled={!inputMessage.trim() || disabled || isTyping}
              className="mb-1 h-12 w-12 shrink-0 rounded-2xl transition-all duration-200"
              type="button"
              aria-label="Enviar mensaje"
            >
              {isTyping ? (
                <div className="flex items-center justify-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
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
