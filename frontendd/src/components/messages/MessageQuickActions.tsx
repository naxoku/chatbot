import React, { useState, useRef, useEffect } from "react";
import { Reply, Sparkles } from "lucide-react";
import { type QuickAction } from "../config/quickActions";

/**
 * Componente para acciones rápidas del mensaje
 * Usa colores neutros de shadcn/ui
 */
interface MessageQuickActionsProps {
  message: any;
  onQuickAction?: (action: QuickAction, message: any) => void;
  onQuoteMessage?: (message: any) => void;
  quickActions?: QuickAction[];
}

export const MessageQuickActions: React.FC<MessageQuickActionsProps> = ({
  message,
  onQuickAction,
  onQuoteMessage,
  quickActions = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (action: QuickAction) => {
    if (action.id === "responder") {
      onQuoteMessage?.(message);
    } else if (action.id === "mapa-mental") {
      onQuickAction?.(action, message);
    } else {
      onQuoteMessage?.(message);
      setTimeout(() => {
        onQuickAction?.(action, message);
      }, 0);
    }
    setIsOpen(false);
  };

  if (quickActions.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-md transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:bg-accent/50"
        title="Acciones rápidas"
        aria-label="Menú de acciones rápidas"
        aria-expanded={isOpen}
      >
        <Sparkles className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-9998"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            className="absolute left-0 top-full mt-2 z-9999 w-48 rounded-lg shadow-lg border border-border bg-popover text-popover-foreground animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              {/* Acción de responder */}
              <button
                onClick={() =>
                  handleActionClick({
                    id: "responder",
                    text: "Responder",
                    icon: "fas fa-reply",
                  })
                }
                className="w-full text-left px-3 py-2 text-sm font-normal transition-colors flex items-center gap-2 text-popover-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Reply className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="flex-1">Responder</span>
              </button>

              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className="w-full text-left px-3 py-2 text-sm font-normal transition-colors flex items-center gap-2 text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <i
                    className={`${action.icon} text-sm text-muted-foreground`}
                  ></i>
                  <span className="flex-1">{action.text}</span>
                  {action.generatesArtifact && (
                    <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MessageQuickActions;
