import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import { nanoid } from "nanoid";

// Componentes locales
import Sidebar from "./Sidebar";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import QuickActions from "./QuickActions";
import VibrantButton from "./VibrantButton";

// Componentes externos
import ArtifactsPanel from "../ArtifactsPanel";

// Hooks
import { useChatLogic } from "./useChatLogic";

// Assets
import LogoUCT from "../../assets/Logo_dir_desarrollo_personas.png";

// Datos - deberías mover estos a un archivo separado si crecen mucho
const ddperDocuments = [
  {
    id: 1,
    title: "Reglamento de Beneficios Estudiantiles",
    description:
      "Normativas y procedimientos para acceder a beneficios estudiantiles",
    type: "reglamento",
    category: "Beneficios",
    keywords: ["beneficio", "beca", "ayuda", "estudiante", "postulación"],
    url: "#",
  },
  {
    id: 2,
    title: "Formulario de Solicitud de Permiso",
    description:
      "Documento para solicitar permisos académicos y administrativos",
    type: "formulario",
    category: "Permisos",
    keywords: ["permiso", "solicitud", "académico", "formulario"],
    url: "#",
  },
  {
    id: 3,
    title: "Instructivo de Postulación a Becas",
    description: "Guía paso a paso para postular a beneficios estudiantiles",
    type: "instructivo",
    category: "Beneficios",
    keywords: ["instructivo", "beca", "postulación", "requisitos"],
    url: "#",
  },
  {
    id: 4,
    title: "Manual de Procedimientos DDPER",
    description:
      "Procedimientos administrativos de la Dirección de Desarrollo de Personas",
    type: "instructivo",
    category: "Procedimientos",
    keywords: ["manual", "procedimiento", "administrativa", "DDPER"],
    url: "#",
  },
];

const quickActions = [
  {
    id: "beneficios",
    text: "Consultar sobre beneficios estudiantiles",
    icon: "fas fa-graduation-cap",
    color: "purple",
    description: "Información sobre becas, ayudas y beneficios disponibles",
  },
  {
    id: "permisos",
    text: "Solicitar permiso académico",
    icon: "fas fa-file-signature",
    color: "blue",
    description: "Tramitar permisos, licencias y documentos académicos",
  },
  {
    id: "procedimientos",
    text: "Consultar procedimientos DDPER",
    icon: "fas fa-list-check",
    color: "emerald",
    description: "Información sobre procesos administrativos y normativas",
  },
  {
    id: "contacto",
    text: "Información de contacto y horarios",
    icon: "fas fa-phone",
    color: "orange",
    description: "Horarios de atención, teléfonos y ubicación",
  },
  {
    id: "documentos",
    text: "Buscar documentos y formularios",
    icon: "fas fa-folder-open",
    color: "teal",
    description: "Acceder a formularios, reglamentos e instructivos",
  },
  {
    id: "ayuda",
    text: "¿Cómo usar este asistente?",
    icon: "fas fa-question-circle",
    color: "pink",
    description: "Guía de uso y funcionalidades del chatbot",
  },
];

const welcomeMessage = {
  id: "welcome",
  sender: "bot",
  content: `¡Hola! Soy el asistente virtual de la Dirección de Desarrollo de Personas (DDPER) de la Universidad Católica del Temuco.

Estoy aquí para ayudarte con:
• Consultas sobre beneficios estudiantiles
• Información sobre procedimientos administrativos  
• Orientación sobre documentos y formularios
• Dudas generales sobre DDPER
• Horarios y información de contacto

¿En qué puedo ayudarte hoy?`,
  timestamp: new Date(),
  feedbackRequested: false,
};

const ChatInterface = () => {
  const { isDarkMode, toggleDarkMode, artifacts, addArtifact, removeArtifact } =
    useContext(AppContext);

  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isArtifactsOpen, setIsArtifactsOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState({
    id: "current",
    name: "Nuevo chat",
    timestamp: new Date(),
  });
  const [chats, setChats] = useState([
    {
      id: 1,
      name: "Chat sobre beneficios",
      lastMessage: "Consulta resuelta",
      timestamp: new Date(),
    },
    {
      id: 2,
      name: "Información de permisos",
      lastMessage: "Documentación enviada",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const {
    isTyping,
    sendMessage,
    handleFeedback,
    generarMapaMental,
    handleQuickAction,
  } = useChatLogic(
    ddperDocuments,
    navigate,
    addArtifact,
    setMessages,
    setInput
  );

  const handleNewChat = useCallback(() => {
    const newChat = {
      id: nanoid(),
      name: `Nueva Conversación ${chats.length + 1}`,
      lastMessage: "",
      timestamp: new Date(),
    };

    setCurrentChat(newChat);
    setMessages([welcomeMessage]);
    setInput("");
    setChats([newChat, ...chats]);

    if (isMobile) setIsSidebarOpen(false);
  }, [chats, isMobile]);

  const handleSelectChat = useCallback(
    (chat) => {
      setCurrentChat(chat);
      setMessages([welcomeMessage]);
      if (isMobile) setIsSidebarOpen(false);
    },
    [isMobile]
  );

  const closeAll = useCallback(() => {
    setIsSidebarOpen(false);
    setIsArtifactsOpen(false);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (input.trim()) {
      sendMessage(input);
    }
  }, [sendMessage, input]);

  const handleInputChange = useCallback((value) => {
    setInput(value);
  }, []);

  const handleQuickActionSelect = useCallback(
    (actionText) => {
      setInput(actionText);
      handleQuickAction(actionText);
    },
    [handleQuickAction]
  );

  const handleDocumentSelect = useCallback(
    (doc) => {
      setInput(`Información sobre: ${doc.title}`);
      if (isMobile) setIsSidebarOpen(false);
    },
    [isMobile]
  );

  const botStatus = isTyping ? "processing" : "online";

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true); // siempre abierto en desktop
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;
      try {
        setUser({
          name: "Usuario Test",
          email: "test@uct.cl",
          role: "estudiante",
        });
      } catch (err) {
        console.error("Error en checkSession:", err);
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate]);

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && closeAll();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [closeAll]);

  useEffect(() => {
    if ((isSidebarOpen || isArtifactsOpen) && isMobile) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isSidebarOpen, isArtifactsOpen, isMobile]);

  if (!user) {
    return (
      <div
        className={`h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p
            className={`text-lg ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Iniciando asistente DDPER...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-screen flex ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Overlay en móvil */}
      {(isSidebarOpen || isArtifactsOpen) && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeAll}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
    fixed top-16 left-0 
    h-[calc(100%-4rem)] 
    w-80 z-40
    transform transition-transform duration-300 ease-in-out
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
  `}
      >
        <Sidebar
          documents={ddperDocuments}
          chats={chats}
          onNewChat={handleNewChat}
          onDocumentSelect={handleDocumentSelect}
          onSelectChat={handleSelectChat}
          onLogout={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          botStatus={botStatus}
          isDarkMode={isDarkMode}
          isOpen={true}
          onClose={() => setIsSidebarOpen(false)}
          LogoUCT={LogoUCT}
        />
      </div>

      {/* Contenido principal con padding para el header */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 pt-16 ${
          !isMobile && isSidebarOpen ? "lg:pl-80" : ""
        }`}
      >
        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full p-4">
            {" "}
            {/* antes: max-w-6xl mx-auto */}
            {messages.length <= 1 && (
              <QuickActions
                quickActions={quickActions}
                onQuickAction={handleQuickActionSelect}
                isDarkMode={isDarkMode}
              />
            )}
            <ChatMessages
              messages={messages}
              isTyping={isTyping}
              onFeedback={handleFeedback}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* Input */}
        <div
          className={`border-t ${
            isDarkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="w-full">
            {" "}
            {/* antes: max-w-6xl mx-auto */}
            <ChatInput
              input={input}
              onInputChange={handleInputChange}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
              quickActions={messages.length > 1 ? [] : quickActions}
              onQuickAction={handleQuickActionSelect}
              generarMapaMental={
                messages.length > 1 ? () => generarMapaMental(messages) : null
              }
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* Header fijo en todo el ancho */}
      <header
        className={`
          fixed top-0 left-0 right-0 h-16 z-50
          px-4 border-b flex items-center justify-between
          ${
            isDarkMode
              ? "bg-gray-800/80 border-gray-700 backdrop-blur-sm"
              : "bg-white/80 border-gray-200 backdrop-blur-sm"
          }
        `}
      >
        {/* Izquierda */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Toggle sidebar"
          >
            <i
              className={`fas ${
                isSidebarOpen ? "fa-times" : "fa-bars"
              } text-lg`}
            />
          </button>
          <div className="flex items-center space-x-3">
            <div
              className={`w-2 h-2 rounded-full ${
                botStatus === "processing"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-green-500"
              }`}
            />
            <div>
              <h2
                className={`font-semibold truncate ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {currentChat?.name || "Nueva Conversación"}
              </h2>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
                {isTyping && " • El asistente está escribiendo..."}
              </p>
            </div>
          </div>
        </div>

        {/* Derecha */}
        <div className="flex items-center space-x-2">
          {generarMapaMental && messages.length > 1 && (
            <VibrantButton
              color="teal"
              label="Mapa Mental"
              icon={() => <i className="fas fa-project-diagram"></i>}
              onClick={() => generarMapaMental(messages)}
              size="small"
              disabled={isTyping}
              className="hidden sm:flex"
            />
          )}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title={isDarkMode ? "Modo claro" : "Modo oscuro"}
          >
            <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"}`} />
          </button>
          {artifacts && (
            <button
              onClick={() => setIsArtifactsOpen(!isArtifactsOpen)}
              className={`p-2 rounded-lg transition-colors relative ${
                isDarkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Artifacts"
            >
              <i
                className={`fas ${
                  isArtifactsOpen ? "fa-times" : "fa-layer-group"
                }`}
              />
              {artifacts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {artifacts.length}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Panel de Artifacts */}
      {artifacts && isArtifactsOpen && (
        <div
          className={`
            ${isMobile ? "fixed w-full" : "relative w-80"}
            top-0 right-0 h-full z-50
            transform transition-transform duration-300 ease-in-out
            ${isArtifactsOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <ArtifactsPanel
            artifacts={artifacts}
            onOpenArtifact={(artifact) =>
              console.log("Abrir artifact:", artifact)
            }
            onDeleteArtifact={removeArtifact}
            isDarkMode={isDarkMode}
            isCollapsed={!isArtifactsOpen}
            onCollapse={() => setIsArtifactsOpen(false)}
            onGenerateArtifact={(prompt) => setInput(prompt)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
