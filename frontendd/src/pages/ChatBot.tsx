// frontendd/src/pages/ChatBot.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { BotMessage } from "@/components/messages/BotMessage";
import { UserMessage } from "@/components/messages/UserMessage";
import { Sidebar } from "@/components/sidebar";
import { DocumentsModal } from "@/components/DocumentsModal";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatInput } from "@/components/ChatInput";
import { EmptyChatState } from "@/components/EmptyChatState";
import { type QuickAction } from "@/components/config/quickActions";
import { useChatLogic, useConversations } from "@/hooks/useChatLogic";
import type { Message, Conversation } from "@/services/backendService";
import { backendService } from "@/services/backendService";

interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  url: string;
  keywords?: string[];
}

const ChatBot: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ===== ESTADO LOCAL =====
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isBotOnline] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string>("1");
  const [quotedMessage, setQuotedMessage] = useState<Message | null>(null);
  const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);

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
  });

  // ===== AUTO-SCROLL =====
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ===== CARGAR CONVERSACIONES AL INICIAR =====
  useEffect(() => {
    const initializeConversations = async () => {
      console.log("🚀 Inicializando conversaciones...");
      await loadConversations();
    };

    initializeConversations();
  }, [loadConversations]);

  // ===== SINCRONIZAR CONVERSACIONES CARGADAS =====
  useEffect(() => {
    if (loadedConversations.length > 0) {
      console.log(
        "📥 Sincronizando conversaciones cargadas:",
        loadedConversations.length
      );
      setConversations(loadedConversations);
    }
  }, [loadedConversations, setConversations]);

  // ===== LOG DEL ESTADO =====
  useEffect(() => {
    console.log("📊 ===== ESTADO ACTUAL =====");
    console.log("   Mensajes:", messages.length);
    console.log("   CurrentChat:", currentChat?.conversacionId || "ninguno");
    console.log("   ConversacionIdRef:", conversacionIdRef.current);
    console.log("   Conversaciones:", conversations.length);
    console.log("   IsTyping:", isTyping);
  }, [messages, currentChat, conversations, isTyping, conversacionIdRef]);

  // ===== HANDLERS =====

  const handleNewConversation = () => {
    console.log("🆕 Nueva conversación");
    setCurrentChat(null);
    setMessages([]);
    setQuotedMessage(null);
    setSelectedParameters([]);
    conversacionIdRef.current = null;
  };

  const handleSendMessage = async () => {
    console.log("📤 ===== HANDLER SEND MESSAGE =====");
    console.log("   Input:", inputMessage.substring(0, 50));
    console.log("   Parámetros:", selectedParameters);
    console.log("   ConversacionId:", conversacionIdRef.current);

    if (!inputMessage.trim()) {
      console.warn("⚠️ Mensaje vacío");
      return;
    }

    const newConvId = await sendMessage(inputMessage, selectedParameters);

    if (newConvId) {
      console.log("✅ Mensaje enviado, nuevo conversacionId:", newConvId);
    }
  };

  const handleKeyPress = () => {
    // El manejo de teclas ya está en ChatInput, este es solo un pass-through
    // No hacer nada aquí, ChatInput maneja todo
  };

  const handleOpenDocuments = () => {
    setIsDocumentsModalOpen(true);
  };

  const handleCloseDocuments = () => {
    setIsDocumentsModalOpen(false);
  };

  const handleDocumentSelect = (document: Document) => {
    console.log("📄 Documento seleccionado:", document);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: `Has seleccionado el documento: ${document.title}`,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const handleSelectConversation = async (id: string) => {
    console.log("🔄 Seleccionando conversación:", id);
    setActiveConversationId(id);

    try {
      const conv = conversations.find((c) => c.id === id);
      if (conv) {
        setCurrentChat(conv);

        // Cargar mensajes de la conversación
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
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    console.log("✏️ Renombrando conversación:", id, newTitle);

    // Actualizar estado local inmediatamente para mejor UX
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, title: newTitle } : conv))
    );

    // Actualizar también currentChat si es la conversación activa
    if (currentChat?.id === id) {
      setCurrentChat((prev) => (prev ? { ...prev, title: newTitle } : null));
    }

    try {
      // Llamar al backend para renombrar la conversación
      const success = await backendService.renameConversation(id, newTitle);

      if (!success) {
        console.error("❌ Error al renombrar conversación en el backend");
        alert(
          "Error al renombrar la conversación. Por favor, inténtalo de nuevo."
        );

        // Revertir cambios en caso de error
        const originalConv = conversations.find((c) => c.id === id);
        if (originalConv) {
          setConversations((prev) =>
            prev.map((conv) => (conv.id === id ? originalConv : conv))
          );
          if (currentChat?.id === id) {
            setCurrentChat(originalConv);
          }
        }
      } else {
        console.log("✅ Conversación renombrada correctamente");
      }
    } catch (error) {
      console.error("❌ Error al renombrar conversación:", error);
      alert(
        "Error de conexión al renombrar la conversación. Por favor, inténtalo de nuevo."
      );

      // Revertir cambios en caso de error
      const originalConv = conversations.find((c) => c.id === id);
      if (originalConv) {
        setConversations((prev) =>
          prev.map((conv) => (conv.id === id ? originalConv : conv))
        );
        if (currentChat?.id === id) {
          setCurrentChat(originalConv);
        }
      }
    }
  };

  const handleDeleteConversation = async (id: string) => {
    console.log("🗑️ Eliminando conversación:", id);

    // Confirmar antes de eliminar
    const confirmed = window.confirm(
      "¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer."
    );
    if (!confirmed) {
      return;
    }

    // Guardar conversación eliminada para posible reversión
    const conversationToDelete = conversations.find((conv) => conv.id === id);

    // Actualizar estado local inmediatamente para mejor UX
    setConversations((prev) => prev.filter((conv) => conv.id !== id));

    // Si la conversación activa se está eliminando, cambiar a otra o crear nueva
    if (activeConversationId === id) {
      const remaining = conversations.filter((conv) => conv.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        handleNewConversation();
      }
    }

    try {
      // Llamar al backend para eliminar la conversación
      const success = await backendService.deleteConversation(id);

      if (!success) {
        console.error("❌ Error al eliminar conversación en el backend");
        alert(
          "Error al eliminar la conversación. Por favor, inténtalo de nuevo."
        );

        // Restaurar conversación en caso de error
        if (conversationToDelete) {
          setConversations((prev) => [...prev, conversationToDelete]);
        }
      } else {
        console.log("✅ Conversación eliminada correctamente");
      }
    } catch (error) {
      console.error("❌ Error al eliminar conversación:", error);
      alert(
        "Error de conexión al eliminar la conversación. Por favor, inténtalo de nuevo."
      );

      // Restaurar conversación en caso de error
      if (conversationToDelete) {
        setConversations((prev) => [...prev, conversationToDelete]);
      }
    }
  };

  const handleQuickAction = (action: QuickAction, originalMessage: Message) => {
    console.log("⚡ Acción rápida:", action.id);

    if (action.id === "mapa-mental") {
      const convId = conversacionIdRef.current || currentChat?.conversacionId;
      if (convId) {
        generarMapaMental(messages, convId);
      } else {
        alert(
          "Debes tener una conversación guardada para generar un mapa mental."
        );
      }
    } else {
      // Para otras acciones, citar el mensaje
      setQuotedMessage({
        ...originalMessage,
        timestamp: new Date(),
      });

      // Y agregar el texto de la acción al input
      let actionText = "";
      switch (action.id) {
        case "resumen":
          actionText = "Por favor, resume el mensaje anterior";
          break;
        case "explicar":
          actionText = "Por favor, explica mejor el mensaje anterior";
          break;
        case "ejemplo":
          actionText =
            "Por favor, dame ejemplos relacionados con el mensaje anterior";
          break;
        default:
          actionText = action.text;
      }
      setInputMessage(actionText);
    }
  };

  const handleQuoteMessage = (messageToQuote: Message) => {
    console.log("💬 Citando mensaje:", messageToQuote.id);
    setQuotedMessage({
      ...messageToQuote,
      timestamp: new Date(),
    });
  };

  const handleClearQuotedMessage = () => {
    console.log("🧹 Limpiando mensaje citado");
    setQuotedMessage(null);
  };

  const handleViewMindMap = (artifactData: unknown) => {
    console.log("🗺️ Mostrando mapa mental:", artifactData);
    // Implementar la lógica para mostrar el mapa mental
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background flex">
        {/* Sidebar Component */}
        <Sidebar
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

        {/* Documents Modal */}
        <DocumentsModal
          isOpen={isDocumentsModalOpen}
          onClose={handleCloseDocuments}
          onDocumentSelect={handleDocumentSelect}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <ChatHeader
            conversationTitle={currentChat?.title || "Nueva Conversación"}
          />

          <div className="flex-1 min-h-0">
            <div className="h-[calc(100vh-12rem)] overflow-y-auto p-6">
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
                      <UserMessage
                        key={message.id}
                        message={message}
                        onQuickAction={handleQuickAction}
                        onQuoteMessage={handleQuoteMessage}
                        onViewMindMap={handleViewMindMap}
                      />
                    )
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          <ChatInput
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            isBotOnline={isBotOnline}
            quotedMessage={quotedMessage}
            onClearQuotedMessage={handleClearQuotedMessage}
            isTyping={isTyping}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ChatBot;
