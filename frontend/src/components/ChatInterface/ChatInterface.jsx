import { useState, useContext, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import axios from "axios";

// Hooks
import { useChatLogic } from "./useChatLogic";
import { useChatState } from "../../hooks/useChatState";

// Components
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import DocumentsModal from "../DocumentsModal";
import MindMapModal from "../MindMapModal";
import ArtifactsModal from "../ArtifactsModal";
import ContextParameters from "./ContextParameters";
import LogoUCT from "../../assets/logouct.png";

import { LOGOUT, CHECK_SESSION, API_BASE } from "../../config.js";

const quickActions = [
  {
    id: "mapa-mental",
    text: "Generar mapa mental",
    icon: "fas fa-project-diagram",
    color: "teal",
    description: "Crear un mapa mental del contenido de la conversación",
  },
];

const LoadingSpinner = ({ isDarkMode }) => (
  <div
    className={`h-screen flex items-center justify-center ${
      isDarkMode ? "bg-gray-900" : "bg-gray-50"
    }`}
  >
    <div className="text-center">
      <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
      <p
        className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
      >
        Iniciando asistente DDPER...
      </p>
    </div>
  </div>
);

const ChatInterface = () => {
  const { artifacts, addArtifact, removeArtifact, setIsAuthenticated } =
    useContext(AppContext);
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  const [messages, setMessages] = useState([]);
  const [backendStatus, setBackendStatus] = useState({
    status: "unknown",
    database: { status: "unknown" },
    n8n: { status: "unknown" },
    system: { cpuUsage: "0%", memoryUsage: "0MB / 0GB" },
  });

  const chatState = useChatState();
  const {
    input,
    user,
    documents,
    isSidebarOpen,
    isArtifactsOpen,
    currentChat,
    chats,
    isMobile,
    isDocumentsModalOpen,
    isEditingTitle,
    editingTitle,
    selectedParameters,
    selectedArtifact,
    isMindMapModalOpen,
    isDarkMode,
    setInput,
    setUser,
    setDocuments,
    setChats,
    setIsSidebarOpen,
    setIsArtifactsOpen,
    setEditingTitle,
    setIsDocumentsModalOpen,
    closeAll,
    handleNewChat,
    handleInputChange,
    handleDocumentSelect,
    handleTitleEdit,
    handleTitleSave,
    handleTitleCancel,
    handleParameterChange,
    handleOpenArtifact,
    handleCloseMindMapModal,
    toggleDarkMode,
    setSelectedArtifact,
  } = chatState;

  // Función para cargar los mensajes de una conversación específica
  const loadConversacionMessages = useCallback(async (conversacionId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/conversaciones/${conversacionId}`);
      if (response.data.success) {
        const conversacion = response.data.conversacion;
        
        // El chat_history ya viene como un array de mensajes
        // Asegurarse de que el mensaje de bienvenida esté siempre al inicio
        const welcomeMessage = {
          id: "welcome",
          sender: "bot",
          content: `¡Hola **${user.name}**! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?`,
          timestamp: new Date(),
          feedbackRequested: false,
        };
        
        const formattedMessages = [welcomeMessage, ...conversacion.chat_history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error fetching conversacion messages:", error);
    }
  }, [user?.name, setMessages]);

  const {
    isTyping,
    sendMessage,
    handleFeedback,
    generarMapaMental,
    handleQuickAction,
  } = useChatLogic(documents, navigate, addArtifact, setMessages, setInput, chatState, messages);

  const handleSelectChat = useCallback(
    async (chat) => {
      chatState.setCurrentChat(chat);
      if (chatState.isMobile) chatState.setIsSidebarOpen(false);
      if (chat.conversacionId) {
        await loadConversacionMessages(chat.conversacionId);
      } else {
        // Si es un nuevo chat o no tiene ID de conversación, limpiar mensajes
        setMessages([
          {
            id: "welcome",
            sender: "bot",
            content: `¡Hola **${user.name}**! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?`,
            timestamp: new Date(),
            feedbackRequested: false,
          },
        ]);
      }
    },
    [chatState, loadConversacionMessages, setMessages, user?.name]
  );

  const handleViewMindMap = useCallback(
    async (mapa) => {
      try {
        const response = await axios.get(`${API_BASE}/api/mapas-mentales/${mapa.id}`);
        if (response.data.success) {
          const fullMindMapData = response.data.mapa;
          setSelectedArtifact({
            id: fullMindMapData.id,
            name: fullMindMapData.titulo,
            type: "mindmap",
            icon: "fas fa-project-diagram",
            color: "purple",
            data: fullMindMapData.estructura_json.respuesta.datos, // Asegúrate de que esta ruta sea correcta
            createdAt: fullMindMapData.fecha_creacion,
            description: fullMindMapData.contexto,
          });
          chatState.setIsMindMapModalOpen(true);
        }
      } catch (error) {
        console.error("Error al cargar el mapa mental:", error);
        alert("No se pudo cargar el mapa mental.");
      }
    },
    [setSelectedArtifact, chatState] // Eliminado API_BASE de las dependencias
  );

  const handleLogout = async () => {
    try {
      const response = await fetch(LOGOUT, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        localStorage.clear();
        setIsAuthenticated(false);
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      localStorage.clear();
      setIsAuthenticated(false);
      navigate("/login", { replace: true });
    }
  };

  const handleSendMessage = useCallback(() => {
    if (input.trim()) {
      sendMessage(input, selectedParameters);
    }
  }, [sendMessage, input, selectedParameters]);

  const handleQuickActionSelect = useCallback(
    (actionText) => {
      if (actionText === "Generar mapa mental" && messages.length > 1) {
        generarMapaMental(messages);
      } else {
        setInput(actionText);
        handleQuickAction(actionText);
      }
    },
    [handleQuickAction, generarMapaMental, messages, setInput]
  );

  useEffect(() => {
    const checkSession = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;
      try {
        const res = await fetch(CHECK_SESSION, { credentials: "include" });
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
              content: `¡Hola **${data.user.nombre}**! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?`,
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
  }, [navigate, setUser]);

  // Cargar historial de conversaciones al iniciar sesión
  useEffect(() => {
    if (user) {
      const fetchConversaciones = async () => {
        try {
          const response = await axios.get(`${API_BASE}/api/conversaciones`);
          if (response.data.success) {
            const conversaciones = response.data.conversaciones;
            
            // Transformar las conversaciones al formato esperado por el sidebar
            const formattedChats = conversaciones.map(conv => {
              const lastMessage = conv.chat_history && conv.chat_history.length > 0
                ? conv.chat_history[conv.chat_history.length - 1].content
                : "Sin mensajes";
              return {
                id: `conv-${conv.id}`,
                name: conv.titulo || `Conversación ${conv.id}`, // Usar el título o un ID por defecto
                lastMessage: lastMessage.substring(0, 50) + (lastMessage.length > 50 ? '...' : ''),
                timestamp: conv.fecha_creacion,
                mapasAsociados: conv.mapas_asociados || [],
                conversacionId: conv.id // Guardar el ID real de la conversación
              };
            });
            
            setChats(formattedChats);
            
            // Si hay conversaciones, seleccionar la más reciente
            if (formattedChats.length > 0) {
              const latestChat = formattedChats[0];
              handleSelectChat(latestChat);
            }
          }
        } catch (error) {
          console.error("Error fetching conversaciones:", error);
        }
      };
      
      fetchConversaciones();
    }
  }, [user, setChats, handleSelectChat, loadConversacionMessages]); // Agregado loadConversacionMessages a las dependencias


  // Efecto para el health check del backend
  useEffect(() => {
    const fetchBackendStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/status`);
        setBackendStatus(response.data);
      } catch (error) {
        console.error("Error fetching backend status:", error);
        setBackendStatus({
          status: "offline",
          database: { status: "offline", error: error.message },
          n8n: { status: "offline", error: error.message },
          system: { cpuUsage: "N/A", memoryUsage: "N/A" },
        });
      }
    };

    // Llamar inmediatamente y luego cada 30 segundos
    fetchBackendStatus();
    const intervalId = setInterval(fetchBackendStatus, 180000); // Cada 30 segundos

    return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar
  }, []); // Se ejecuta una sola vez al montar el componente

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/documentos`);
        setDocuments(response.data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, [setDocuments]);

  useEffect(() => {
    const handleResize = () => {
      chatState.setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [chatState, setIsSidebarOpen]);

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
  }, [isSidebarOpen, isArtifactsOpen, isMindMapModalOpen, isMobile]);

  if (!user) {
    return <LoadingSpinner isDarkMode={isDarkMode} />;
  }

  const botStatus = isTyping
    ? "processing"
    : backendStatus.status === "online"
    ? "online"
    : backendStatus.status === "degraded"
    ? "processing" // Usamos "processing" para "degraded" en la UI
    : "offline";

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
        className={`fixed top-0 left-0 h-full w-80 z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          documents={documents}
          chats={chats}
          onNewChat={handleNewChat}
          onDocumentSelect={handleDocumentSelect}
          onSelectChat={handleSelectChat}
          onLogout={handleLogout}
          botStatus={botStatus}
          isDarkMode={isDarkMode}
          isOpen={true}
          backendStatus={backendStatus} // Pasar el estado detallado del backend
          onClose={() => setIsSidebarOpen(false)}
          onModalOpen={() => setIsDocumentsModalOpen(true)}
          onArtifactsModalOpen={() => setIsArtifactsOpen(true)}
          LogoUCT={LogoUCT}
          toggleDarkMode={toggleDarkMode}
          onViewMapas={handleViewMindMap}
        />
      </div>

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          !isMobile && isSidebarOpen ? "lg:ml-80" : ""
        }`}
      >
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          botStatus={botStatus}
          isEditingTitle={isEditingTitle}
          editingTitle={editingTitle}
          setEditingTitle={setEditingTitle}
          handleTitleSave={handleTitleSave}
          handleTitleCancel={handleTitleCancel}
          currentChat={currentChat}
          handleTitleEdit={handleTitleEdit}
          isDarkMode={isDarkMode}
          artifacts={artifacts}
          isArtifactsOpen={isArtifactsOpen}
          setIsArtifactsOpen={setIsArtifactsOpen}
          messages={messages}
          generarMapaMental={generarMapaMental}
          isTyping={isTyping}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="w-full p-4">
            <ChatMessages
              messages={messages}
              isTyping={isTyping}
              onFeedback={handleFeedback}
              isDarkMode={isDarkMode}
              onViewMindMap={handleViewMindMap} // Pasar la nueva función
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
            shouldShow={messages.some(msg => msg.sender === "user")} // Mostrar solo si hay mensajes del usuario
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

      {isArtifactsOpen && (
        <ArtifactsModal
          isOpen={isArtifactsOpen}
          onClose={() => setIsArtifactsOpen(false)}
          artifacts={artifacts}
          onOpenArtifact={handleOpenArtifact}
          onDeleteArtifact={removeArtifact}
          isDarkMode={isDarkMode}
          onGenerateArtifact={(prompt) => setInput(prompt)}
        />
      )}

      {isDocumentsModalOpen && (
        <DocumentsModal
          isOpen={isDocumentsModalOpen}
          onClose={() => setIsDocumentsModalOpen(false)}
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

