import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Reply, Sparkles } from "lucide-react";
import { createPortal } from "react-dom";
import { type QuickAction } from "../config/quickActions";
import type { Message } from "../../services/backendService";

/**
 * Componente para acciones rápidas del mensaje
 * Posiciona el menú dinámicamente arriba o abajo según el espacio disponible
 */
interface MessageQuickActionsProps {
  message: Message;
  onQuickAction?: (action: QuickAction, message: Message) => void;
  onQuoteMessage?: (message: Message) => void;
  quickActions?: QuickAction[];
}

export const MessageQuickActions: React.FC<MessageQuickActionsProps> = ({
  message,
  onQuickAction,
  onQuoteMessage,
  quickActions = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenuAbove, setShowMenuAbove] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideMenu = menuRef.current?.contains(target);
      const clickedInsideContainer = containerRef.current?.contains(target);
      if (!clickedInsideMenu && !clickedInsideContainer) {
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

  // Recalculate position and placement when the menu opens and on resize/scroll
  useLayoutEffect(() => {
    let rafId: number | null = null;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    const calculatePosition = () => {
      if (!isOpen || !buttonRef.current || !menuRef.current) return;
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const margin = 8; // gap between button and menu

      const spaceAbove = buttonRect.top;
      const spaceBelow = viewportHeight - buttonRect.bottom;

      // Prefer below, if there's enough space; otherwise show above
      let shouldShowAbove = spaceBelow < menuRect.height + margin && spaceAbove >= menuRect.height + margin;

      // Additional UX rule: avoid overlapping the chat input area when opening downwards
      // and avoid overlaying the header when opening upwards. If the menu placed below
      // would intersect the chat input, prefer opening above. Conversely, if opening
      // above would intersect the top header, prefer opening below.
      try {
        const chatInput = document.querySelector('textarea[aria-label="Campo de mensaje"]');
        const chatHeader = document.querySelector('#main-content .h-14');
        if (chatInput) {
          const chatInputRect = chatInput.getBoundingClientRect();
          const belowTop = buttonRect.bottom + margin;
          const belowBottom = belowTop + menuRect.height;
          // If opening below would overlap chatInput, prefer above if possible
          if (belowBottom > chatInputRect.top - margin && spaceAbove >= menuRect.height + margin) {
            shouldShowAbove = true;
          }
        }

        if (chatHeader && shouldShowAbove) {
          const headerRect = chatHeader.getBoundingClientRect();
          const aboveBottom = buttonRect.top - margin;
          const aboveTop = aboveBottom - menuRect.height;
          // If opening above would cover header, then fallback to below
          if (aboveTop < headerRect.bottom + margin && spaceBelow >= menuRect.height + margin) {
            shouldShowAbove = false;
          }
        }
      } catch (err) {
        // On some browsers or environments, querySelector or getBoundingClientRect may fail — ignore and use default behavior
      }

      setShowMenuAbove(shouldShowAbove);

      // Calculate left to center the menu relative to button, but clamp to viewport
      const desiredLeft = buttonRect.left + buttonRect.width / 2 - menuRect.width / 2;
      const minLeft = margin;
      const maxLeft = viewportWidth - menuRect.width - margin;
      const left = Math.max(minLeft, Math.min(desiredLeft, maxLeft));

      // Calculate top based on above/below
      const top = shouldShowAbove
        ? buttonRect.top - menuRect.height - margin
        : buttonRect.bottom + margin;

      setMenuStyle({ position: "fixed", top: `${Math.max(margin, top)}px`, left: `${left}px`, zIndex: 9999 });

      // Focus the first interactive element for accessibility
      const firstBtn = menuRef.current?.querySelector<HTMLButtonElement>("button");
      firstBtn?.focus();
    };

    if (isOpen) {
      // Wait next frame so menuRef has actual size
      rafId = requestAnimationFrame(calculatePosition);
      window.addEventListener("resize", calculatePosition);
      window.addEventListener("scroll", calculatePosition, true);
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("keydown", handleKeyDown);
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
    <div className="relative" ref={containerRef}>
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

          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />

              {/* Menu rendered into body to avoid clipping in scrollable containers */}
              {createPortal(
                <div
                  ref={menuRef}
                  role="menu"
                  aria-hidden={!isOpen}
                  style={menuStyle ?? { visibility: "hidden" }}
                  className={`rounded-lg shadow-lg border border-border bg-popover text-popover-foreground animate-in fade-in zoom-in-95 duration-200 w-48 sm:w-56 md:w-64`}
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
                className="w-full text-left px-3 py-2 text-xs sm:text-sm font-normal transition-colors flex items-center gap-2 text-popover-foreground hover:bg-accent hover:text-accent-foreground min-h-[2.25rem]"
              >
                <Reply className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="flex-1">Responder</span>
              </button>

              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className="w-full text-left px-3 py-2 text-xs sm:text-sm font-normal transition-colors flex items-center gap-2 text-popover-foreground hover:bg-accent hover:text-accent-foreground min-h-[2.25rem]"
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
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
};

export default MessageQuickActions;
