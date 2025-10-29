import { useCallback, useContext } from "react";
import { ChatContext } from "../providers/ChatContext";
import { chatService, createMessage } from "../services/chatService";

export const useChatActions = () => {
  const { setChats, setCurrentChat, setMessages, user } = useContext(ChatContext);

  const createChat = useCallback((firstMessage) => {
    const newChat = {
      id: `conv-${Date.now()}`,
      name: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? "..." : ""),
      timestamp: new Date(),
      conversacionId: null
    };
    
    setCurrentChat(newChat);
    setChats(prev => [newChat, ...prev]);
    return newChat;
  }, [setChats, setCurrentChat]);

  const deleteChat = useCallback(async (chat) => {
    try {
      await chatService.delete(chat.conversacionId);
      setChats(prev => prev.filter(c => c.conversacionId !== chat.conversacionId));
      return true;
    } catch (error) {
      console.error('Delete chat error:', error);
      return false;
    }
  }, [setChats]);

  const renameChat = useCallback(async (chat, newName) => {
    try {
      await chatService.rename(chat.conversacionId, newName);
      setChats(prev => prev.map(c => 
        c.conversacionId === chat.conversacionId 
          ? { ...c, name: newName }
          : c
      ));
      return true;
    } catch (error) {
      console.error('Rename chat error:', error);
      return false;
    }
  }, [setChats]);

  const createNewChatWithWelcome = useCallback(() => {
    const newChat = {
      id: `conv-${Date.now()}`,
      name: "Nueva conversación",
      timestamp: new Date(),
      conversacionId: null
    };
    
    setCurrentChat(newChat);
    setChats(prev => [newChat, ...prev]);
    
    if (user) {
      setMessages([createMessage("bot", `¡Hola **${user.name}**! ¿En qué puedo ayudarte hoy?`, {
        feedbackRequested: false,
      })]);
    }
    
    return newChat;
  }, [setChats, setCurrentChat, setMessages, user]);

  const handleSelectChat = useCallback(async (chat, setIsLoadingMessages) => {
    setCurrentChat(chat);
    
    setIsLoadingMessages(true);

    if (chat.conversacionId) {
      // Aquí podríamos cargar mensajes desde el backend si fuera necesario
      // Por ahora solo mostramos un mensaje de bienvenida
      setIsLoadingMessages(false);
    } else {
      // Nueva conversación
      if (user) {
        setMessages([createMessage("bot", `¡Hola **${user.name}**! ¿En qué puedo ayudarte hoy?`, {
          feedbackRequested: false,
        })]);
      }
      setIsLoadingMessages(false);
    }
  }, [setCurrentChat, setMessages, user]);

  return {
    create: createChat,
    delete: deleteChat,
    rename: renameChat,
    createNewChatWithWelcome,
    handleSelectChat,
  };
};