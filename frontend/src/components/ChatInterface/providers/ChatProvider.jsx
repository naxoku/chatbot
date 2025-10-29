import React, { useState, useMemo, useCallback, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { ChatContext } from "./ChatContext";
import { useMessageHandler } from "../hooks/useMessageHandler";
import { useChatActions } from "../hooks/useChatActions";
import { useArtifactManager } from "../hooks/useArtifactManager";
import { useChatState } from "../../../hooks/useChatState";
import axios from "axios";
import { API_BASE } from "../../../config";
import LogoUCT from "../../../assets/logouct.png";

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  // Estado principal del chat
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [documentsList, setDocumentsList] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Hook para manejar el estado UI (sidebar, modales, etc.)
  const chatState = useChatState();
  
  // Hooks especializados
  const messageHandler = useMessageHandler();
  const chatActions = useChatActions();
  const artifactManager = useArtifactManager();

  // Cargar lista de documentos al montar el componente
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
  }, []);

  // Crear nueva conversación con mensaje de bienvenida
  const handleNewChat = useCallback(() => {
    chatActions.createNewChatWithWelcome();
  }, [chatActions]);

  // Enviar mensaje
  const sendMessage = useCallback(async (input, selectedParameters) => {
    const messageId = await messageHandler.send(input, {
      parametros: selectedParameters,
      documentos: documentsList,
      conversacionId: currentChat?.conversacionId,
      quotedMessage: chatState.quotedMessage
    });

    // Si se creó una nueva conversación, actualizar el estado
    if (messageId && !currentChat?.conversacionId) {
      const newChatEntry = {
        id: `conv-${messageId}`,
        name: input.substring(0, 50) + (input.length > 50 ? "..." : ""),
        timestamp: new Date(),
        mapasAsociados: [],
        conversacionId: messageId,
      };
      setCurrentChat(newChatEntry);
      setChats(prev => [newChatEntry, ...prev]);
    }

    return messageId;
  }, [messageHandler, documentsList, currentChat, chatState.quotedMessage, setCurrentChat, setChats]);

  // Generar mapa mental
  const generarMapaMental = useCallback((messages, conversacionId) => {
    artifactManager.generarMapaMental(messages, conversacionId);
  }, [artifactManager]);

  // Ver mapa mental
  const handleViewMindMap = useCallback((mapa) => {
    artifactManager.handleViewMindMap(mapa);
  }, [artifactManager]);

  // Actualizar estado del chat en el contexto
  const value = useMemo(() => ({
    // Estado principal
    messages,
    chats,
    currentChat,
    documentsList,
    isLoadingMessages,
    user,
    
    // Setters
    setMessages,
    setChats,
    setCurrentChat,
    
    // Acciones principales
    sendMessage,
    handleNewChat,
    handleSelectChat: (chat) => chatActions.handleSelectChat(chat, setIsLoadingMessages),
    handleDeleteChat: async (chat) => {
      const success = await chatActions.delete(chat);
      if (success) {
        // Si la conversación eliminada es la actual, crear una nueva
        if (currentChat?.conversacionId === chat.conversacionId) {
          handleNewChat();
        }
      }
      return success;
    },
    handleRenameChat: async (chat, newName) => {
      const success = await chatActions.rename(chat, newName);
      if (success) {
        // Actualizar el chat actual si es el mismo
        if (currentChat?.conversacionId === chat.conversacionId) {
          setCurrentChat(prev => ({ ...prev, name: newName }));
        }
      }
      return success;
    },
    handleViewMindMap,
    generarMapaMental,
    
    // Estado UI
    ...chatState,
    
    // Props adicionales necesarias por otros componentes
    LogoUCT,
  }), [
    messages, chats, currentChat, documentsList, isLoadingMessages, user, setMessages, setChats,setCurrentChat, sendMessage, handleNewChat, chatActions, chatState, generarMapaMental, handleViewMindMap
  ]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};