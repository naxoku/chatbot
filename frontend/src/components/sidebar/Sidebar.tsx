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
import {
  Bot,
  Plus,
  LogOut,
  ChevronLeft,
  FileText,
  Menu,
  PanelLeftClose,
} from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewConversation: () => void;
  onOpenDocuments?: () => void;
  onLogout: () => void;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onRequestRename?: (id: string, currentTitle: string) => void;
  recentlyUpdatedId?: string | null;
  onDeleteConversation?: (id: string) => void;
  onClose?: () => void;
}

const SidebarContent: React.FC<Omit<SidebarProps, "isOpen" | "onToggle">> = ({
  onNewConversation,
  onOpenDocuments,
  onLogout,
  conversations,
  activeConversationId,
  onSelectConversation,
  onRenameConversation,
  onRequestRename,
  recentlyUpdatedId,
  onDeleteConversation,
  onClose,
}) => {
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="shrink-0 border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-primary/10 p-2">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-sidebar-foreground">
              Asistente UCT
            </h2>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Workspace de chat
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-b border-border px-3 py-3">
        <div className="space-y-1.5">
          <Button
            variant="default"
            className="h-10 w-full justify-start rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              onNewConversation();
              onClose?.();
            }}
          >
            <Plus className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">Nueva conversación</span>
          </Button>

          <Button
            variant="ghost"
            className="h-10 w-full justify-start rounded-xl text-foreground hover:bg-muted"
            onClick={() => {
              onOpenDocuments?.();
              onClose?.();
            }}
          >
            <FileText className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">Documentos</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="mb-2 px-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Conversaciones
          </h3>
        </div>

        <div className="space-y-1">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeConversationId === conv.id}
                onSelect={(id) => {
                  onSelectConversation?.(id);
                  onClose?.();
                }}
                onRename={onRenameConversation}
                      onRequestRename={onRequestRename}
                      isHighlighted={recentlyUpdatedId === conv.id}
                onDelete={onDeleteConversation}
              />
            ))
          ) : (
            <div className="px-2 py-6 text-center text-xs text-muted-foreground/70">
              No hay conversaciones
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-3 py-3">
        <div className="space-y-1.5 rounded-2xl border border-border/60 bg-background/60 p-2">
          <div className="flex items-center justify-between px-1 py-1">
            <span className="text-xs font-medium text-foreground">Tema</span>
            <ModeToggle />
          </div>

          <Button
            variant="ghost"
            className="h-9 w-full justify-start rounded-xl text-destructive hover:bg-destructive/10"
            onClick={() => {
              onLogout();
              onClose?.();
            }}
          >
            <LogOut className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">Cerrar sesión</span>
          </Button>

        </div>
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onNewConversation,
  onOpenDocuments,
  onLogout,
  conversations,
  activeConversationId,
  onSelectConversation,
  onRenameConversation,
  onRequestRename,
  recentlyUpdatedId,
  onDeleteConversation,
  onClose,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const contentProps = {
    onNewConversation,
    onOpenDocuments,
    onLogout,
    conversations,
    activeConversationId,
    onSelectConversation,
    onRenameConversation,
    onRequestRename,
    recentlyUpdatedId,
    onDeleteConversation,
    onClose,
  };

  return (
    <>
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl bg-background shadow-md"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <SheetDescription className="sr-only">
              Panel lateral con opciones de navegación y conversaciones
            </SheetDescription>
            <SidebarContent 
              {...contentProps} 
              onClose={() => setMobileOpen(false)} 
            />
          </SheetContent>
        </Sheet>
      </div>

      <aside
        className={`relative hidden h-screen flex-col overflow-hidden border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out md:flex ${
          isOpen ? "w-72" : "w-[78px]"
        }`}
      >
        <div className="shrink-0 border-b border-sidebar-border p-3">
          {isOpen ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="rounded-xl bg-primary/10 p-2">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-sidebar-foreground">
                    Asistente UCT
                  </h2>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Workspace
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8 rounded-lg"
                title="Cerrar sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-xl bg-primary/10 p-2">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8 rounded-lg"
                title="Abrir sidebar"
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          )}
        </div>

        <div className="shrink-0 border-b border-border px-2 py-2">
          {isOpen ? (
            <div className="space-y-1.5">
              <Button
                variant="default"
                className="h-10 w-full justify-start rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onNewConversation}
              >
                <Plus className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">Nueva conversación</span>
              </Button>

              <Button
                variant="ghost"
                className="h-10 w-full justify-start rounded-xl text-foreground hover:bg-muted"
                onClick={onOpenDocuments}
              >
                <FileText className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">Documentos</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Button
                variant="default"
                size="icon"
                className="h-10 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onNewConversation}
                title="Nueva conversación"
              >
                <Plus className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-full rounded-xl text-foreground hover:bg-muted"
                onClick={onOpenDocuments}
                title="Documentos"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div
          className={`flex-1 overflow-y-auto px-2 py-3 transition-opacity duration-200 ${
            isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {isOpen && (
            <>
              <div className="mb-2 px-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Conversaciones
                </h3>
              </div>

              <div className="space-y-1">
                {conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={activeConversationId === conv.id}
                      onSelect={onSelectConversation}
                      onRename={onRenameConversation}
                      onRequestRename={onRequestRename}
                      onDelete={onDeleteConversation}
                    />
                  ))
                ) : (
                  <div className="px-2 py-6 text-center text-xs text-muted-foreground/70">
                    No hay conversaciones
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="shrink-0 border-t border-border p-2">
          {isOpen ? (
            <div className="space-y-1.5 rounded-2xl border border-border/60 bg-background/60 p-2">
              <div className="flex items-center justify-between px-1 py-1">
                <span className="text-xs font-medium text-foreground">
                  Tema
                </span>
                <ModeToggle />
              </div>

              <Button
                variant="ghost"
                className="h-9 w-full justify-start rounded-xl text-destructive hover:bg-destructive/10"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">Cerrar sesión</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ModeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10"
                onClick={onLogout}
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
