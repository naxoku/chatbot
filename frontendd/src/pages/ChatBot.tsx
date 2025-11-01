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

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  quotedMessageId?: string;
  quotedMessageContent?: string;
  quotedMessageSender?: "user" | "bot";
  parameters?: string[];
  isContext?: boolean;
  feedbackRequested?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isBotOnline] = useState(true); // Estado del bot (solo lectura)
  const [activeConversationId, setActiveConversationId] = useState<string>("1");
  const [quotedMessage, setQuotedMessage] = useState<{
    id: string;
    content: string;
    sender: "user" | "bot";
  } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Consulta sobre horarios",
      lastMessage: "¿Cuál es el horario de atención?",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      title: "Documentos requeridos",
      lastMessage: "¿Qué documentos necesito?",
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: "3",
      title: "Información de cursos",
      lastMessage: "¿Qué cursos están disponibles?",
      timestamp: new Date(Date.now() - 10800000),
    },
  ]);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Cerrar/Abrir Sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 2. Nueva Conversación
  const handleNewConversation = () => {
    const newConvId = Date.now().toString();
    const newConversation: Conversation = {
      id: newConvId,
      title: "Nueva conversación",
      lastMessage: "",
      timestamp: new Date(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConvId);
    setMessages([]);
    setQuotedMessage(null); // Limpiar cita al cambiar conversación
  };

  // 3. Abrir Modal de Documentos
  const handleOpenDocuments = () => {
    setIsDocumentsModalOpen(true);
  };

  // Cerrar Modal de Documentos
  const handleCloseDocuments = () => {
    setIsDocumentsModalOpen(false);
  };

  // Seleccionar Documento
  const handleDocumentSelect = (document: Document) => {
    console.log("Documento seleccionado:", document);
    // Aquí puedes agregar lógica para usar el documento en el contexto del chat
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

  // 5. Cerrar Sesión
  const handleLogout = () => {
    navigate("/login");
  };

  // 6. Seleccionar Conversación
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    // Aquí cargarías los mensajes de la conversación seleccionada
    setMessages([]);
    setQuotedMessage(null); // Limpiar cita al cambiar conversación
  };

  // 7. Renombrar Conversación (Menú de Acciones)
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, title: newTitle } : conv))
    );
  };

  // 7. Eliminar Conversación (Menú de Acciones)
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));

    // Si se elimina la conversación activa, cambiar a otra o crear nueva
    if (activeConversationId === id) {
      const remaining = conversations.filter((conv) => conv.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        handleNewConversation();
      }
    }
  };

  // 8. Manejar acciones rápidas del mensaje - Estilo WhatsApp
  const handleQuickAction = (action: QuickAction, originalMessage: Message) => {
    // Construir contenido con la cita del mensaje original
    let responseContent = `> **${originalMessage.content}**\n\n`;

    switch (action.id) {
      case "resumen":
        responseContent += `Aquí tienes un resumen del mensaje: ${originalMessage.content.substring(
          0,
          100
        )}...`;
        break;
      case "explicar":
        responseContent += `Explicación detallada: ${originalMessage.content}`;
        break;
      case "ejemplo":
        responseContent += `Te doy un ejemplo basado en tu mensaje: ${originalMessage.content}`;
        break;
      case "mapa-mental":
        responseContent += `Generando mapa mental para: "${originalMessage.content}"`;
        break;
      default:
        responseContent += `Acción "${action.text}" realizada para el mensaje: ${originalMessage.content}`;
    }

    const responseMessage: Message = {
      id: Date.now().toString(),
      content: responseContent,
      sender: "bot",
      timestamp: new Date(),
      parameters: [action.id],
      quotedMessageId: originalMessage.id,
      quotedMessageContent: originalMessage.content,
      quotedMessageSender: originalMessage.sender,
    };

    setMessages((prev) => [...prev, responseMessage]);
  };

  // 9. Citar mensaje (responder) - Estilo WhatsApp
  const handleQuoteMessage = (messageToQuote: Message) => {
    setQuotedMessage({
      id: messageToQuote.id,
      content: messageToQuote.content,
      sender: messageToQuote.sender,
    });
  };

  // 10. Limpiar mensaje citado
  const handleClearQuotedMessage = () => {
    setQuotedMessage(null);
  };

  // 11. Manejar feedback de mensajes
  const handleFeedback = (
    messageId: string,
    isHelpful: boolean,
    comment?: string
  ) => {
    console.log("Feedback recibido:", { messageId, isHelpful, comment });
    // Aquí puedes enviar el feedback al backend
  };

  // 12. Ver mapa mental (handler placeholder)
  const handleViewMindMap = (mindMapData: any) => {
    console.log("Mostrando mapa mental:", mindMapData);
    // Implementar la lógica para mostrar el mapa mental
  };

  // 13. Enviar mensaje con cita incluida - Estilo WhatsApp
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Construir el contenido con la cita si existe
    let messageContent = inputMessage;
    let quotedMessageId: string | undefined;
    let quotedMessageContent: string | undefined;
    let quotedMessageSender: "user" | "bot" | undefined;

    if (quotedMessage) {
      quotedMessageId = quotedMessage.id;
      quotedMessageContent = quotedMessage.content;
      quotedMessageSender = quotedMessage.sender;

      // Agregar la cita al contenido
      messageContent = `> **${quotedMessage.content}**\n\n${inputMessage}`;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: "user",
      timestamp: new Date(),
      quotedMessageId,
      quotedMessageContent,
      quotedMessageSender,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setQuotedMessage(null); // Limpiar la cita después de enviar

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Gracias por tu mensaje. Esta es una respuesta simulada del chatbot.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background flex">
        {/* Sidebar Component */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
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
            conversationTitle={
              conversations.find((c) => c.id === activeConversationId)?.title ||
              "Chat Asistente"
            }
          />

          <div className="flex-1 min-h-0">
            <div className="h-[calc(100vh-12rem)] overflow-y-auto p-6">
              {messages.length === 0 ? (
                <EmptyChatState
                  conversationTitle={
                    conversations.find((c) => c.id === activeConversationId)
                      ?.title || "..."
                  }
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
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ChatBot;
