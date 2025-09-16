import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import axios from "axios";
import Navbar from "../Navbar";
import DocumentsPanel from "../DocumentsPanel";
import ArtifactsPanel from "../ArtifactsPanel";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useChatLogic } from "./useChatLogic";  // Hook completo ahora
import { nanoid } from "nanoid";

// Constantes hardcodeadas (sin cambios)
const ddperDocuments = [
  // ... tu array completo (copia de arriba)
];

const quickActions = [
  // ... tu array completo
];

const welcomeMessage = {
  // ... tu objeto completo
};

const ChatInterface = () => {
  const { isDarkMode, toggleDarkMode, artifacts, addArtifact, removeArtifact } =
    useContext(AppContext);

  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);

  // Estados para paneles (sin cambios)
  const [isDocumentsPanelOpen, setIsDocumentsPanelOpen] = useState(true);
  const [isArtifactsPanelOpen, setIsArtifactsPanelOpen] = useState(false);
  const [isDocumentsPanelCollapsed, setIsDocumentsPanelCollapsed] = useState(false);
  const [isArtifactsPanelCollapsed, setIsArtifactsPanelCollapsed] = useState(false);

  // Flag para session check (sin cambios)
  const hasInitialized = useRef(false);

  // Hook para lógica (ahora completo: pasa setters para updates)
  const {
    isTyping,
    sendMessage,
    handleFeedback,
    generarMapaMental,
    handleQuickAction,
  } = useChatLogic(ddperDocuments, navigate, addArtifact, setMessages, setInput);

  // useEffect para check de sesión (sin cambios, removí messages.length para evitar loops)
  useEffect(() => {
    const checkSession = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      try {
        const response = await axios.get("/checkSession", {
          withCredentials: true,
        });

        if (response.data.logged_in) {
          setUser(response.data.user);
          if (messages.length === 0) {
            setMessages([welcomeMessage]);
          }
        } else {
          console.log("No hay sesión activa, redirigiendo a login");
          navigate("/login");
        }
      } catch (err) {
        console.error("Error en checkSession:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/login");
        } else if (err.code === "ERR_NETWORK" || !err.response) {
          console.error("Backend no accesible en localhost:3000");
          navigate("/login");
        } else {
          console.error("Error inesperado:", err.message);
          navigate("/login");
        }
      }
    };
    checkSession();
  }, [navigate]);  // Solo navigate; flag evita loops

  // Manejar selección de documento (sin cambios)
  const handleDocumentSelect = (document) => {
    setInput(`Información sobre: ${document.title}`);
  };

  // Handlers para paneles (sin cambios)
  const handleDocumentsToggle = () => setIsDocumentsPanelOpen(!isDocumentsPanelOpen);
  const handleArtifactsToggle = () => setIsArtifactsPanelOpen(!isArtifactsPanelOpen);
  const handleDocumentsCollapse = () => setIsDocumentsPanelCollapsed(!isDocumentsPanelCollapsed);
  const handleArtifactsCollapse = () => setIsArtifactsPanelCollapsed(!isArtifactsPanelCollapsed);

  // Loading spinner (sin cambios)
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <i
            className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"
            aria-label="Cargando..."
          ></i>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navbar (sin cambios) */}
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        artifactCount={artifacts.length}
        botStatus="online"
        onLogout={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Panel izquierdo: Documentos (sin cambios) */}
        <DocumentsPanel
          documents={ddperDocuments}
          onDocumentSelect={handleDocumentSelect}
          isOpen={isDocumentsPanelOpen}
          onToggle={handleDocumentsToggle}
          isCollapsed={isDocumentsPanelCollapsed}
          onCollapse={handleDocumentsCollapse}
          isDarkMode={isDarkMode}
        />

        {/* Chat principal (sin cambios) */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatHeader isDarkMode={isDarkMode} />
          <ChatMessages
            messages={messages}
            isTyping={isTyping}  // Del hook: activa typing indicator
            onFeedback={handleFeedback}
            isDarkMode={isDarkMode}
          />
          <ChatInput
            input={input}
            onInputChange={setInput}
            onSendMessage={() => sendMessage(input)}  // ¡FIX: Solo input; hook maneja el resto
            isTyping={isTyping}
            quickActions={quickActions}
            onQuickAction={handleQuickAction}  // Del hook
            generarMapaMental={() => generarMapaMental(messages)}  // Pasa messages actuales
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Panel derecho: Artifacts (sin cambios) */}
        <ArtifactsPanel
          artifacts={artifacts}
          onOpenArtifact={(artifact) => {
            console.log("Abrir artifact:", artifact);
          }}
          onDeleteArtifact={removeArtifact}
          isOpen={isArtifactsPanelOpen}
          onToggle={handleArtifactsToggle}
          isCollapsed={isArtifactsPanelCollapsed}
          onCollapse={handleArtifactsCollapse}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default ChatInterface;