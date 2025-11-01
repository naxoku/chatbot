import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { BotMessage } from "@/components/messages/BotMessage";
import { UserMessage } from "@/components/messages/UserMessage";
import { Bot, Send, Menu, X, Plus, Power, LogOut } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isBotOnline, setIsBotOnline] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleBotStatus = () => {
    setIsBotOnline((prev) => !prev);
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

    // Simular respuesta del bot
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

  const handleNewConversation = () => {
    setMessages([
      {
        id: "1",
        content: "¡Nueva conversación iniciada! ¿En qué puedo ayudarte?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="chatbot-theme">
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <div
          className={`bg-background border-r border-border flex flex-col h-screen transition-all duration-300 ${
            isSidebarCollapsed ? "w-0 overflow-hidden" : "w-80"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Asistente UCT</h2>
                  <p className="text-xs text-muted-foreground">
                    {isBotOnline ? "Conectado" : "Desconectado"}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 flex flex-col justify-between p-3">
              <div>
                {/* Nueva conversación */}
                <Button
                  variant="secondary"
                  className="w-full justify-start mb-4"
                  onClick={handleNewConversation}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva conversación
                </Button>

                {/* Historial de conversaciones */}
                <div className="space-y-1">
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">
                    Historial
                  </h3>
                  <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
                    Ejemplo de chat anterior
                  </div>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="border-t border-border pt-3 space-y-2">
                <Button
                  variant={isBotOnline ? "outline" : "default"}
                  className="w-full justify-start"
                  onClick={toggleBotStatus}
                >
                  <Power className="mr-2 h-4 w-4" />
                  {isBotOnline ? "Desconectar bot" : "Conectar bot"}
                </Button>

                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header del chat */}
          <div className="p-6 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 shrink-0 rounded-md p-0"
              >
                {isSidebarCollapsed ? (
                  <Menu className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Chat Asistente</h2>
                <p className="text-sm text-muted-foreground">
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
          <div className="p-6 border-t border-border bg-card">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje aquí..."
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    disabled={!isBotOnline}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || !isBotOnline}
                  className="px-6"
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
