import { useCallback } from "react";
import axios from "axios";
import { API_BASE } from "../../../config.js";

/**
 * Hook para manejar los handlers de ChatInterface
 * @param {Object} params - Parámetros necesarios para los handlers
 * @returns {Object} Handlers organizados por categoría
 */
export const useChatHandlers = (params) => {
  const {
    chatState,
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
  } = params;

  // HANDLERS DE CONVERSACIONES
  const handleNewChatClick = useCallback(() => {
    handleNewChat(setMessages);
  }, [handleNewChat, setMessages]);

  const handleSelectChat = useCallback(async (chat) => {
    console.log('🟢 handleSelectChat llamado con:', chat);
    chatState.setCurrentChat(chat);
    if (chatState.isMobile) chatState.setIsSidebarOpen(false);

    const loadConversacionMessages = chatState.loadConversacionMessages;
    if (loadConversacionMessages) {
      await loadConversacionMessages(chat.conversacionId);
    }

    // Si no hay conversationId, es una nueva conversación
    if (!chat.conversacionId) {
      console.log('🟢 Nueva conversación, limpiando mensajes');
      setMessages([]);
    }
  }, [chatState, setMessages]);

  const handleDeleteChat = useCallback(async (chat) => {
    try {
      const response = await axios.delete(`${API_BASE}/api/conversaciones/${chat.conversacionId}`);
      
      if (response.data.success) {
        setChats((prev) => prev.filter((c) => c.conversacionId !== chat.conversacionId));
        
        if (currentChat.conversacionId === chat.conversacionId) {
          handleNewChatClick();
        }
        
        console.log("✅ Conversación eliminada correctamente");
      }
    } catch (error) {
      console.error("❌ Error al eliminar conversación:", error);
      alert("No se pudo eliminar la conversación. Por favor, inténtalo de nuevo.");
    }
  }, [setChats, currentChat, handleNewChatClick]);

  const handleRenameChat = useCallback(async (chat, newName) => {
    try {
      const response = await axios.put(`${API_BASE}/api/conversaciones/${chat.conversacionId}`, { nombre: newName });
      
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
      alert("No se pudo renombrar la conversación. Por favor, inténtalo de nuevo.");
    }
  }, [setChats, currentChat, chatState]);

  // HANDLERS DE MAPAS MENTALES
  const handleViewMindMap = useCallback(async (mapa) => {
    try {
      // Si el objeto ya tiene los datos completos, usarlos directamente
      if (mapa.data && mapa.name) {
        setSelectedArtifact(mapa);
        chatState.setIsMindMapModalOpen(true);
        return;
      }

      // Cargar datos desde el backend
      const mapaId = mapa.id || mapa.conversacionId;
      if (!mapaId) {
        console.error("ID de mapa mental no válido:", mapa);
        alert("No se pudo identificar el mapa mental.");
        return;
      }

      const response = await axios.get(`${API_BASE}/api/mapas-mentales/${mapaId}`);
      
      if (response.data.success) {
        const fullMindMapData = response.data.mapa;
        const artifactData = {
          id: fullMindMapData.id,
          name: fullMindMapData.titulo || "Mapa Mental sin título",
          type: "mindmap",
          icon: "fas fa-project-diagram",
          color: "purple",
          data: fullMindMapData.estructura_json?.respuesta?.datos || 
                fullMindMapData.estructura_json || 
                fullMindMapData.respuesta?.datos || {},
          createdAt: fullMindMapData.fecha_creacion,
          description: fullMindMapData.contexto || "Sin descripción disponible",
        };

        setSelectedArtifact(artifactData);
        chatState.setIsMindMapModalOpen(true);
      }
    } catch (error) {
      console.error("Error al cargar el mapa mental:", error);
      alert("No se pudo cargar el mapa mental.");
    }
  }, [setSelectedArtifact, chatState]);

  // HANDLERS DE AUTENTICACIÓN
  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch(LOGOUT, { 
        method: "POST", 
        credentials: "include" 
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
  }, [LOGOUT, navigate, setIsAuthenticated]);

  // HANDLERS DE MENSAJES
  const handleSendMessage = useCallback(async (input) => {
    console.log('🟠 handleSendMessage llamado con:', input);
    
    if (input.trim()) {
      const newConvId = await sendMessage(input);
      console.log('🟠 newConvId recibido:', newConvId);
      
      if (newConvId) {
        conversationIdRef.current = newConvId;
      }
    }
  }, [sendMessage, conversationIdRef]);

  const handleQuickActionSelect = useCallback((action) => {
    if (action.id === "mapa-mental") {
      const convId = conversationIdRef.current || currentChat.conversacionId;
      generarMapaMental([], convId); // messages se pasaría como parámetro
    } else {
      setInput(action.text);
    }
  }, [conversationIdRef, currentChat.conversacionId, generarMapaMental, setInput]);

  return {
    // Conversaciones
    handleNewChatClick,
    handleSelectChat,
    handleDeleteChat,
    handleRenameChat,
    
    // Mapas mentales
    handleViewMindMap,
    
    // Autenticación
    handleLogout,
    
    // Mensajes
    handleSendMessage,
    handleQuickActionSelect,
  };
};