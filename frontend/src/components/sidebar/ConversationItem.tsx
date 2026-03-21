import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
  onSelect?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onRequestRename?: (id: string, currentTitle: string) => void;
  onDelete?: (id: string) => void;
  isHighlighted?: boolean;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive = false,
  onSelect,
  onRequestRename,
  onDelete,
  isHighlighted = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMenuAbove, setShowMenuAbove] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleRequestRename = () => {
    onRequestRename?.(conversation.id, conversation.title);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    onDelete?.(conversation.id);
    setIsMenuOpen(false);
  };

  // Detectar posición y ajustar menú
  useEffect(() => {
    if (isMenuOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;

      // Si hay menos de 120px hacia abajo, mostrar arriba
      setShowMenuAbove(spaceBelow < 120);
    }
  }, [isMenuOpen]);

  return (
    <div
      className={`group relative rounded-md transition-colors duration-200 ${
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "hover:bg-sidebar-accent/50"
      }`}
    >
      {/* Modo normal */}
        <div className={`flex items-center ${isHighlighted ? 'bg-primary/10 transition-colors duration-700' : ''}`}>
        <button
          onClick={() => onSelect?.(conversation.id)}
          className="flex-1 text-left py-2 pl-3 pr-1 min-w-0 flex items-center gap-2.5"
        >
          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium truncate w-full text-foreground">
            {conversation.title}
          </span>
        </button>

        {/* Menú de opciones */}
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              ref={buttonRef}
              variant="ghost"
              size="icon-sm"
              className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48"
            side={showMenuAbove ? "top" : "bottom"}
            sideOffset={8}
          >
            <DropdownMenuItem onClick={handleRequestRename}>
              <Pencil className="mr-2 h-4 w-4" />
              Renombrar
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
