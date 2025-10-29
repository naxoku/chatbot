import { createContext } from "react";

export const ChatContext = createContext({
  messages: [],
  chats: [],
  currentChat: null,
  setMessages: () => {},
  setChats: () => {},
  setCurrentChat: () => {},
  sendMessage: () => {},
  createNewChat: () => {},
  handleNewChat: () => {},
  handleSelectChat: () => {},
  handleDeleteChat: () => {},
  handleRenameChat: () => {},
  handleViewMindMap: () => {},
});