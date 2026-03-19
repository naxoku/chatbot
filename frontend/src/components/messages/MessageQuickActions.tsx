import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Reply, Sparkles } from "lucide-react";
import { type QuickAction } from "../config/quickActions";
import type { Message } from "../../services/backendService";

/**
 * Componente para acciones rápidas del mensaje.
 * Renderiza el menú en un portal con posición fija para evitar
 * que sea recortado por contenedores con overflow.
 */
interface MessageQuickActionsProps {
  message: Message;
  onQuickAction?: (action: QuickAction, message: Message) => void;
  onQuoteMessage?: (message: Message) => void;
  quickActions?: QuickAction[];
}

interface MenuCoords {
  top: number;
  left: number;
  direction: "above" | "below";
}

export const MessageQuickActions: React.FC<MessageQuickActionsProps> = ({
  message,
  onQuickAction,
  onQuoteMessage,
  quickActions = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const MENU_WIDTH = 224; // w-56 = 14rem = 224px
  const MENU_GAP = 8;

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;

    // Estimate menu height: ~36px per item + 8px padding
    const itemCount = quickActions.length + 1; // +1 for "Responder"
    const estimatedMenuH = itemCount * 36 + 8;

    const spaceBelow = viewportH - rect.bottom - MENU_GAP;
    const spaceAbove = rect.top - MENU_GAP;

    // Vertical: prefer above if not enough space below
    let top: number;
    let direction: "above" | "below";
    if (spaceBelow >= estimatedMenuH) {
      top = rect.bottom + MENU_GAP;
      direction = "below";
    } else if (spaceAbove >= estimatedMenuH) {
      top = rect.top - MENU_GAP - estimatedMenuH;
      direction = "above";
    } else {
      // Neither side has full space — pick the side with more room
      if (spaceAbove > spaceBelow) {
        top = Math.max(MENU_GAP, rect.top - MENU_GAP - estimatedMenuH);
        direction = "above";
      } else {
        top = rect.bottom + MENU_GAP;
        direction = "below";
      }
    }

    // Horizontal: center on button, clamp to viewport
    let left = rect.left + rect.width / 2 - MENU_WIDTH / 2;
    left = Math.max(MENU_GAP, Math.min(left, viewportW - MENU_WIDTH - MENU_GAP));

    setCoords({ top, left, direction });
  }, [quickActions.length]);

  // Recalculate on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;

    calculatePosition();

    const handleScrollOrResize = () => {
      calculatePosition();
    };

    // Listen on capture phase to catch scroll events from any ancestor
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, calculatePosition]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const menu = isOpen && coords
    ? createPortal(
        <>
          {/* Backdrop invisible para cerrar */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu flotante */}
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: MENU_WIDTH,
              zIndex: 9999,
            }}
            className={`rounded-lg shadow-lg border border-border bg-popover text-popover-foreground animate-in fade-in ${
              coords.direction === "above"
                ? "slide-in-from-bottom-2"
                : "slide-in-from-top-2"
            } zoom-in-95 duration-150`}
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
                className="w-full text-left px-3 py-2 text-sm font-normal transition-colors flex items-center gap-2 text-popover-foreground hover:bg-accent hover:text-accent-foreground min-h-[2.25rem]"
              >
                <Reply className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="flex-1">Responder</span>
              </button>

              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className="w-full text-left px-3 py-2 text-sm font-normal transition-colors flex items-center gap-2 text-popover-foreground hover:bg-accent hover:text-accent-foreground min-h-[2.25rem]"
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
        </>,
        document.body
      )
    : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
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

      {menu}
    </div>
  );
};

export default MessageQuickActions;
