import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Sparkles } from "lucide-react";
import { type QuickAction } from "../config/quickActions";
import type { Message } from "../../services/backendService";
import { useIsMobile } from "../../hooks/use-mobile";

/**
 * Componente para acciones rápidas del mensaje.
 * Despliega acciones inline en la misma fila con transición suave.
 */
interface MessageQuickActionsProps {
  message: Message;
  onQuickAction?: (action: QuickAction, message: Message) => void;
  quickActions?: QuickAction[];
}

const quickActionLabels: Record<string, string> = {
  resumen: "Resumir",
  explicar: "Explicar",
  ejemplo: "Ejemplo",
  "mapa-mental": "Mapa mental",
};

export const MessageQuickActions: React.FC<MessageQuickActionsProps> = ({
  message,
  onQuickAction,
  quickActions = [],
}) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleActionClick = (action: QuickAction) => {
    onQuickAction?.(action, message);
    setIsOpen(false);
  };

  if (quickActions.length === 0) {
    return null;
  }

  if (!isMobile) {
    return (
      <div
        ref={containerRef}
        className="relative flex items-center gap-2 min-w-0"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="rounded-lg border border-border/50 bg-background/60 p-1.5 text-muted-foreground transition-all duration-200 hover:bg-accent/60 hover:text-foreground"
          title="Acciones rápidas"
          aria-label="Mostrar acciones rápidas"
          aria-expanded={isOpen}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>

        <div
          className={`flex items-center gap-1 overflow-hidden transition-all duration-300 ease-out min-w-0 ${
            isOpen
              ? "max-w-[40rem] opacity-100 translate-x-0"
              : "max-w-0 opacity-0 -translate-x-1 pointer-events-none"
          }`}
          aria-hidden={!isOpen}
        >
          {quickActions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border/60 bg-background/70 px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-all duration-200 hover:bg-accent hover:text-foreground ${
                isOpen ? "translate-y-0 opacity-100" : "translate-y-0 opacity-0"
              }`}
              style={{ transitionDelay: isOpen ? `${index * 30}ms` : "0ms" }}
              title={action.text}
              aria-label={action.text}
            >
              <i
                className={`${action.icon} text-[10px] text-muted-foreground`}
              ></i>
              <span>{quickActionLabels[action.id] ?? action.text}</span>
              {action.generatesArtifact && (
                <Sparkles className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-2 min-w-0"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="rounded-lg border border-border/50 bg-background/60 p-1.5 text-muted-foreground transition-all duration-200 hover:bg-accent/60 hover:text-foreground"
        title="Acciones rápidas"
        aria-label="Mostrar acciones rápidas"
        aria-expanded={isOpen}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      <div
        className={`absolute left-0 top-full z-20 mt-2 flex w-52 flex-col rounded-xl border border-border/70 bg-popover p-1 shadow-lg transition-all duration-200 ease-out ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 -translate-y-1"
        }`}
        aria-hidden={!isOpen}
      >
        {quickActions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-foreground/85 transition-all duration-200 hover:bg-accent hover:text-foreground ${
              isOpen ? "translate-y-0 opacity-100" : "translate-y-0 opacity-0"
            }`}
            style={{ transitionDelay: isOpen ? `${index * 25}ms` : "0ms" }}
            title={action.text}
            aria-label={action.text}
          >
            <i
              className={`${action.icon} text-[11px] text-muted-foreground`}
            ></i>
            <span>{quickActionLabels[action.id] ?? action.text}</span>
            {action.generatesArtifact && (
              <Sparkles className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessageQuickActions;
