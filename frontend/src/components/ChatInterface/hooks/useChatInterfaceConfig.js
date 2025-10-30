import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../App.jsx";

// Hooks personalizados
import { useChatLogic } from "../useChatLogic.js";
import { useChatState } from "../../../hooks/useChatState.js";
import { useSessionManager } from "../../../hooks/useSessionManager.js";
import { useConversationLoader } from "../../../hooks/useConversationLoader.js";
import { useBackendStatus } from "../../../hooks/useBackendStatus.js";
import { useChatHandlers } from "./useChatHandlers.js";
import { useChatEffects } from "./useChatEffects.js";

// Configuración
import { LOGOUT } from "../../../config.js";

/**
 * Hook para la configuración completa de ChatInterface
 * Extrae toda la lógica de hooks y configuración del componente
 * @returns {Object} - Configuración completa para ChatInterface
 */
export const useChatInterfaceConfig = () => {
  // CONTEXTO Y NAVEGACIÓN
  const { artifacts, addArtifact, removeArtifact, setIsAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();

  // ESTADO LOCAL
  const [messages, setMessages] = useState([]);
  const [documentsList, setDocumentsList] = useState([]);
  const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);
  const [quotedMessage, setQuotedMessage] = useState(null);

  // HOOKS DE GESTIÓN DE ESTADO
  const chatState = useChatState();
  const {
    input, user, isSidebarOpen, isArtifactsOpen, currentChat, chats, isMobile,
    isDocumentsModalOpen, selectedArtifact, isMindMapModalOpen, isDarkMode,
    setInput, setUser, setChats, setIsSidebarOpen, setIsArtifactsOpen,
    setIsDocumentsModalOpen, closeAll, handleNewChat, handleInputChange,
    handleDocumentSelect, handleOpenArtifact, handleCloseMindMapModal,
    toggleDarkMode, setSelectedArtifact,
  } = chatState;

  // HOOKS DE LÓGICA DE NEGOCIO
  const { isLoading: isLoadingSession } = useSessionManager(setUser, setMessages);
  const { loadConversacionMessages } = useConversationLoader(user, setChats, setMessages, addArtifact);
  const backendStatus = useBackendStatus();
  
  // REF PARA TRACKEAR CONVERSACIÓN ID
  const conversationIdRef = useRef(currentChat.conversacionId);
  
  // SINCRONIZAR REF CON CURRENTCHAT
  useEffect(() => {
    conversationIdRef.current = currentChat.conversacionId;
  }, [currentChat.conversacionId]);
  
  const { isTyping, sendMessage, handleFeedback, generarMapaMental } = useChatLogic(
    documentsList, navigate, addArtifact, setMessages, setInput, chatState, quotedMessage, setQuotedMessage
  );

  // HOOKS EXTRAÍDOS (UBICACIÓN ESPECÍFICA DEL COMPONENTE)
  const handlers = useChatHandlers({
    chatState: {
      ...chatState,
      loadConversacionMessages,
    },
    currentChat,
    setMessages,
    setChats,
    navigate,
    setIsAuthenticated,
    setSelectedArtifact,
    setInput,
    handleNewChat,
    sendMessage,
    generarMapaMental,
    conversationIdRef,
    LOGOUT,
  });

  // EFECTOS EXTRAÍDOS (UBICACIÓN ESPECÍFICA DEL COMPONENTE)
  useChatEffects({
    chatState,
    setDocumentsList,
    setIsHelpPanelOpen,
  });

  // VERIFICAR SI DEBE RENDERIZAR (LOADING)
  const shouldRender = !!(user && !isLoadingSession);

  // CÁLCULOS DE ESTADO
  const botStatus = isTyping 
    ? "processing" 
    : backendStatus.status === "online" 
    ? "online" 
    : backendStatus.status === "degraded" 
    ? "processing" 
    : "offline";

  // CONFIGURACIÓN COMPLETA PARA EL COMPONENTE
  return {
    shouldRender,
    user,
    isLoadingSession,
    isDarkMode,
    
    // Estado y contexto
    artifacts, addArtifact, removeArtifact,
    messages, documentsList, isHelpPanelOpen, quotedMessage,
    setIsHelpPanelOpen, setQuotedMessage,
    
    // Estado del chat
    chatState,
    input, isSidebarOpen, isArtifactsOpen, currentChat, chats, isMobile,
    isDocumentsModalOpen, selectedArtifact, isMindMapModalOpen,
    setInput, setIsSidebarOpen, setIsArtifactsOpen,
    setIsDocumentsModalOpen, closeAll, handleInputChange,
    handleDocumentSelect, handleOpenArtifact, handleCloseMindMapModal,
    toggleDarkMode,
    
    // Handlers extraídos
    handlers,
    
    // Estados calculados
    botStatus, isTyping, handleFeedback, generarMapaMental,
    
    // Props adicionales
    backendStatus,
  };
};