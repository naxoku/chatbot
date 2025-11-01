import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { BotMessage } from "@/components/messages/BotMessage";
import { UserMessage } from "@/components/messages/UserMessage";
import { Sidebar } from "@/components/sidebar";
import { DocumentsModal } from "@/components/DocumentsModal";
import { Bot, Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isBotOnline] = useState(true); // Estado del bot (solo lectura)
  const [activeConversationId, setActiveConversationId] = useState<string>("1");
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
      lastMessage: "Conversación iniciada",
      timestamp: new Date(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConvId);
    setMessages([
      {
        id: "1",
        content: "¡Nueva conversación iniciada! ¿En qué puedo ayudarte?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
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
    setMessages([
      {
        id: "1",
        content: `Has seleccionado la conversación ${id}. Aquí se cargarían los mensajes guardados.`,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
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

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

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
    <ThemeProvider defaultTheme="system" storageKey="chatbot-theme">
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header del chat */}
          <div className="p-6 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold truncate">
                  {conversations.find((c) => c.id === activeConversationId)
                    ?.title || "Chat Asistente"}
                </h2>
                <p className="text-sm text-muted-foreground truncate">
                  {isBotOnline
                    ? "Conectado y listo para ayudar"
                    : "Desconectado"}
                </p>
              </div>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) =>
                message.sender === "bot" ? (
                  <BotMessage key={message.id} message={message} />
                ) : (
                  <UserMessage key={message.id} message={message} />
                )
              )}
            </div>
          </div>

          {/* Input */}
          <div className="p-6 border-t border-border bg-card shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyUp={handleKeyPress}
                    placeholder="Escribe tu mensaje aquí..."
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    disabled={!isBotOnline}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || !isBotOnline}
                  className="px-6 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {!isBotOnline && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  El bot está desconectado. No se pueden enviar mensajes.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ChatBot;
