import React, { useState, useMemo, useCallback } from "react";
import { ChatDataContext } from "./ChatDataContext";
import { useMessageHandler } from "../hooks/useMessageHandler";
import { useChatActions } from "../hooks/useChatActions";
import { useArtifactManager } from "../hooks/useArtifactManager";

export const ChatDataProvider = ({ children }) => {
  // Estado específico para datos del chat
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [quotedMessage, setQuotedMessage] = useState(null);

  // Hooks especializados para acciones del chat
  const messageHandler = useMessageHandler();
  const chatActions = useChatActions();
  const artifactManager = useArtifactManager();

  // Crear nueva conversación con mensaje de bienvenida
  const handleNewChat = useCallback(() => {
    chatActions.createNewChatWithWelcome();
  }, [chatActions]);

  // Enviar mensaje
  const sendMessage = useCallback(async (input, selectedParameters) => {
    const messageId = await messageHandler.send(input, {
      parametros: selectedParameters,
      conversacionId: currentChat?.conversacionId,
      quotedMessage
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
  }, [messageHandler, currentChat, quotedMessage, setCurrentChat, setChats]);

  // Seleccionar chat
  const handleSelectChat = useCallback((chat) => {
    chatActions.handleSelectChat(chat, setIsLoadingMessages);
  }, [chatActions]);

  // Eliminar chat
  const handleDeleteChat = useCallback(async (chat) => {
    const success = await chatActions.delete(chat);
    if (success) {
      // Si la conversación eliminada es la actual, crear una nueva
      if (currentChat?.conversacionId === chat.conversacionId) {
        handleNewChat();
      }
    }
    return success;
  }, [chatActions, currentChat, handleNewChat]);

  // Renombrar chat
  const handleRenameChat = useCallback(async (chat, newName) => {
    const success = await chatActions.rename(chat, newName);
    if (success) {
      // Actualizar el chat actual si es el mismo
      if (currentChat?.conversacionId === chat.conversacionId) {
        setCurrentChat(prev => ({ ...prev, name: newName }));
      }
    }
    return success;
  }, [chatActions, currentChat, setCurrentChat]);

  // Ver mapa mental
  const handleViewMindMap = useCallback((mapa) => {
    artifactManager.handleViewMindMap(mapa);
  }, [artifactManager]);

  // Generar mapa mental
  const generarMapaMental = useCallback((messages, conversacionId) => {
    artifactManager.generarMapaMental(messages, conversacionId);
  }, [artifactManager]);

  // Manejar feedback
  const handleFeedback = useCallback(async (messageId, isHelpful, comment = "") => {
    await messageHandler.handleFeedback(messageId, isHelpful, comment);
  }, [messageHandler]);

  const value = useMemo(() => ({
    // Estado
    messages,
    chats,
    currentChat,
    isLoadingMessages,
    quotedMessage,
    
    // Setters
    setMessages,
    setChats,
    setCurrentChat,
    setIsLoadingMessages,
    setQuotedMessage,
    
    // Acciones
    sendMessage,
    handleNewChat,
    handleSelectChat,
    handleDeleteChat,
    handleRenameChat,
    handleViewMindMap,
    generarMapaMental,
    handleFeedback,
  }), [
    messages, chats, currentChat, isLoadingMessages, quotedMessage,
    setMessages, setChats, setCurrentChat, setIsLoadingMessages, setQuotedMessage,
    sendMessage, handleNewChat, handleSelectChat, handleDeleteChat, handleRenameChat,
    handleViewMindMap, generarMapaMental, handleFeedback
  ]);

  return (
    <ChatDataContext.Provider value={value}>
      {children}
    </ChatDataContext.Provider>
  );
};