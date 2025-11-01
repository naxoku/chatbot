import React from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { ConversationItem } from "./ConversationItem";
import { Bot, Plus, LogOut, ChevronLeft, FileText } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isBotOnline: boolean;
  onToggleBotStatus?: () => void;
  onNewConversation: () => void;
  onOpenDocuments?: () => void;
  onLogout: () => void;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onDeleteConversation?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  isBotOnline,
  onToggleBotStatus,
  onNewConversation,
  onOpenDocuments,
  onLogout,
  conversations,
  activeConversationId,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
}) => {
  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-16"
      } bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out relative h-screen overflow-hidden`}
    >
      {/* Header con Botón de Cerrar Sidebar */}
      <div className="p-3 border-b border-sidebar-border flex items-center justify-between gap-2 shrink-0">
        <div
          className={`flex items-center gap-2 min-w-0 transition-opacity duration-200 ${
            isOpen ? "opacity-100 flex-1" : "opacity-0 w-0"
          }`}
        >
          <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-sm text-sidebar-foreground truncate">
              Asistente UCT
            </h2>
          </div>
        </div>

        {/* 1. Botón Cerrar Sidebar */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          className="shrink-0"
          title={isOpen ? "Cerrar sidebar" : "Abrir sidebar"}
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform duration-300 ${
              !isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>

      <div className="p-2 border-b border-border space-y-1 shrink-0">
        <Button
          variant="default"
          className={`w-full ${
            isOpen ? "justify-start" : "justify-center px-2"
          } bg-primary text-primary-foreground hover:bg-primary/90`}
          onClick={onNewConversation}
          title={!isOpen ? "Nueva conversación" : undefined}
        >
          <Plus className={`h-4 w-4 shrink-0 ${isOpen ? "mr-2" : ""}`} />
          <span
            className={`truncate transition-all duration-200 ${
              isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            Nueva Conversación
          </span>
        </Button>

        <Button
          variant="ghost"
          className={`w-full ${
            isOpen ? "justify-start" : "justify-center px-2"
          } text-foreground hover:bg-muted hover:text-foreground`}
          onClick={onOpenDocuments}
          title={!isOpen ? "Documentos" : undefined}
        >
          <FileText className={`h-4 w-4 shrink-0 ${isOpen ? "mr-2" : ""}`} />
          <span
            className={`truncate transition-all duration-200 ${
              isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            Documentos
          </span>
        </Button>
      </div>

      {/* Lista de Conversaciones (Botones Dinámicos) */}
      <div
        className={`flex-1 overflow-y-auto p-2 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        {isOpen && (
          <div className="space-y-1">
            <div className="px-2 py-1.5">
              <h3 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                Conversaciones
              </h3>
            </div>
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={activeConversationId === conv.id}
                  onSelect={onSelectConversation}
                  onRename={onRenameConversation}
                  onDelete={onDeleteConversation}
                />
              ))
            ) : (
              <div className="px-2 py-4 text-center">
                <p className="text-xs text-muted-foreground/50">
                  No hay conversaciones
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border shrink-0">
        <div className="px-3 py-2 border-b border-border">
          <button
            onClick={onToggleBotStatus}
            disabled={!onToggleBotStatus}
            className={`w-full flex items-center ${
              isOpen ? "gap-2" : "justify-center"
            } px-2 py-1.5 rounded-md transition-colors ${
              onToggleBotStatus
                ? "bg-muted/50 hover:bg-muted cursor-pointer"
                : "bg-muted/50"
            }`}
            title={
              onToggleBotStatus
                ? "Click para cambiar estado del bot"
                : undefined
            }
          >
            <div
              className={`h-2 w-2 rounded-full shrink-0 ${
                isBotOnline ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span
              className={`text-xs font-medium text-foreground truncate transition-all duration-200 ${
                isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              {isBotOnline ? "En línea" : "Desconectado"}
              {onToggleBotStatus && " (click)"}
            </span>
          </button>
        </div>

        <div className="p-2 space-y-1">
          {!isOpen ? (
            <>
              <div className="flex justify-center">
                <ModeToggle />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="w-full text-destructive hover:bg-destructive/10"
                onClick={onLogout}
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-sm text-foreground">Tema</span>
                <ModeToggle />
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:bg-destructive/10"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">Cerrar Sesión</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
