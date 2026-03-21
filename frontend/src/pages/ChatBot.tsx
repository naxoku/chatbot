import React, { memo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { BotMessage } from "@/components/messages/BotMessage";
import { UserMessage } from "@/components/messages/UserMessage";
import { Sidebar } from "@/components/sidebar";
import { DocumentsModal } from "@/components/DocumentsModal";
import { MindMapModal } from "@/components/MindMapModal";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatInput } from "@/components/ChatInput";
import { EmptyChatState } from "@/components/EmptyChatState";
import { type QuickAction } from "@/components/config/quickActions";
import { useChatLogic, useConversations } from "@/hooks/useChatLogic";
import type { Message, Conversation } from "@/services/backendService";
import { backendService } from "@/services/backendService";
import { AppContext } from "@/App";
import { LOGOUT } from "@/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  isSameDay,
  formatDateLabel,
} from "@/components/messages/utils/messageUtils";

// Tipo simple para documentos
interface DocumentData {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  url: string;
  keywords?: string[];
}

// Props interface para memoización
type ChatBotProps = object;

const ChatBot: React.FC<ChatBotProps> = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isConversationSwitch = useRef(false);
  const { setIsAuthenticated } = React.useContext(AppContext);

  // ===== ESTADO LOCAL =====
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = React.useState(false);
  const [isMindMapModalOpen, setIsMindMapModalOpen] = React.useState(false);
  const [selectedMindMapData, setSelectedMindMapData] = React.useState<{
    name: string;
    subtitle?: string;
    icon?: string;
    children?: Array<{
      name: string;
      subtitle?: string;
      icon?: string;
      children?: Array<{
        name: string;
        subtitle?: string;
        icon?: string;
        children?: Array<{
          name: string;
          subtitle?: string;
          icon?: string;
          children?: unknown[];
        }>;
      }>;
    }>;
  } | null>(null);
  const [selectedMindMapTitle, setSelectedMindMapTitle] =
    React.useState<string>("Mapa Mental");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputMessage, setInputMessage] = React.useState("");
  const [activeConversationId, setActiveConversationId] =
    React.useState<string>("1");
  const [quotedMessage, setQuotedMessage] = React.useState<Message | null>(
    null,
  );
  const [currentChat, setCurrentChat] = React.useState<Conversation | null>(
    null,
  );
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [recentlyUpdatedId, setRecentlyUpdatedId] = React.useState<string | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = React.useState<string | null>(null);

  const updateConversations = React.useCallback(
    (updater: React.SetStateAction<Conversation[]>) => {
      setConversations((prev) => {
        const candidate = typeof updater === "function" ? (updater as any)(prev) : updater;
        const arr: Conversation[] = Array.isArray(candidate) ? candidate : prev;

        const normalized = arr.map((c) => ({
          ...c,
          timestamp: c.timestamp ? new Date(c.timestamp) : new Date(),
        }));

        // Detectar si alguna conversación aumentó su timestamp
        let changedId: string | null = null;
        for (const nextConv of normalized) {
          const prevConv = prev.find((p) => p.id === nextConv.id);
          if (!prevConv) continue;
          const prevTs = new Date(prevConv.timestamp).getTime();
          const nextTs = new Date(nextConv.timestamp).getTime();
          if (nextTs > prevTs) {
            if (!changedId) changedId = nextConv.id;
            else {
              // escoger el más reciente
              const currentChanged = normalized.find((n) => n.id === changedId)!;
              if (nextTs > new Date(currentChanged.timestamp).getTime()) {
                changedId = nextConv.id;
              }
            }
          }
        }

        // Si no hay cambio por timestamp, detectar nuevas conversaciones añadidas
        if (!changedId) {
          for (const nextConv of normalized) {
            const prevConv = prev.find((p) => p.id === nextConv.id);
            if (!prevConv) {
              changedId = nextConv.id;
              break;
            }
          }
        }

        const sorted = normalized.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

        if (changedId) {
          setRecentlyUpdatedId(changedId);
          setTimeout(() => setRecentlyUpdatedId(null), 900);
        }

        return sorted;
      });
    },
    [],
  );
  const [selectedParameters, setSelectedParameters] = React.useState<string[]>(
    [],
  );
  const [selectedDocuments, setSelectedDocuments] = React.useState<
    DocumentData[]
  >([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [conversationToDelete, setConversationToDelete] = React.useState<
    string | null
  >(null);
  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);
  const [conversationToRenameId, setConversationToRenameId] = React.useState<
    string | null
  >(null);
  const [renameTitle, setRenameTitle] = React.useState<string>("");
  const [errorDialog, setErrorDialog] = React.useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: "" });

  // ===== HOOK PARA CONVERSACIONES =====
  const {
    conversations: loadedConversations,
    loadConversations,
    loadConversationMessages,
  } = useConversations();

  // ===== HOOK DE LÓGICA DE CHAT =====
  const {
    isTyping,
    sendMessage,
    generarMapaMental,
    cancelarMapaMental,
    reintentarMapaMental,
    conversacionIdRef,
  } = useChatLogic({
    currentChat,
    setCurrentChat,
    setChats: updateConversations,
    setMessages,
    setInput: setInputMessage,
    quotedMessage,
    setQuotedMessage,
  });

  // ===== HANDLERS =====

  const handleNewConversation = useCallback(() => {
    console.log("🆕 Nueva conversación");
    setCurrentChat(null);
    setMessages([]);
    setQuotedMessage(null);
    setSelectedParameters([]);
    conversacionIdRef.current = null;
  }, [conversacionIdRef]);

  const handleSendMessage = useCallback(async () => {
    console.log("📤 ===== HANDLER SEND MESSAGE =====");
    console.log("   Input:", inputMessage.substring(0, 50));
    console.log("   Parámetros:", selectedParameters);
    console.log("   Documentos seleccionados:", selectedDocuments.length);
    console.log("   ConversacionId:", conversacionIdRef.current);

    if (!inputMessage.trim()) {
      console.warn("⚠️ Mensaje vacío");
      return;
    }

    const newConvId = await sendMessage(
      inputMessage,
      selectedParameters,
      selectedDocuments,
    );
    if (newConvId) {
      console.log("✅ Mensaje enviado, nuevo conversacionId:", newConvId);
    }
  }, [
    inputMessage,
    selectedParameters,
    selectedDocuments,
    sendMessage,
    conversacionIdRef,
  ]);

  const handleOpenDocuments = useCallback(() => {
    setIsDocumentsModalOpen(true);
  }, []);

  const handleCloseDocuments = useCallback(() => {
    setIsDocumentsModalOpen(false);
  }, []);

  const handleOpenMindMap = useCallback(
    (artifactData: unknown, title?: string) => {
      if (!artifactData || typeof artifactData !== "object") {
        return;
      }

      const source = artifactData as Record<string, unknown>;
      let mapData: unknown = source;

      // Formato actual del chat: artifactData = { name, data, ... }
      if (source.data && typeof source.data === "object") {
        mapData = source.data;
      }

      // Compatibilidad con estructuras antiguas o provenientes de backend/n8n
      if (
        mapData &&
        typeof mapData === "object" &&
        "respuesta" in (mapData as Record<string, unknown>)
      ) {
        let respuesta = (mapData as Record<string, unknown>).respuesta;
        while (
          respuesta &&
          typeof respuesta === "object" &&
          "respuesta" in (respuesta as Record<string, unknown>)
        ) {
          respuesta = (respuesta as Record<string, unknown>).respuesta;
        }
        if (
          respuesta &&
          typeof respuesta === "object" &&
          "datos" in (respuesta as Record<string, unknown>)
        ) {
          mapData = (respuesta as Record<string, unknown>).datos;
        }
      }

      if (
        mapData &&
        typeof mapData === "object" &&
        "datos" in (mapData as Record<string, unknown>)
      ) {
        mapData = (mapData as Record<string, unknown>).datos;
      }

      if (!mapData || typeof mapData !== "object" || !("name" in mapData)) {
        console.warn("⚠️ Datos de mapa mental inválidos:", artifactData);
        return;
      }

      const mapTitle =
        title ||
        (typeof source.name === "string" && source.name.trim()
          ? source.name
          : "Mapa Mental");

      setSelectedMindMapData(
        mapData as {
          name: string;
          subtitle?: string;
          icon?: string;
          children?: Array<{
            name: string;
            subtitle?: string;
            icon?: string;
            children?: Array<{
              name: string;
              subtitle?: string;
              icon?: string;
              children?: Array<{
                name: string;
                subtitle?: string;
                icon?: string;
                children?: unknown[];
              }>;
            }>;
          }>;
        },
      );
      setSelectedMindMapTitle(mapTitle);
      setIsMindMapModalOpen(true);
    },
    [],
  );

  const handleCloseMindMap = useCallback(() => {
    setIsMindMapModalOpen(false);
    setSelectedMindMapData(null);
    setSelectedMindMapTitle("Mapa Mental");
  }, []);

  const handleDocumentsSelect = useCallback((documents: DocumentData[]) => {
    console.log("📄 Documentos seleccionados:", documents);
    setSelectedDocuments(documents);
  }, []);

  const handleRemoveDocument = useCallback((documentId: string) => {
    console.log("🗑️ Eliminando documento:", documentId);
    setSelectedDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  }, []);

  const handleAddDocuments = useCallback(() => {
    console.log("➕ Añadiendo nuevos documentos");
    setIsDocumentsModalOpen(true);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      console.log("🚪 Cerrando sesión...");

      const response = await fetch(LOGOUT, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.error(
          "❌ Error al cerrar sesión en el backend:",
          response.status,
        );
      } else {
        console.log("✅ Logout exitoso en el backend");
      }

      setIsAuthenticated(false);
      localStorage.removeItem("sessionToken");
      navigate("/login");
    } catch (error) {
      console.error("❌ Error durante el logout:", error);
      setIsAuthenticated(false);
      localStorage.removeItem("sessionToken");
      navigate("/login");
    }
  }, [navigate, setIsAuthenticated]);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      console.log("🔄 Seleccionando conversación:", id);
      setActiveConversationId(id);
      isConversationSwitch.current = true;

      try {
        const conv = conversations.find((c) => c.id === id);
        if (conv) {
          setCurrentChat(conv);
          const loadedMessages = await loadConversationMessages(id);
          console.log("✅ Mensajes cargados:", loadedMessages.length);
          setMessages(loadedMessages);
          setQuotedMessage(null);
        }
      } catch (error) {
        console.error("❌ Error al cargar mensajes:", error);
        setErrorDialog({
          open: true,
          message: "Error al cargar los mensajes de la conversación.",
        });
        setMessages([]);
      }
    },
    [conversations, loadConversationMessages],
  );

  const handleRenameConversation = useCallback(
    async (id: string, newTitle: string) => {
      console.log("✏️ Renombrando conversación:", id, newTitle);

      updateConversations((prev) =>
        prev.map((conv) => (conv.id === id ? { ...conv, title: newTitle } : conv)),
      );
      if (currentChat?.id === id) {
        setCurrentChat((prev) => (prev ? { ...prev, title: newTitle } : null));
      }

      try {
        const success = await backendService.renameConversation(id, newTitle);
        if (!success) {
          console.error("❌ Error al renombrar conversación en el backend");
          setErrorDialog({
            open: true,
            message:
              "Error al renombrar la conversación. Por favor, inténtalo de nuevo.",
          });
          const originalConv = conversations.find((c) => c.id === id);
          if (originalConv) {
            updateConversations((prev) => prev.map((conv) => (conv.id === id ? originalConv : conv)));
            if (currentChat?.id === id) {
              setCurrentChat(originalConv);
            }
          }
        } else {
          console.log("✅ Conversación renombrada correctamente");
        }
      } catch (error) {
        console.error("❌ Error al renombrar conversación:", error);
        setErrorDialog({
          open: true,
          message:
            "Error de conexión al renombrar la conversación. Por favor, inténtalo de nuevo.",
        });
        const originalConv = conversations.find((c) => c.id === id);
        if (originalConv) {
          updateConversations((prev) => prev.map((conv) => (conv.id === id ? originalConv : conv)));
          if (currentChat?.id === id) {
            setCurrentChat(originalConv);
          }
        }
      }
    },
    [conversations, currentChat],
  );

  const handleDeleteConversation = useCallback((id: string) => {
    console.log("🗑️ Solicitud de eliminar conversación:", id);
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleRequestRename = useCallback(
    (id: string, currentTitle: string) => {
      setConversationToRenameId(id);
      setRenameTitle(currentTitle);
      setRenameDialogOpen(true);
    },
    [],
  );

  const confirmDeleteConversation = useCallback(async () => {
    const id = conversationToDelete;
    if (!id) return;

    setDeleteDialogOpen(false);
    setConversationToDelete(null);

    console.log("🗑️ Eliminando conversación:", id);

    const convToDelete = conversations.find((conv) => conv.id === id);
    updateConversations((prev) => prev.filter((conv) => conv.id !== id));

    if (activeConversationId === id) {
      // Si estamos borrando la conversación activa, salir a "nueva conversación"
      handleNewConversation();
      setActiveConversationId("");
    }

    try {
      const success = await backendService.deleteConversation(id);
      if (!success) {
        console.error("❌ Error al eliminar conversación en el backend");
        if (convToDelete) {
          updateConversations((prev) => [...prev, convToDelete]);
        }
      } else {
        console.log("✅ Conversación eliminada correctamente");
      }
    } catch (error) {
      console.error("❌ Error al eliminar conversación:", error);
      if (convToDelete) {
        updateConversations((prev) => [...prev, convToDelete]);
      }
    }
  }, [
    conversationToDelete,
    conversations,
    activeConversationId,
    handleNewConversation,
  ]);

  const confirmRenameDialog = useCallback(async () => {
    const id = conversationToRenameId;
    if (!id) return;

    setRenameDialogOpen(false);
    setConversationToRenameId(null);

    await handleRenameConversation(id, renameTitle);
  }, [conversationToRenameId, renameTitle, handleRenameConversation]);

  const handleQuickAction = useCallback(
    (action: QuickAction, originalMessage: Message) => {
      console.log("⚡ Acción rápida:", action.id);
      console.log(
        "📝 Mensaje original:",
        originalMessage.id,
        originalMessage.content.substring(0, 100),
      );

      if (action.id === "mapa-mental") {
        const convId = conversacionIdRef.current || currentChat?.conversacionId;
        if (convId) {
          // Usar el contenido específico del mensaje donde se activó la acción
          generarMapaMental(originalMessage.content, convId, originalMessage.id);
        } else {
          setErrorDialog({
            open: true,
            message:
              "Debes tener una conversación guardada para generar un mapa mental.",
          });
        }
      } else {
        // Citar el mensaje específico para que el usuario sepa a qué se refiere
        setQuotedMessage({
          ...originalMessage,
          timestamp: new Date(),
        });

        // Generar el texto de la acción con referencia al contenido citado
        let actionText = "";
        switch (action.id) {
          case "resumen":
            actionText = "Por favor, resume el mensaje que estoy citando";
            break;
          case "explicar":
            actionText =
              "Por favor, explica mejor el mensaje que estoy citando";
            break;
          case "ejemplo":
            actionText =
              "Por favor, dame ejemplos relacionados con el mensaje que estoy citando";
            break;
          default:
            actionText = action.text;
        }
        setInputMessage(actionText);
      }
    },
    [conversacionIdRef, currentChat, generarMapaMental],
  );

  const handleQuoteMessage = useCallback((messageToQuote: Message) => {
    console.log("💬 Citando mensaje:", messageToQuote.id);
    setQuotedMessage({
      ...messageToQuote,
      timestamp: new Date(),
    });
  }, []);

  const handleRetry = useCallback(
    async (errorMessage: Message) => {
      console.log("🔁 Reintentar mensaje para:", errorMessage.id);

      // Determinar el texto del usuario a re-enviar
      let userText = errorMessage.quotedMessageContent || "";
      if (!userText) {
        // Buscar el último mensaje de usuario anterior a este mensaje
        const idx = messages.findIndex((m) => m.id === errorMessage.id);
        if (idx > 0) {
          for (let i = idx - 1; i >= 0; i--) {
            if (messages[i].sender === "user") {
              userText = messages[i].content;
              break;
            }
          }
        }
      }

      if (!userText || !userText.trim()) {
        setErrorDialog({
          open: true,
          message:
            "No se encontró el mensaje de usuario a reintentar. Por favor, escribe de nuevo.",
        });
        return;
      }

      // Eliminar el mensaje de error localmente
      const newMessages = messages.filter((m) => m.id !== errorMessage.id);
      setMessages(newMessages);

      // Persistir la eliminación en el backend si la conversación está guardada
      try {
        const convId = currentChat?.conversacionId;
        if (convId) {
          const success = await backendService.updateConversationMessages(
            convId,
            newMessages,
          );
          if (!success) {
            console.error("❌ No se pudo actualizar mensajes en backend");
            setErrorDialog({
              open: true,
              message:
                "No se pudo sincronizar la eliminación del mensaje con el servidor.",
            });
          }
        }
      } catch (err) {
        console.error("❌ Error actualizando mensajes en backend:", err);
        setErrorDialog({
          open: true,
          message:
            "Error de conexión al sincronizar la eliminación del mensaje. Por favor, inténtalo de nuevo.",
        });
      }

      // Reenviar el texto del usuario
      try {
        await sendMessage(userText, selectedParameters, selectedDocuments);
      } catch (err) {
        console.error("❌ Error re-enviando mensaje:", err);
        setErrorDialog({
          open: true,
          message:
            "Error al reintentar la petición. Revisa tu conexión y prueba de nuevo.",
        });
      }
    },
    [messages, currentChat, sendMessage, selectedParameters, selectedDocuments],
  );

  // Handler para cancelar la generación de un mapa mental
  const handleCancelMindMap = useCallback(
    async (messageId: string) => {
      console.log("🚫 Cancelando mapa mental:", messageId);
      await cancelarMapaMental(messageId);
    },
    [cancelarMapaMental],
  );

  // Handler para reintentar la generación de un mapa mental
  const handleRetryMindMap = useCallback(
    async (errorMessage: Message, originalContent: string) => {
      console.log("🔁 Reintentando mapa mental:", errorMessage.id);

      const convId = conversacionIdRef.current || currentChat?.conversacionId;
      if (!convId) {
        setErrorDialog({
          open: true,
          message: "No se encontró la conversación activa.",
        });
        return;
      }

      await reintentarMapaMental(originalContent, convId, errorMessage.id);
    },
    [conversacionIdRef, currentChat, reintentarMapaMental],
  );

  // Handler para enfocar/resaltar un mensaje
  const handleFocusMessage = useCallback((messageId: string) => {
    console.log("🎯 Enfocando mensaje:", messageId);
    setHighlightedMessageId(messageId);
    
    // Scroll al mensaje y quitar el highlight después de unos segundos
    setTimeout(() => {
      const element = document.querySelector(`[data-message-id="${messageId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      
      // Quitar el highlight después de 2 segundos
      setTimeout(() => {
        setHighlightedMessageId((prev) => (prev === messageId ? null : prev));
      }, 2000);
    }, 100);
  }, []);

  const handleClearQuotedMessage = useCallback(() => {
    console.log("🧹 Limpiando mensaje citado");
    setQuotedMessage(null);
  }, []);

  const handleViewMindMap = useCallback(
    (artifactData: unknown) => {
      console.log("🗺️ Mostrando mapa mental:", artifactData);
      handleOpenMindMap(artifactData);
    },
    [handleOpenMindMap],
  );

  // ===== EFECTOS =====
  const scrollToBottom = useCallback(() => {
    if (isConversationSwitch.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      isConversationSwitch.current = false;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const initializeConversations = async () => {
      console.log("🚀 Inicializando conversaciones...");
      await loadConversations();
    };
    initializeConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (loadedConversations.length > 0) {
      console.log(
        "📥 Sincronizando conversaciones cargadas:",
        loadedConversations.length,
      );
      updateConversations(loadedConversations);
    }
  }, [loadedConversations]);

  // ===== COMPONENTES PESADOS =====
  const MemoizedSidebar = React.useMemo(() => memo(Sidebar), []);
  const MemoizedChatHeader = React.useMemo(() => memo(ChatHeader), []);
  const MemoizedChatInput = React.useMemo(() => memo(ChatInput), []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="h-screen bg-background flex overflow-hidden">
        <MemoizedSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewConversation={handleNewConversation}
          onOpenDocuments={handleOpenDocuments}
          onLogout={handleLogout}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onRenameConversation={handleRenameConversation}
          onRequestRename={handleRequestRename}
          recentlyUpdatedId={recentlyUpdatedId}
          onDeleteConversation={handleDeleteConversation}
        />

        <DocumentsModal
          isOpen={isDocumentsModalOpen}
          onClose={handleCloseDocuments}
          onDocumentsSelect={handleDocumentsSelect}
          preselectedDocuments={selectedDocuments}
        />

        {isMindMapModalOpen && selectedMindMapData && (
          <MindMapModal
            isOpen={isMindMapModalOpen}
            onClose={handleCloseMindMap}
            artifact={{
              name: selectedMindMapTitle,
              data: selectedMindMapData,
              description: "Mapa mental de la conversación",
            }}
          />
        )}

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Eliminar conversación</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente
                la conversación y todos sus mensajes.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDeleteConversation}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Renombrar conversación</DialogTitle>
              <DialogDescription>
                Cambia el título de la conversación.
              </DialogDescription>
            </DialogHeader>
            <div className="px-4 pb-4">
              <Input
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                placeholder="Título de la conversación"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setRenameDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={confirmRenameDialog}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={errorDialog.open}
          onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
              <DialogDescription>{errorDialog.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setErrorDialog({ open: false, message: "" })}
              >
                Aceptar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex-1 flex flex-col min-w-0 h-full">
          <MemoizedChatHeader
            conversationTitle={currentChat?.title || "Nueva Conversación"}
          />

          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <EmptyChatState
                conversationTitle={currentChat?.title || "Nueva Conversación"}
              />
            ) : (
              <div className="mx-auto max-w-3xl space-y-4">
                {messages.map((message, idx) => {
                  const prev = idx > 0 ? messages[idx - 1] : undefined;
                  const showDateSeparator =
                    !prev || !isSameDay(prev.timestamp, message.timestamp);
                  return (
                    <React.Fragment key={message.id}>
                      {showDateSeparator && (
                        <div className="flex items-center justify-center">
                          <div className="px-3 py-1 rounded-full bg-muted/60 text-[12px] text-muted-foreground font-medium">
                            {formatDateLabel(message.timestamp)}
                          </div>
                        </div>
                      )}
                      {message.sender === "bot" ? (
                        <BotMessage
                          message={message}
                          onQuickAction={handleQuickAction}
                          onQuoteMessage={handleQuoteMessage}
                          onViewMindMap={handleViewMindMap}
                          onRetry={handleRetry}
                          onCancelMindMap={handleCancelMindMap}
                          onRetryMindMap={handleRetryMindMap}
                          onFocusMessage={handleFocusMessage}
                          isHighlighted={highlightedMessageId === message.id}
                        />
                      ) : (
                        <UserMessage
                          message={message}
                          onQuickAction={handleQuickAction}
                          onQuoteMessage={handleQuoteMessage}
                          onViewMindMap={handleViewMindMap}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <MemoizedChatInput
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            onSendMessage={handleSendMessage}
            onKeyPress={() => {}}
            quotedMessage={quotedMessage}
            onClearQuotedMessage={handleClearQuotedMessage}
            isTyping={isTyping}
            selectedDocuments={selectedDocuments}
            onRemoveDocument={handleRemoveDocument}
            onAddDocuments={handleAddDocuments}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default memo(ChatBot);
