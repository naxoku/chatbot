import { createContext } from "react";

export const ChatDataContext = createContext({
  messages: [],
  chats: [],
  currentChat: null,
  isLoadingMessages: false,
  quotedMessage: null,
  setMessages: () => {},
  setChats: () => {},
  setCurrentChat: () => {},
  setIsLoadingMessages: () => {},
  setQuotedMessage: () => {},
});