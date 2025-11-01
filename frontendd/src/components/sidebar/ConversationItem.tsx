import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { MoreVertical, Pencil, Trash2, Check, X } from "lucide-react";

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
  onDelete?: (id: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive = false,
  onSelect,
  onRename,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleStartEdit = () => {
    setEditTitle(conversation.title);
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onRename?.(conversation.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete?.(conversation.id);
    setIsMenuOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div
      className={`group relative rounded-md transition-colors ${
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "hover:bg-sidebar-accent/50"
      }`}
    >
      {isEditing ? (
        // Modo edición
        <div className="flex items-center gap-1 p-2">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            className="h-7 text-sm"
            autoFocus
            onBlur={handleSaveEdit}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSaveEdit}
            className="shrink-0"
          >
            <Check className="h-3.5 w-3.5 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCancelEdit}
            className="shrink-0"
          >
            <X className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ) : (
        // Modo normal
        <div className="flex items-center">
          <button
            onClick={() => onSelect?.(conversation.id)}
            className="flex-1 text-left py-2 pl-3 pr-1 min-w-0"
          >
            <div className="flex flex-col items-start gap-1 min-w-0">
              <span className="text-sm font-medium truncate w-full text-foreground">
                {conversation.title}
              </span>
              <span className="text-xs text-foreground/60 truncate w-full">
                {conversation.lastMessage}
              </span>
            </div>
          </button>

          {/* Menú de opciones */}
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleStartEdit}>
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
      )}
    </div>
  );
};
