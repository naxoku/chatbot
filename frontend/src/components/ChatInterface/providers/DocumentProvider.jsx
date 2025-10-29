import React, { useState, useMemo, useCallback } from "react";
import { DocumentContext } from "./DocumentContext";
import { useContext as useReactContext } from "react";
import { AppContext } from "../../../App";
import LogoUCT from "../../../assets/logouct.png";
import axios from "axios";
import { API_BASE } from "../../../config";

export const DocumentProvider = ({ children }) => {
  const { addArtifact, removeArtifact } = useReactContext(AppContext);
  
  // Estado específico para documentos
  const [documentsList, setDocumentsList] = useState([]);
  const [artifacts, setArtifacts] = useState([]);

  // Cargar documentos al montar
  React.useEffect(() => {
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

  // Manejar artefactos
  const handleOpenArtifact = useCallback((artifact) => {
    // Aquí iría la lógica para abrir artefactos
    console.log('Opening artifact:', artifact);
  }, []);

  const value = useMemo(() => ({
    // Estado
    documentsList,
    artifacts,
    LogoUCT,
    
    // Setters
    setDocumentsList,
    setArtifacts,
    
    // Funciones
    addArtifact,
    removeArtifact,
    handleOpenArtifact,
  }), [
    documentsList, artifacts,
    setDocumentsList, setArtifacts,
    addArtifact, removeArtifact, handleOpenArtifact
  ]);

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};