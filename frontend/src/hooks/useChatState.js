import { useState, useCallback, useContext } from "react";
import { nanoid } from "nanoid";
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
  });
  const [chats, setChats] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [selectedParameters, setSelectedParameters] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [isMindMapModalOpen, setIsMindMapModalOpen] = useState(false);

  const handleNewChat = useCallback(() => {
    const newChat = {
      id: nanoid(),
      name: `Nueva Conversación ${chats.length + 1}`,
      lastMessage: "",
      timestamp: new Date(),
    };
    setCurrentChat(newChat);
    setInput("");
    setChats((prev) => [newChat, ...prev]);
    if (isMobile) setIsSidebarOpen(false);
  }, [chats, isMobile]);

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

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setEditingTitle(currentChat?.name || "Nueva Conversación");
  };

  const handleTitleSave = () => {
    if (editingTitle.trim()) {
      const newName = editingTitle.trim();
      setCurrentChat((prev) => ({ ...prev, name: newName }));
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChat.id ? { ...chat, name: newName } : chat
        )
      );
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setEditingTitle("");
  };

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
    isEditingTitle,
    editingTitle,
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
    setEditingTitle,
    setSelectedParameters,

    // Handlers
    handleNewChat,
    handleSelectChat,
    closeAll,
    handleInputChange,
    handleDocumentSelect,
    handleTitleEdit,
    handleTitleSave,
    handleTitleCancel,
    handleParameterChange,
    handleOpenArtifact,
    handleCloseMindMapModal,
    toggleDarkMode,
  };
};
