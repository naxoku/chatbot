import React, { useState, useMemo, useCallback } from "react";
import { UIStateContext } from "./UIStateContext";
import { useChatState } from "../../../hooks/useChatState";

export const UIStateProvider = ({ children }) => {
  // Estado específico para UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isArtifactsOpen, setIsArtifactsOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isMindMapModalOpen, setIsMindMapModalOpen] = useState(false);
  const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  // Usar el hook existente para temas y estados móviles
  const chatState = useChatState();
  const { isDarkMode, isMobile, setIsMobile, toggleDarkMode } = chatState;

  // Estado local adicional
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");

  // Cerrar todos los modales
  const closeAll = useCallback(() => {
    setIsArtifactsOpen(false);
    setIsDocumentsModalOpen(false);
    setIsMindMapModalOpen(false);
    setIsHelpPanelOpen(false);
  }, []);

  const value = useMemo(() => ({
    // Estado UI
    isSidebarOpen,
    isArtifactsOpen,
    isDocumentsModalOpen,
    isMindMapModalOpen,
    isHelpPanelOpen,
    isDarkMode,
    isMobile,
    selectedArtifact,
    isTyping,
    input,
    
    // Setters
    setIsSidebarOpen,
    setIsArtifactsOpen,
    setIsDocumentsModalOpen,
    setIsMindMapModalOpen,
    setIsHelpPanelOpen,
    setIsMobile,
    setSelectedArtifact,
    setIsTyping,
    setInput,
    
    // Funciones
    toggleDarkMode,
    closeAll,
  }), [
    isSidebarOpen, isArtifactsOpen, isDocumentsModalOpen, isMindMapModalOpen, isHelpPanelOpen,
    isDarkMode, isMobile, selectedArtifact, isTyping, input,
    setIsSidebarOpen, setIsArtifactsOpen, setIsDocumentsModalOpen, setIsMindMapModalOpen, setIsHelpPanelOpen,
    setIsMobile, setSelectedArtifact, setIsTyping, setInput, toggleDarkMode, closeAll
  ]);

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
};