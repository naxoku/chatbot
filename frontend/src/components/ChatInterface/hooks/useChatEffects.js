import { useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../../../config.js";

/**
 * Hook para manejar los efectos de ChatInterface
 * @param {Object} params - Parámetros necesarios para los efectos
 */
export const useChatEffects = (params) => {
  const {
    chatState,
    setDocumentsList,
    setIsHelpPanelOpen,
  } = params;

  // Efecto para cargar documentos
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
  }, [setDocumentsList]);

  // Efecto para manejar el resize responsive
  useEffect(() => {
    const handleResize = () => {
      chatState.setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        chatState.setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [chatState]);

  // Efecto para manejar teclas de acceso rápido
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        chatState.closeAll();
        setIsHelpPanelOpen(false);
      }
      
      if ((e.ctrlKey || e.metaKey) && 
          e.key === "k" && 
          !e.target.matches("textarea, input")) {
        e.preventDefault();
        setIsHelpPanelOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [chatState, chatState.closeAll, setIsHelpPanelOpen]);

  // Efecto para prevenir scroll del body en móvil
  useEffect(() => {
    const hasOpenModals = chatState.isSidebarOpen || 
                         chatState.isArtifactsOpen || 
                         chatState.isMindMapModalOpen || 
                         chatState.isHelpPanelOpen;
    
    if (hasOpenModals && chatState.isMobile) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [
    chatState.isSidebarOpen, 
    chatState.isArtifactsOpen, 
    chatState.isMindMapModalOpen, 
    chatState.isHelpPanelOpen, 
    chatState.isMobile
  ]);
};