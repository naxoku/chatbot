import React, { memo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { BotMessage } from "@/components/messages/BotMessage";
import { UserMessage } from "@/components/messages/UserMessage";
import { Sidebar } from "@/components/sidebar";
import { DocumentsModal } from "@/components/DocumentsModal";
import { ArtifactsModal } from "@/components/ArtifactsModal";
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
  const { setIsAuthenticated } = React.useContext(AppContext);

  // ===== ESTADO LOCAL =====
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = React.useState(false);
  const [isArtifactsModalOpen, setIsArtifactsModalOpen] = React.useState(false);
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
  const [selectedMindMapTitle, setSelectedMindMapTitle] = React.useState<string>("Mapa Mental");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputMessage, setInputMessage] = React.useState("");
  const [isBotOnline] = React.useState(true);
  const [activeConversationId, setActiveConversationId] = React.useState<string>("1");
  const [quotedMessage, setQuotedMessage] = React.useState<Message | null>(null);
  const [currentChat, setCurrentChat] = React.useState<Conversation | null>(null);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedParameters, setSelectedParameters] = React.useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = React.useState<DocumentData[]>([]);

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
    handleFeedback,
    generarMapaMental,
    conversacionIdRef,
  } = useChatLogic({
    currentChat,
    setCurrentChat,
    setChats: setConversations,
    setMessages,
    setInput: setInputMessage,
    quotedMessage,
    setQuotedMessage,
    addArtifact: (artifact: unknown) => {
      console.log("🧩 Artefacto creado:", artifact);
    },
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

    const newConvId = await sendMessage(inputMessage, selectedParameters, selectedDocuments);
    if (newConvId) {
      console.log("✅ Mensaje enviado, nuevo conversacionId:", newConvId);
    }
  }, [inputMessage, selectedParameters, selectedDocuments, sendMessage, conversacionIdRef]);

  const handleOpenDocuments = useCallback(() => {
    setIsDocumentsModalOpen(true);
  }, []);

  const handleCloseDocuments = useCallback(() => {
    setIsDocumentsModalOpen(false);
  }, []);

  const handleOpenArtifacts = useCallback(() => {
    setIsArtifactsModalOpen(true);
  }, []);

  const handleCloseArtifacts = useCallback(() => {
    setIsArtifactsModalOpen(false);
  }, []);

  const handleOpenMindMap = useCallback((artifactData: unknown, title?: string) => {
    if (artifactData && typeof artifactData === 'object' && 'name' in artifactData) {
      setSelectedMindMapData(artifactData as {
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
      });
      setSelectedMindMapTitle(title || "Mapa Mental");
      setIsMindMapModalOpen(true);
    }
  }, []);

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
    setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
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
        console.error("❌ Error al cerrar sesión en el backend:", response.status);
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

  const handleSelectConversation = useCallback(async (id: string) => {
    console.log("🔄 Seleccionando conversación:", id);
    setActiveConversationId(id);

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
      alert("Error al cargar los mensajes de la conversación");
      setMessages([]);
    }
  }, [conversations, loadConversationMessages]);

  const handleRenameConversation = useCallback(async (id: string, newTitle: string) => {
    console.log("✏️ Renombrando conversación:", id, newTitle);

    setConversations(prev => prev.map((conv) => (conv.id === id ? { ...conv, title: newTitle } : conv)));
    if (currentChat?.id === id) {
      setCurrentChat(prev => prev ? { ...prev, title: newTitle } : null);
    }

    try {
      const success = await backendService.renameConversation(id, newTitle);
      if (!success) {
        console.error("❌ Error al renombrar conversación en el backend");
        alert("Error al renombrar la conversación. Por favor, inténtalo de nuevo.");
        const originalConv = conversations.find((c) => c.id === id);
        if (originalConv) {
          setConversations(prev => prev.map((conv) => (conv.id === id ? originalConv : conv)));
          if (currentChat?.id === id) {
            setCurrentChat(originalConv);
          }
        }
      } else {
        console.log("✅ Conversación renombrada correctamente");
      }
    } catch (error) {
      console.error("❌ Error al renombrar conversación:", error);
      alert("Error de conexión al renombrar la conversación. Por favor, inténtalo de nuevo.");
      const originalConv = conversations.find((c) => c.id === id);
      if (originalConv) {
        setConversations(prev => prev.map((conv) => (conv.id === id ? originalConv : conv)));
        if (currentChat?.id === id) {
          setCurrentChat(originalConv);
        }
      }
    }
  }, [conversations, currentChat]);

  const handleDeleteConversation = useCallback(async (id: string) => {
    console.log("🗑️ Eliminando conversación:", id);

    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    const conversationToDelete = conversations.find((conv) => conv.id === id);
    setConversations(prev => prev.filter((conv) => conv.id !== id));

    if (activeConversationId === id) {
      const remaining = conversations.filter((conv) => conv.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        handleNewConversation();
      }
    }

    try {
      const success = await backendService.deleteConversation(id);
      if (!success) {
        console.error("❌ Error al eliminar conversación en el backend");
        alert("Error al eliminar la conversación. Por favor, inténtalo de nuevo.");
        if (conversationToDelete) {
          setConversations(prev => [...prev, conversationToDelete]);
        }
      } else {
        console.log("✅ Conversación eliminada correctamente");
      }
    } catch (error) {
      console.error("❌ Error al eliminar conversación:", error);
      alert("Error de conexión al eliminar la conversación. Por favor, inténtalo de nuevo.");
      if (conversationToDelete) {
        setConversations(prev => [...prev, conversationToDelete]);
      }
    }
  }, [conversations, activeConversationId, handleNewConversation]);

  const handleQuickAction = useCallback((action: QuickAction, originalMessage: Message) => {
    console.log("⚡ Acción rápida:", action.id);

    if (action.id === "mapa-mental") {
      const convId = conversacionIdRef.current || currentChat?.conversacionId;
      if (convId) {
        generarMapaMental(messages, convId);
      } else {
        alert("Debes tener una conversación guardada para generar un mapa mental.");
      }
    } else {
      setQuotedMessage({
        ...originalMessage,
        timestamp: new Date(),
      });

      let actionText = "";
      switch (action.id) {
        case "resumen":
          actionText = "Por favor, resume el mensaje anterior";
          break;
        case "explicar":
          actionText = "Por favor, explica mejor el mensaje anterior";
          break;
        case "ejemplo":
          actionText = "Por favor, dame ejemplos relacionados con el mensaje anterior";
          break;
        default:
          actionText = action.text;
      }
      setInputMessage(actionText);
    }
  }, [conversacionIdRef, currentChat, generarMapaMental, messages]);

  const handleQuoteMessage = useCallback((messageToQuote: Message) => {
    console.log("💬 Citando mensaje:", messageToQuote.id);
    setQuotedMessage({
      ...messageToQuote,
      timestamp: new Date(),
    });
  }, []);

  const handleClearQuotedMessage = useCallback(() => {
    console.log("🧹 Limpiando mensaje citado");
    setQuotedMessage(null);
  }, []);

  const handleViewMindMap = useCallback((artifactData: unknown) => {
    console.log("🗺️ Mostrando mapa mental:", artifactData);
    handleOpenMindMap(artifactData);
  }, [handleOpenMindMap]);

  // ===== EFECTOS =====
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      console.log("📥 Sincronizando conversaciones cargadas:", loadedConversations.length);
      setConversations(loadedConversations);
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
          isBotOnline={isBotOnline}
          onNewConversation={handleNewConversation}
          onOpenDocuments={handleOpenDocuments}
          onLogout={handleLogout}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
        />

        <DocumentsModal
          isOpen={isDocumentsModalOpen}
          onClose={handleCloseDocuments}
          onDocumentsSelect={handleDocumentsSelect}
          preselectedDocuments={selectedDocuments}
        />

        <ArtifactsModal
          isOpen={isArtifactsModalOpen}
          onClose={handleCloseArtifacts}
          messages={messages}
          onViewMindMap={handleViewMindMap}
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

        <div className="flex-1 flex flex-col min-w-0 h-full">
          <MemoizedChatHeader
            conversationTitle={currentChat?.title || "Nueva Conversación"}
            onOpenArtifacts={handleOpenArtifacts}
          />

          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <EmptyChatState
                conversationTitle={currentChat?.title || "Nueva Conversación"}
              />
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message) =>
                  message.sender === "bot" ? (
                    <BotMessage
                      key={message.id}
                      message={message}
                      onQuickAction={handleQuickAction}
                      onQuoteMessage={handleQuoteMessage}
                      onFeedback={handleFeedback}
                      onViewMindMap={handleViewMindMap}
                    />
                  ) : (
                    <div key={message.id} className="pl-24">
                      <UserMessage
                        key={`user-${message.id}`}
                        message={message}
                        onQuickAction={handleQuickAction}
                        onQuoteMessage={handleQuoteMessage}
                        onViewMindMap={handleViewMindMap}
                      />
                    </div>
                  )
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <MemoizedChatInput
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            onSendMessage={handleSendMessage}
            onKeyPress={() => {}}
            isBotOnline={isBotOnline}
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