import { useState, useContext, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import { nanoid } from "nanoid";
import ContextParameters from "./ContextParameters";
import MindMapModal from "../MindMapModal";

import LogoUCT from "../../assets/logouct.png";

// Componentes locales
import Sidebar from "./Sidebar";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import QuickActions from "./QuickActions";
import VibrantButton from "./VibrantButton";
import DocumentsModal from "../DocumentsModal";

// Componentes externos
import ArtifactsPanel from "../ArtifactsPanel";

// Hooks
import { useChatLogic } from "./useChatLogic";

import { LOGOUT, CHECK_SESSION } from "../../config.js";
// Assets
//const LogoUCT = "/placeholder.svg?height=40&width=120";

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
    id: "mapa-mental",
    text: "Generar mapa mental",
    icon: "fas fa-project-diagram",
    color: "teal",
    description: "Crear un mapa mental del contenido de la conversación",
  },
];

const ChatInterface = () => {
  const {
    isDarkMode,
    toggleDarkMode,
    artifacts,
    addArtifact,
    removeArtifact,
    setIsAuthenticated,
  } = useContext(AppContext);

  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  const [messages, setMessages] = useState([]);
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
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [selectedParameters, setSelectedParameters] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [isMindMapModalOpen, setIsMindMapModalOpen] = useState(false);

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

  // Función para manejar el logout
  const handleLogout = async () => {
    try {
      const response = await fetch(LOGOUT, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        // Limpiar localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("userEmail");

        // Actualizar estado de autenticación
        setIsAuthenticated(false);

        // Redirigir al login
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Forzar logout en frontend de todos modos
      setIsAuthenticated(false);
      localStorage.removeItem("token");
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("userEmail");
      navigate("/login", { replace: true });
    }
  };

  const handleNewChat = useCallback(() => {
    const newChat = {
      id: nanoid(),
      name: `Nueva Conversación ${chats.length + 1}`,
      lastMessage: "",
      timestamp: new Date(),
    };

    setCurrentChat(newChat);
    // Nota: welcomeMessage ya no está definido aquí, usa el mensaje actual del estado
    setInput("");
    setChats([newChat, ...chats]);

    if (isMobile) setIsSidebarOpen(false);
  }, [chats, isMobile]);

  const handleSelectChat = useCallback(
    (chat) => {
      setCurrentChat(chat);
      // Mantener mensajes actuales o resetear según tu lógica
      if (isMobile) setIsSidebarOpen(false);
    },
    [isMobile]
  );

  const closeAll = useCallback(() => {
    setIsSidebarOpen(false);
    setIsArtifactsOpen(false);
    setIsMindMapModalOpen(false);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (input.trim()) {
      sendMessage(input, selectedParameters);
    }
  }, [sendMessage, input, selectedParameters]);

  const handleInputChange = useCallback((value) => {
    setInput(value);
  }, []);

  const handleQuickActionSelect = useCallback(
    (actionText) => {
      if (actionText === "Generar mapa mental" && messages.length > 1) {
        generarMapaMental(messages);
      } else {
        setInput(actionText);
        handleQuickAction(actionText);
      }
    },
    [handleQuickAction, generarMapaMental, messages]
  );

  const handleDocumentSelect = useCallback(
    (doc) => {
      setInput(`Información sobre: ${doc.title}`);
      if (isMobile) setIsSidebarOpen(false);
    },
    [isMobile]
  );

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setEditingTitle(currentChat?.name || "Nueva Conversación");
  };

  const handleTitleSave = () => {
    if (editingTitle.trim()) {
      setCurrentChat((prev) => ({ ...prev, name: editingTitle.trim() }));
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChat.id
            ? { ...chat, name: editingTitle.trim() }
            : chat
        )
      );
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setEditingTitle("");
  };

  const handleParameterChange = useCallback((newParameters) => {
    setSelectedParameters(newParameters);
  }, []);

  const handleOpenArtifact = useCallback((artifact) => {
    if (artifact.type === "mindmap") {
      setSelectedArtifact(artifact);
      setIsMindMapModalOpen(true);
      setIsArtifactsOpen(false);
    }
  }, []);

  const handleCloseMindMapModal = useCallback(() => {
    setIsMindMapModalOpen(false);
    setSelectedArtifact(null);
  }, []);

  const botStatus = isTyping ? "processing" : "online";

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
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
        const res = await fetch(CHECK_SESSION, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.logged_in) {
          setUser({
            name: data.user.nombre,
            email: data.user.email,
            role: data.user.rol,
          });

          setMessages([
            {
              id: "welcome",
              sender: "bot",
              content: `¡Hola **${data.user.nombre}**! Soy el asistente virtual de la Dirección de Desarrollo de Personas (DDPER) de la Universidad Católica del Temuco.

**Estoy aquí para ayudarte con:**

- Consultas sobre beneficios estudiantiles  
- Información sobre procedimientos administrativos  
- Orientación sobre documentos y formularios  
- Dudas generales sobre DDPER  
- Horarios y datos de contacto  

¿En qué puedo ayudarte hoy?`,
              timestamp: new Date(),
              feedbackRequested: false,
            },
          ]);
        } else {
          navigate("/login");
        }
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
    if ((isSidebarOpen || isArtifactsOpen || isMindMapModalOpen) && isMobile) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isSidebarOpen, isArtifactsOpen, isMindMapModalOpen, isMobile]);

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
      {(isSidebarOpen ||
        isArtifactsOpen ||
        isDocumentsModalOpen ||
        isMindMapModalOpen) &&
        isMobile && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeAll}
          />
        )}

      <div
        className={`
          fixed top-0 left-0 
          h-full w-80 z-40
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
          onLogout={handleLogout}
          botStatus={botStatus}
          isDarkMode={isDarkMode}
          isOpen={true}
          onClose={() => setIsSidebarOpen(false)}
          onModalOpen={() => setIsDocumentsModalOpen(true)}
          LogoUCT={LogoUCT}
        />
      </div>

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          !isMobile && isSidebarOpen ? "lg:ml-80" : ""
        }`}
      >
        <header
          className={`
            h-16 z-30 px-4 border-b flex items-center justify-between
            ${
              isDarkMode
                ? "bg-gray-800/95 border-gray-700 backdrop-blur-sm"
                : "bg-white/95 border-gray-200 backdrop-blur-sm"
            }
          `}
        >
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
                {isEditingTitle ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleTitleSave();
                        if (e.key === "Escape") handleTitleCancel();
                      }}
                      onBlur={handleTitleSave}
                      className={`px-2 py-1 rounded text-sm font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                      autoFocus
                    />
                  </div>
                ) : (
                  <h2
                    className={`font-semibold truncate cursor-pointer hover:text-blue-500 transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                    onClick={handleTitleEdit}
                    title="Click para editar título"
                  >
                    {currentChat?.name || "Nueva Conversación"}
                  </h2>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {messages.length > 1 && (
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

        <div className="flex-1 overflow-y-auto">
          <div className="w-full p-4">
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

        <div
          className={`border-t ${
            isDarkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <ContextParameters
            onParameterChange={handleParameterChange}
            isDarkMode={isDarkMode}
            selectedParameters={selectedParameters}
            generarMapaMental={
              messages.length > 1 ? () => generarMapaMental(messages) : null
            }
            isTyping={isTyping}
          />
          <div className="w-full">
            <ChatInput
              input={input}
              onInputChange={handleInputChange}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
              quickActions={messages.length > 1 ? [] : quickActions}
              onQuickAction={handleQuickActionSelect}
              isDarkMode={isDarkMode}
              selectedParameters={selectedParameters}
              onParameterChange={handleParameterChange}
            />
          </div>
        </div>
      </div>

      {artifacts && (
        <div
          className={`
            fixed top-0 right-0 
            h-full w-80 z-40
            transform transition-transform duration-300 ease-in-out
            ${isArtifactsOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <ArtifactsPanel
            artifacts={artifacts}
            onOpenArtifact={handleOpenArtifact}
            onDeleteArtifact={removeArtifact}
            isDarkMode={isDarkMode}
            isCollapsed={!isArtifactsOpen}
            onCollapse={() => setIsArtifactsOpen(false)}
            onGenerateArtifact={(prompt) => setInput(prompt)}
          />
        </div>
      )}

      {isDocumentsModalOpen && (
        <DocumentsModal
          isOpen={isDocumentsModalOpen}
          onClose={() => setIsDocumentsModalOpen(false)}
          documents={ddperDocuments}
          onDocumentSelect={handleDocumentSelect}
          isDarkMode={isDarkMode}
        />
      )}

      <MindMapModal
        isOpen={isMindMapModalOpen}
        onClose={handleCloseMindMapModal}
        artifact={selectedArtifact}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default ChatInterface;
