import { useState, useContext, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import axios from "axios";

// ============================================================================
// HOOKS PERSONALIZADOS
// ============================================================================
import { useChatLogic } from "./useChatLogic";
import { useChatState } from "../../hooks/useChatState";
import { useSessionManager } from "../../hooks/useSessionManager";
import { useConversationLoader } from "../../hooks/useConversationLoader";
import { useBackendStatus } from "../../hooks/useBackendStatus";

// ============================================================================
// COMPONENTES
// ============================================================================
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import DocumentsModal from "../DocumentsModal";
import MindMapModal from "../MindMapModal";
import ArtifactsModal from "../ArtifactsModal";
import ContextParameters from "./ContextParameters";
import HelpPanel from "../HelpPanel";
import LoadingIndicator from "../LoadingIndicator";
import LogoUCT from "../../assets/logouct.png";

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
import { LOGOUT, API_BASE } from "../../config.js";

// Acciones rápidas disponibles para el usuario
const quickActions = [
  {
    id: "mapa-mental",
    text: "Generar mapa mental",
    icon: "fas fa-project-diagram",
    color: "teal",
    description: "Crear un mapa mental del contenido de la conversación",
  },
];

// ============================================================================
// COMPONENTE DE CARGA
// ============================================================================
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

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const ChatInterface = () => {
  // --------------------------------------------------------------------------
  // CONTEXTO GLOBAL
  // --------------------------------------------------------------------------
  const { artifacts, addArtifact, removeArtifact, setIsAuthenticated } =
    useContext(AppContext);
  const navigate = useNavigate();

  // --------------------------------------------------------------------------
  // ESTADO LOCAL
  // --------------------------------------------------------------------------
  const [messages, setMessages] = useState([]);
  const [documentsList, setDocumentsList] = useState([]);
  const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);
  const conversationIdRef = useRef(null);

  // --------------------------------------------------------------------------
  // HOOKS PERSONALIZADOS - GESTIÓN DE ESTADO
  // --------------------------------------------------------------------------
  const chatState = useChatState();
  const {
    input,
    user,
    isSidebarOpen,
    isArtifactsOpen,
    currentChat,
    chats,
    isMobile,
    isDocumentsModalOpen,
    selectedParameters,
    selectedArtifact,
    isMindMapModalOpen,
    isDarkMode,
    setInput,
    setUser,
    setChats,
    setIsSidebarOpen,
    setIsArtifactsOpen,
    setIsDocumentsModalOpen,
    closeAll,
    handleNewChat,
    handleInputChange,
    handleDocumentSelect,
    handleParameterChange,
    handleOpenArtifact,
    handleCloseMindMapModal,
    toggleDarkMode,
    setSelectedArtifact,
  } = chatState;

  // --------------------------------------------------------------------------
  // HOOKS PERSONALIZADOS - LÓGICA DE NEGOCIO
  // --------------------------------------------------------------------------

  // Gestión de sesión y autenticación
  const { isLoading: isLoadingSession } = useSessionManager(
    setUser,
    setMessages
  );

  // Carga de conversaciones desde el backend
  const { loadConversacionMessages } = useConversationLoader(
    user,
    setChats,
    setMessages,
    addArtifact // Pasar addArtifact
  );

  // Monitoreo del estado del backend
  const backendStatus = useBackendStatus();

  // Lógica principal del chat (envío de mensajes, feedback, mapas mentales)
  const {
    isTyping,
    sendMessage,
    handleFeedback,
    generarMapaMental,
    handleQuickAction,
  } = useChatLogic(
    documentsList,
    navigate,
    addArtifact,
    setMessages,
    setInput,
    chatState
  );

  // --------------------------------------------------------------------------
  // HANDLERS - GESTIÓN DE CONVERSACIONES
  // --------------------------------------------------------------------------

  /**
   * Maneja la creación de una nueva conversación
   * Limpia los mensajes y resetea el estado
   */
  const handleNewChatClick = useCallback(() => {
    handleNewChat(setMessages);
    if (user) {
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
  }, [handleNewChat, setMessages, user]);

  /**
   * Maneja la selección de una conversación desde el sidebar
   * Carga los mensajes de la conversación seleccionada o limpia el chat para uno nuevo
   */
  const handleSelectChat = useCallback(
    async (chat) => {
      chatState.setCurrentChat(chat);
      if (chatState.isMobile) chatState.setIsSidebarOpen(false);

      if (chat.conversacionId) {
        // Conversación existente: cargar mensajes desde el backend
        await loadConversacionMessages(chat.conversacionId);
      } else {
        // Nueva conversación: mostrar solo mensaje de bienvenida
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

  /**
   * Maneja la eliminación de una conversación
   * Elimina del backend y actualiza el estado local
   */
  const handleDeleteChat = useCallback(
    async (chat) => {
      try {
        const response = await axios.delete(
          `${API_BASE}/api/conversaciones/${chat.conversacionId}`
        );

        if (response.data.success) {
          // Actualizar lista de conversaciones
          setChats((prev) =>
            prev.filter((c) => c.conversacionId !== chat.conversacionId)
          );

          // Si la conversación eliminada es la actual, crear una nueva
          if (currentChat.conversacionId === chat.conversacionId) {
            handleNewChatClick();
          }

          console.log("✅ Conversación eliminada correctamente");
        }
      } catch (error) {
        console.error("❌ Error al eliminar conversación:", error);
        alert(
          "No se pudo eliminar la conversación. Por favor, inténtalo de nuevo."
        );
      }
    },
    [setChats, currentChat, handleNewChatClick]
  );

  /**
   * Maneja la visualización de un mapa mental
   * Carga los datos completos del mapa desde el backend y abre el modal
   */
  const handleViewMindMap = useCallback(
    async (mapa) => {
      try {
        // Si el objeto ya tiene los datos completos (desde el chat), usarlos directamente
        if (mapa.data && mapa.name) {
          setSelectedArtifact(mapa);
          chatState.setIsMindMapModalOpen(true);
          return;
        }

        // Si no, cargar los datos desde el backend (desde el sidebar)
        const mapaId = mapa.id || mapa.conversacionId;
        if (!mapaId) {
          console.error("ID de mapa mental no válido:", mapa);
          alert("No se pudo identificar el mapa mental.");
          return;
        }

        const response = await axios.get(
          `${API_BASE}/api/mapas-mentales/${mapaId}`
        );

        if (response.data.success) {
          const fullMindMapData = response.data.mapa;

          const artifactData = {
            id: fullMindMapData.id,
            name: fullMindMapData.titulo || "Mapa Mental sin título",
            type: "mindmap",
            icon: "fas fa-project-diagram",
            color: "purple",
            data:
              fullMindMapData.estructura_json?.respuesta?.datos ||
              fullMindMapData.estructura_json ||
              fullMindMapData.respuesta?.datos ||
              {},
            createdAt: fullMindMapData.fecha_creacion,
            description:
              fullMindMapData.contexto || "Sin descripción disponible",
          };

          setSelectedArtifact(artifactData);
          chatState.setIsMindMapModalOpen(true);
        }
      } catch (error) {
        console.error("Error al cargar el mapa mental:", error);
        alert("No se pudo cargar el mapa mental.");
      }
    },
    [setSelectedArtifact, chatState]
  );

  const handleRenameChat = useCallback(
    async (chat, newName) => {
      try {
        const response = await axios.put(
          `${API_BASE}/api/conversaciones/${chat.conversacionId}`,
          {
            nombre: newName,
          }
        );

        if (response.data.success) {
          setChats((prev) =>
            prev.map((c) =>
              c.conversacionId === chat.conversacionId
                ? { ...c, name: newName }
                : c
            )
          );
          if (currentChat.conversacionId === chat.conversacionId) {
            chatState.setCurrentChat((prev) => ({ ...prev, name: newName }));
          }
          console.log("✅ Conversación renombrada correctamente");
        }
      } catch (error) {
        console.error("❌ Error al renombrar conversación:", error);
        alert(
          "No se pudo renombrar la conversación. Por favor, inténtalo de nuevo."
        );
      }
    },
    [setChats, currentChat, chatState]
  );

  // --------------------------------------------------------------------------
  // HANDLERS - AUTENTICACIÓN
  // --------------------------------------------------------------------------

  /**
   * Maneja el cierre de sesión del usuario
   * Limpia el localStorage y redirige al login
   */
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

  // --------------------------------------------------------------------------
  // HANDLERS - MENSAJES Y ACCIONES
  // --------------------------------------------------------------------------

  /**
   * Maneja el envío de un mensaje desde el input
   * Valida que el mensaje no esté vacío antes de enviarlo
   */
  const handleSendMessage = useCallback(async () => {
    if (input.trim()) {
      const newConvId = await sendMessage(input, selectedParameters);
      if (newConvId) {
        conversationIdRef.current = newConvId;
      }
    }
  }, [sendMessage, input, selectedParameters]);

  /**
   * Maneja la selección de una acción rápida
   * Si es "Generar mapa mental", ejecuta la función correspondiente
   * Si no, establece el texto en el input
   */
  const handleQuickActionSelect = useCallback(
    (actionText) => {
      if (actionText === "Generar mapa mental" && messages.length > 1) {
        const convId = conversationIdRef.current || currentChat.conversacionId;
        generarMapaMental(messages, convId);
      } else {
        setInput(actionText);
        handleQuickAction(actionText);
      }
    },
    [handleQuickAction, generarMapaMental, messages, setInput, currentChat]
  );

  // --------------------------------------------------------------------------
  // EFECTOS - CARGA DE DATOS
  // --------------------------------------------------------------------------

  /**
   * Efecto para cargar la lista de documentos disponibles
   * Se ejecuta una sola vez al montar el componente
   */
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/documentos`);
        setDocumentsList(response.data);
      } catch (error) {
        console.error("Error al cargar documentos:", error);
      }
    };
    fetchDocuments();
  }, [setDocumentsList]);

  // --------------------------------------------------------------------------
  // EFECTOS - RESPONSIVE Y UI
  // --------------------------------------------------------------------------

  /**
   * Efecto para manejar el comportamiento responsive
   * Ajusta el sidebar según el tamaño de la ventana
   */
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

  /**
   * Efecto para manejar el cierre de modales con la tecla Escape
   * Añadido soporte para Ctrl+K para abrir panel de ayuda
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeAll();
        setIsHelpPanelOpen(false);
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "k" &&
        !e.target.matches("textarea, input")
      ) {
        e.preventDefault();
        setIsHelpPanelOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeAll]);

  /**
   * Efecto para prevenir el scroll del body cuando hay modales abiertos en móvil
   */
  useEffect(() => {
    if (
      (isSidebarOpen ||
        isArtifactsOpen ||
        isMindMapModalOpen ||
        isHelpPanelOpen) &&
      isMobile
    ) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [
    isSidebarOpen,
    isArtifactsOpen,
    isMindMapModalOpen,
    isHelpPanelOpen,
    isMobile,
  ]);

  // --------------------------------------------------------------------------
  // RENDERIZADO CONDICIONAL - LOADING
  // --------------------------------------------------------------------------

  if (!user || isLoadingSession) {
    return <LoadingSpinner isDarkMode={isDarkMode} />;
  }

  // --------------------------------------------------------------------------
  // CÁLCULO DEL ESTADO DEL BOT
  // --------------------------------------------------------------------------

  const botStatus = isTyping
    ? "processing"
    : backendStatus.status === "online"
    ? "online"
    : backendStatus.status === "degraded"
    ? "processing"
    : "offline";

  // --------------------------------------------------------------------------
  // RENDERIZADO PRINCIPAL
  // --------------------------------------------------------------------------

  return (
    <div
      className={`h-screen flex ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Overlay para cerrar modales en móvil */}
      {(isSidebarOpen ||
        isArtifactsOpen ||
        isDocumentsModalOpen ||
        isMindMapModalOpen ||
        isHelpPanelOpen) &&
        isMobile && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeAll}
          />
        )}

      {/* Sidebar - Historial de conversaciones y documentos */}
      <div
        className={`fixed top-0 left-0 h-full w-80 z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          documents={documentsList}
          chats={chats}
          onNewChat={handleNewChatClick}
          onDocumentSelect={handleDocumentSelect}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          onLogout={handleLogout}
          botStatus={botStatus}
          isDarkMode={isDarkMode}
          isOpen={true}
          backendStatus={backendStatus}
          onClose={() => setIsSidebarOpen(false)}
          onModalOpen={() => setIsDocumentsModalOpen(true)}
          onArtifactsModalOpen={() => setIsArtifactsOpen(true)}
          LogoUCT={LogoUCT}
          toggleDarkMode={toggleDarkMode}
          onViewMapas={handleViewMindMap}
        />
      </div>

      {/* Área principal del chat */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          !isMobile && isSidebarOpen ? "lg:ml-80" : ""
        }`}
      >
        {/* Header - Título y controles */}
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          botStatus={botStatus}
          currentChat={currentChat}
          isDarkMode={isDarkMode}
          artifacts={artifacts}
          isArtifactsOpen={isArtifactsOpen}
          setIsArtifactsOpen={setIsArtifactsOpen}
          messages={messages}
          generarMapaMental={() => {
            const convId =
              conversationIdRef.current || currentChat.conversacionId;
            generarMapaMental(messages, convId);
          }}
          isTyping={isTyping}
          onOpenHelp={() => setIsHelpPanelOpen(true)}
        />

        {/* Área de mensajes - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full p-4">
            {isTyping && (
              <div className="mb-4">
                <LoadingIndicator
                  message="El asistente está pensando..."
                  type="processing"
                  isDarkMode={isDarkMode}
                />
              </div>
            )}
            <ChatMessages
              messages={messages}
              isTyping={isTyping}
              onFeedback={handleFeedback}
              isDarkMode={isDarkMode}
              onViewMindMap={handleViewMindMap}
            />
          </div>
        </div>

        {/* Área de input - Parámetros de contexto y campo de texto */}
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
              messages.length > 1
                ? () => {
                    const convId =
                      conversationIdRef.current || currentChat.conversacionId;
                    generarMapaMental(messages, convId);
                  }
                : null
            }
            isTyping={isTyping}
            shouldShow={messages.some((msg) => msg.sender === "user")}
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

      {/* Modales */}
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

      {isMindMapModalOpen && (
        <MindMapModal
          isOpen={isMindMapModalOpen}
          onClose={handleCloseMindMapModal}
          artifact={selectedArtifact}
          isDarkMode={isDarkMode}
        />
      )}

      {isHelpPanelOpen && (
        <HelpPanel
          isDarkMode={isDarkMode}
          onClose={() => setIsHelpPanelOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatInterface;
