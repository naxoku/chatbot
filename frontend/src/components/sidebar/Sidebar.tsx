import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { ConversationItem } from "./ConversationItem";
import { Bot, Plus, LogOut, ChevronLeft, FileText, Menu } from "lucide-react";

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

// Componente interno que contiene el contenido completo del sidebar
const SidebarContent: React.FC<Omit<SidebarProps, "isOpen" | "onToggle">> = ({
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-sidebar-border flex items-center gap-2 shrink-0">
        <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <h2 className="font-semibold text-sm text-sidebar-foreground truncate">
          Asistente UCT
        </h2>
      </div>

      {/* Botones de Navegación */}
      <div className="p-2 border-b border-border space-y-1 shrink-0">
        <Button
          variant="default"
          className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onNewConversation}
        >
          <Plus className="h-4 w-4 shrink-0 mr-2" />
          <span className="truncate">Nueva Conversación</span>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-foreground hover:bg-muted hover:text-foreground"
          onClick={onOpenDocuments}
        >
          <FileText className="h-4 w-4 shrink-0 mr-2" />
          <span className="truncate">Documentos</span>
        </Button>
      </div>

      {/* Lista de Conversaciones */}
      <div className="flex-1 overflow-y-auto p-2">
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
      </div>

      {/* Footer */}
      <div className="border-t border-border shrink-0">
        <div className="px-3 py-2 border-b border-border">
          <button
            onClick={onToggleBotStatus}
            disabled={!onToggleBotStatus}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
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
            <span className="text-xs font-medium text-foreground truncate">
              {isBotOnline ? "En línea" : "Desconectado"}
              {onToggleBotStatus && " (click)"}
            </span>
          </button>
        </div>

        <div className="p-2 space-y-1">
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
        </div>
      </div>
    </div>
  );
};

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const contentProps = {
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
  };

  return (
    <>
      {/* Botón de menú móvil - Solo visible en móvil */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 bg-background shadow-md"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <SheetDescription className="sr-only">
              Panel lateral con opciones de navegación y conversaciones
            </SheetDescription>
            <SidebarContent {...contentProps} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Sidebar de escritorio - Solo visible en desktop */}
      <nav
        aria-label="Menú de navegación"
        className={`hidden md:flex ${
          isOpen ? "w-64" : "w-16"
        } bg-sidebar border-r border-sidebar-border flex-col transition-all duration-300 ease-in-out relative h-screen overflow-hidden`}
      >
        {/* Header con Texto y Botón de Colapsar */}
        <div className="border-b border-sidebar-border shrink-0">
          {isOpen ? (
            // Header cuando está abierto
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-semibold text-sm text-sidebar-foreground truncate">
                  Asistente UCT
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8 shrink-0"
                title="Cerrar sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            // Header cuando está cerrado - solo ícono centrado
            <div className="p-3 flex flex-col items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8"
                title="Abrir sidebar"
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          )}
        </div>

        {/* Botones de Navegación */}
        <div className="p-2 border-b border-border space-y-1 shrink-0">
          {isOpen ? (
            <>
              <Button
                variant="default"
                className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onNewConversation}
              >
                <Plus className="h-4 w-4 shrink-0 mr-2" />
                <span className="truncate">Nueva Conversación</span>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-foreground hover:bg-muted hover:text-foreground"
                onClick={onOpenDocuments}
              >
                <FileText className="h-4 w-4 shrink-0 mr-2" />
                <span className="truncate">Documentos</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                size="icon"
                className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onNewConversation}
                title="Nueva conversación"
              >
                <Plus className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="w-full h-10 text-foreground hover:bg-muted hover:text-foreground"
                onClick={onOpenDocuments}
                title="Documentos"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Lista de Conversaciones */}
        <div
          className={`flex-1 overflow-y-auto p-2 transition-opacity duration-200 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {isOpen && (
            <div className="space-y-1">
              <div className="px-2 py-1.5">
                <h3 className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
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

        {/* Footer (Bot Status, Tema, Logout) */}
        <div className="border-t border-border shrink-0">
          {isOpen ? (
            // Footer cuando está abierto
            <>
              <div className="px-3 py-2 border-b border-border">
                <button
                  onClick={onToggleBotStatus}
                  disabled={!onToggleBotStatus}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
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
                    aria-label={isBotOnline ? "Bot en línea" : "Bot desconectado"}
                  />
                  <span className="text-xs font-medium text-foreground truncate">
                    {isBotOnline ? "En línea" : "Desconectado"}
                    {onToggleBotStatus && " (click)"}
                  </span>
                </button>
              </div>

              <div className="p-2 space-y-1">
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
              </div>
            </>
          ) : (
            // Footer cuando está cerrado - botones centrados
            <>
              <div className="px-2 py-2 border-b border-border flex justify-center">
                <button
                  onClick={onToggleBotStatus}
                  disabled={!onToggleBotStatus}
                  className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
                    onToggleBotStatus
                      ? "bg-muted/50 hover:bg-muted cursor-pointer"
                      : "bg-muted/50"
                  }`}
                  title={isBotOnline ? "En línea" : "Desconectado"}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isBotOnline ? "bg-green-500" : "bg-red-500"
                    }`}
                    aria-label={isBotOnline ? "Bot en línea" : "Bot desconectado"}
                  />
                </button>
              </div>

              <div className="p-2 space-y-1 flex flex-col items-center">
                <ModeToggle />

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-destructive hover:bg-destructive/10"
                  onClick={onLogout}
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  );
};
