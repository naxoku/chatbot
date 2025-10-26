import { useState, useCallback, useContext } from "react";
import { AppContext } from "../App";

export const useChatState = () => {
  const { isDarkMode, toggleDarkMode } = useContext(AppContext);

  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isArtifactsOpen, setIsArtifactsOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState({
    id: "current",
    name: "Nuevo chat",
    timestamp: new Date(),
    mapasAsociados: [],
    conversacionId: null,
  });
  const [chats, setChats] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [selectedParameters, setSelectedParameters] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [isMindMapModalOpen, setIsMindMapModalOpen] = useState(false);

  const handleNewChat = useCallback(
    (setMessages) => {
      const newChat = {
        id: "current",
        name: "Nueva conversación",
        timestamp: new Date(),
        mapasAsociados: [],
        conversacionId: null,
      };

      setCurrentChat(newChat);
      setInput("");

      // Limpiar mensajes si se proporciona la función
      if (setMessages && typeof setMessages === "function") {
        setMessages([]);
      }

      if (isMobile) setIsSidebarOpen(false);
    },
    [isMobile]
  );

  const handleSelectChat = useCallback(
    (chat) => {
      setCurrentChat(chat);
      if (isMobile) setIsSidebarOpen(false);
    },
    [isMobile]
  );

  const closeAll = useCallback(() => {
    setIsSidebarOpen(false);
    setIsArtifactsOpen(false);
    setIsMindMapModalOpen(false);
  }, []);

  const handleInputChange = useCallback((value) => {
    setInput(value);
  }, []);

  const handleDocumentSelect = useCallback(
    (doc) => {
      setInput(`Información sobre: ${doc.title}`);
      if (isMobile) setIsSidebarOpen(false);
    },
    [isMobile]
  );

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

  return {
    // State
    input,
    user,
    documents,
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

    // Setters
    setInput,
    setUser,
    setDocuments,
    setIsSidebarOpen,
    setIsArtifactsOpen,
    setCurrentChat,
    setChats,
    setIsMobile,
    setIsDocumentsModalOpen,
    setSelectedParameters,

    // Handlers
    handleNewChat,
    handleSelectChat,
    closeAll,
    handleInputChange,
    handleDocumentSelect,
    handleParameterChange,
    handleOpenArtifact,
    handleCloseMindMapModal,
    toggleDarkMode,
  };
};
