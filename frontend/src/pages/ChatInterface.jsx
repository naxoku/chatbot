import React, { useState, useRef, useEffect, useContext } from "react";
import DOMPurify from "dompurify";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";
import { AppContext } from "../App";
import Navbar from "../components/Navbar";
import DDPERDocumentsPanel from "../components/DocumentsPanel";
import ArtifactsPanel from "../components/ArtifactsPanel";
import { nanoid } from "nanoid";

const ChatInterface = () => {
  const { isDarkMode, toggleDarkMode, artifacts, addArtifact, removeArtifact } =
    useContext(AppContext);

  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);

  // Estado para abrir/cerrar paneles (móvil)
  const [isDocumentsPanelOpen, setIsDocumentsPanelOpen] = useState(true);
  const [isArtifactsPanelOpen, setIsArtifactsPanelOpen] = useState(false);

  // ¡NUEVO! Estado para colapsar/expandir paneles (desktop)
  const [isDocumentsPanelCollapsed, setIsDocumentsPanelCollapsed] =
    useState(false);
  const [isArtifactsPanelCollapsed, setIsArtifactsPanelCollapsed] =
    useState(false);

  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [showFeedback, setShowFeedback] = useState(null);
  const chatRef = useRef(null);
  // Documentos DDPER disponibles
  const ddperDocuments = [
    {
      id: "plan-conciliacion",
      title: "Plan de conciliación de la vida personal, familiar y laboral",
      url: "https://ddper.uct.cl/wp-content/uploads/2024/06/PLAN-DE-CONCILIACION-3.pdf",
      type: "reglamento",
      description:
        "Documento que establece las políticas de conciliación para funcionarios UCT con corresponsabilidad social",
      keywords: [
        "conciliación",
        "vida personal",
        "familiar",
        "laboral",
        "corresponsabilidad",
        "funcionarios",
      ],
      category: "Bienestar Laboral",
    },
    {
      id: "reglamento-beneficios",
      title: "Reglamento de asignación de beneficios",
      url: "https://ddper.uct.cl/beneficios/reglamento-beneficios.pdf",
      type: "reglamento",
      description:
        "Normativa sobre beneficios para funcionarios universitarios",
      keywords: ["beneficios", "asignación", "funcionarios", "reglamento"],
      category: "Beneficios",
    },
    {
      id: "formulario-permiso",
      title: "Formulario de solicitud de permiso administrativo",
      url: "https://ddper.uct.cl/formularios/permiso-administrativo.pdf",
      type: "formulario",
      description: "Formato para solicitar permisos administrativos",
      keywords: ["permiso", "administrativo", "solicitud", "formulario"],
      category: "Formularios",
    },
    {
      id: "instructivo-vacaciones",
      title: "Instructivo de solicitud de vacaciones",
      url: "https://ddper.uct.cl/instructivos/vacaciones.pdf",
      type: "instructivo",
      description: "Guía paso a paso para solicitar vacaciones",
      keywords: ["vacaciones", "solicitud", "instructivo", "descanso"],
      category: "Instructivos",
    },
    {
      id: "beneficios-salud",
      title: "Beneficios de salud para funcionarios",
      url: "https://ddper.uct.cl/beneficios/salud-funcionarios.pdf",
      type: "beneficio",
      description: "Información sobre beneficios médicos y de salud",
      keywords: ["salud", "médico", "beneficios", "seguro"],
      category: "Beneficios",
    },
  ];

  // Mensaje de bienvenida
  const welcomeMessage = {
    id: "welcome-ddper",
    sender: "bot",
    content: `¡Hola! Soy el **Asistente de la Dirección de Desarrollo de Personas (DDPER)** de la UCT.

Puedo ayudarte a encontrar:
• 📋 **Reglamentos y políticas institucionales**
• 📄 **Formularios oficiales**
• 📖 **Instructivos y guías de procedimientos**
• 🎯 **Información sobre beneficios**

**Ejemplos de consultas:**
- "¿Dónde encuentro el plan de conciliación familiar?"
- "Necesito el formulario de permiso administrativo"
- "¿Qué beneficios de salud están disponibles?"
- "¿Cómo solicito vacaciones?"

También puedes explorar los **documentos disponibles** en el panel lateral izquierdo.`,
    timestamp: new Date(),
    feedbackRequested: false,
  };

  // Session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:3000/checkSession", {
          credentials: "include",
        });
        if (!response.ok) {
          navigate("/login");
        } else {
          const data = await response.json();
          setUser(data.user);
          // Inicializar con mensaje de bienvenida solo si no hay mensajes
          if (messages.length === 0) {
            setMessages([welcomeMessage]);
          }
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate]);

  // Scroll automático
  const scrollToBottom = () => {
    setTimeout(() => {
      chatRef.current?.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  };

  // Búsqueda semántica de documentos
  const searchDocuments = (query) => {
    const queryLower = query.toLowerCase();
    const matches = ddperDocuments.filter(
      (doc) =>
        doc.keywords.some((keyword) =>
          queryLower.includes(keyword.toLowerCase())
        ) ||
        doc.title.toLowerCase().includes(queryLower) ||
        doc.description.toLowerCase().includes(queryLower) ||
        doc.category.toLowerCase().includes(queryLower)
    );

    return matches.map((doc) => ({
      title: doc.title,
      url: doc.url,
      type: doc.type,
      description: doc.description,
    }));
  };

  // Enviar mensaje
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg = {
      id: nanoid(),
      sender: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    scrollToBottom();

    setIsTyping(true);
    const typingMsg = {
      id: nanoid(),
      sender: "bot",
      content: "El asistente está escribiendo...",
    };
    setMessages((prev) => [...prev, typingMsg]);
    scrollToBottom();

    try {
      // Primero buscar documentos relevantes
      const foundDocuments = searchDocuments(trimmed);

      // Llamar a la API existente
      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pregunta: trimmed }),
      });

      const data = await res.json();
      let botResponse = data.respuesta || "No hay respuesta disponible.";

      // Si encontramos documentos relevantes, enriquecer la respuesta
      if (foundDocuments.length > 0) {
        botResponse += `\n\n📎 **Documentos relacionados encontrados:**`;
      }

      const botMsg = {
        id: nanoid(),
        sender: "bot",
        content: botResponse,
        documentLinks: foundDocuments.length > 0 ? foundDocuments : undefined,
        feedbackRequested: true,
        timestamp: new Date(),
      };

      setMessages((prev) =>
        prev.filter((m) => m.id !== typingMsg.id).concat(botMsg)
      );
      scrollToBottom();
    } catch (err) {
      console.error(err);

      // En caso de error, al menos intentar búsqueda local
      const foundDocuments = searchDocuments(trimmed);
      let errorResponse = "Error al conectar con el servidor.";

      if (foundDocuments.length > 0) {
        errorResponse = `No pude conectar con el servidor, pero encontré estos documentos que podrían ayudarte:`;
      } else if (
        trimmed.toLowerCase().includes("documento") &&
        trimmed.length < 20
      ) {
        errorResponse = `¿Puedes especificar el tipo de documento que buscas? Por ejemplo:
• "reglamento de beneficios"
• "formulario de permiso"  
• "instructivo de postulación"

O puedes contactar directamente a: **ddper@uct.cl**`;
      } else {
        errorResponse += `\n\nTe sugiero:
1. Revisar los documentos disponibles en el panel lateral
2. Contactar directamente: **ddper@uct.cl**`;
      }

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== typingMsg.id)
          .concat({
            id: nanoid(),
            sender: "bot",
            content: errorResponse,
            documentLinks:
              foundDocuments.length > 0 ? foundDocuments : undefined,
            feedbackRequested: true,
            timestamp: new Date(),
          })
      );
      scrollToBottom();
    } finally {
      setIsTyping(false);
    }
  };

  // Manejar feedback
  const handleFeedback = async (
    messageId,
    isHelpful,
    comment
  ) => {
    const feedback = {
      messageId,
      isHelpful,
      comment,
    };

    // Aquí podrías enviar el feedback a tu backend
    console.log("Feedback enviado:", feedback);

    // Actualizar el mensaje para mostrar que se envió el feedback
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedbackRequested: false } : msg
      )
    );

    setShowFeedback(null);
  };

  // Generar mapa mental (funcionalidad existente)
  const generarMapaMental = async () => {
    const lastBotMsg = [...messages].reverse().find((m) => m.sender === "bot");
    if (!lastBotMsg) return alert("No hay mensaje del bot para generar mapa.");

    const mapMsg = {
      id: nanoid(),
      sender: "bot",
      content: "",
      artifact: true,
    };
    setMessages((prev) => [...prev, mapMsg]);
    scrollToBottom();

    try {
      const res = await fetch("http://localhost:3000/api/generar-mapa-mental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contexto: lastBotMsg.content }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error generando mapa mental");
      }

      const jsonData = await res.json();

      const newArtifact = {
        id: `artifact-${Date.now()}`,
        name: `Mapa Mental - ${new Date().toLocaleDateString()}`,
        type: "mindmap",
        icon: "fas fa-project-diagram",
        color: "purple",
        data: jsonData,
        createdAt: new Date(),
        description: "Mapa mental generado automáticamente",
      };
      addArtifact(newArtifact);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === mapMsg.id ? { ...m, content: JSON.stringify(jsonData) } : m
        )
      );
      scrollToBottom();
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === mapMsg.id ? { ...m, content: `Error: ${err.message}` } : m
        )
      );
    }
  };

  // Input handlers
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const autoResize = (textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  // Quick actions específicas para DDPER
  const quickActions = [
    {
      text: "¿Dónde encuentro el plan de conciliación familiar?",
      icon: "fas fa-balance-scale",
      color: "blue",
      label: "Conciliación",
    },
    {
      text: "Necesito el formulario de permiso administrativo",
      icon: "fas fa-file-alt",
      color: "green",
      label: "Formularios",
    },
    {
      text: "¿Qué beneficios están disponibles para funcionarios?",
      icon: "fas fa-gift",
      color: "purple",
      label: "Beneficios",
    },
    {
      text: "¿Cómo solicito vacaciones?",
      icon: "fas fa-calendar-alt",
      color: "orange",
      label: "Vacaciones",
    },
  ];

  const handleQuickAction = (text) => setInput(text);

  // Manejar selección de documento desde el panel
  const handleDocumentSelect = (document) => {
    setInput(`Información sobre: ${document.title}`);
  };

  // Renderizar mensaje
  const renderMessage = (msg) => {
    if (msg.sender === "user") {
      return (
        <div
          key={msg.id}
          className="flex justify-end mb-4 px-2 animate-fade-in"
        >
          <div className="flex items-start space-x-3 max-w-md w-auto">
            <div className="bg-blue-600 dark:bg-blue-700 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg break-words word-wrap">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fas fa-user text-blue-600 dark:text-blue-400 text-sm"></i>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={msg.id}
        className="flex justify-start mb-4 px-2 animate-fade-in"
      >
        <div className="flex items-start space-x-3 max-w-2xl w-auto">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-robot text-white text-sm"></i>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg break-words word-wrap min-w-0 flex-1">
            {/* Contenido principal */}
            {msg.artifact ? (
              <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg space-y-2">
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={() => alert(`Simulación: mostrar Mapa Mental`)}
                >
                  Ver Mapa Mental
                </button>
              </div>
            ) : (
              <div
                className="prose prose-sm dark:prose-invert max-w-none mb-3"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(marked.parse(msg.content)),
                }}
              />
            )}

            {/* Enlaces de documentos */}
            {msg.documentLinks && msg.documentLinks.length > 0 && (
              <div className="space-y-2 mb-3">
                {msg.documentLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-start space-x-2">
                      <i
                        className={`fas ${
                          link.type === "formulario"
                            ? "fa-file-alt"
                            : link.type === "reglamento"
                            ? "fa-gavel"
                            : link.type === "instructivo"
                            ? "fa-book"
                            : link.type === "beneficio"
                            ? "fa-gift"
                            : "fa-file"
                        } text-blue-600 mt-1`}
                      ></i>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {link.title}
                        </h4>
                        {link.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {link.description}
                          </p>
                        )}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 text-sm font-medium"
                        >
                          <span>Ver documento</span>
                          <i className="fas fa-external-link-alt text-xs"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sistema de feedback */}
            {msg.feedbackRequested && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ¿Te fue útil esta respuesta?
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFeedback(msg.id, true)}
                    className="text-green-600 hover:text-green-700 text-sm p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                    title="Sí, me fue útil"
                  >
                    <i className="fas fa-thumbs-up"></i>
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, false)}
                    className="text-red-600 hover:text-red-700 text-sm p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="No me fue útil"
                  >
                    <i className="fas fa-thumbs-down"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
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
        {/* Panel de documentos DDPER - izquierda */}
        <DDPERDocumentsPanel
          documents={ddperDocuments}
          onDocumentSelect={handleDocumentSelect}
          isOpen={isDocumentsPanelOpen}
          onToggle={() => setIsDocumentsPanelOpen(!isDocumentsPanelOpen)}
          isDarkMode={isDarkMode}
          // Props nuevas para colapsar
          isCollapsed={isDocumentsPanelCollapsed}
          onCollapse={() =>
            setIsDocumentsPanelCollapsed(!isDocumentsPanelCollapsed)
          }
        />

        {/* Chat principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header del chat */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {/* Botón para mostrar/ocultar panel de documentos */}
             

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-users text-white"></i>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Asistente DDPER
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Dirección de Desarrollo de Personas - UCT
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenedor del chat */}
          <div
            ref={chatRef}
            className="flex-1 flex flex-col overflow-y-auto py-6 custom-scrollbar px-4"
            style={{ maxHeight: "calc(100vh - 300px)" }}
          >
            {messages.map(renderMessage)}

            {isTyping && (
              <div className="flex justify-start mb-4 px-2">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-robot text-white text-sm"></i>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        Buscando información...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Área de input */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            {/* Acciones rápidas */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action.text)}
                    className={`text-xs px-3 py-1.5 bg-${action.color}-50 dark:bg-${action.color}-900/20 text-${action.color}-600 dark:text-${action.color}-400 rounded-full border border-${action.color}-200 dark:border-${action.color}-700 hover:bg-${action.color}-100 dark:hover:bg-${action.color}-900/30 transition-colors flex items-center space-x-1`}
                  >
                    <i className={action.icon}></i>
                    <span>{action.label}</span>
                  </button>
                ))}

                {/* Botón de mapa mental */}
                <button
                  onClick={generarMapaMental}
                  className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors flex items-center space-x-1"
                >
                  <i className="fas fa-brain"></i>
                  <span>Mapa Mental</span>
                </button>
              </div>
            </div>

            {/* Input del chat */}
            <div className="relative flex items-end space-x-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-3">
              <textarea
                placeholder="Pregúntame sobre documentos DDPER..."
                className="w-full resize-none bg-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-sm leading-relaxed py-1 px-1"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onInput={(e) => autoResize(e.currentTarget)}
                style={{ minHeight: 24, maxHeight: 120, lineHeight: 1.5 }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0"
              >
                <i className="fas fa-paper-plane text-sm"></i>
              </button>
            </div>

            {/* Contacto directo */}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ¿No encuentras lo que buscas?{" "}
                <a
                  href="mailto:ddper@uct.cl"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Contacta directamente: ddper@uct.cl
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Panel de herramientas/artifacts - derecha */}
        <ArtifactsPanel 
          artifacts={artifacts}
          onOpenArtifact={(a) => setSelectedArtifact(a)}
          onDeleteArtifact={removeArtifact}
          isOpen={isArtifactsPanelOpen}
          onToggle={() => setIsArtifactsPanelOpen(!isArtifactsPanelOpen)}
          isDarkMode={isDarkMode}
          // Props nuevas para colapsar
          isCollapsed={isArtifactsPanelCollapsed}
          onCollapse={() =>
            setIsArtifactsPanelCollapsed(!isArtifactsPanelCollapsed)
          }
        />
      </div>
    </div>
  );
};

export default ChatInterface;