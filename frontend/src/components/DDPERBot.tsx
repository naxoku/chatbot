import React, { useState, useRef, useEffect, useContext } from "react";
import { AppContext } from "../App";

// Tipos específicos para el bot DDPER
type DocumentType =
  | "reglamento"
  | "formulario"
  | "instructivo"
  | "beneficio"
  | "otro";

type DDPERMessage = {
  id: string;
  sender: "user" | "bot";
  content: string;
  documentLinks?: DocumentLink[];
  feedbackRequested?: boolean;
  timestamp: Date;
};

type DocumentLink = {
  title: string;
  url: string;
  type: DocumentType;
  description?: string;
};

type FeedbackData = {
  messageId: string;
  isHelpful: boolean;
  comment?: string;
};

const DDPERBot: React.FC = () => {
  const { isDarkMode } = useContext(AppContext);
  const [messages, setMessages] = useState<DDPERMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Documentos específicos DDPER (simulados)
  const ddperDocuments = [
    {
      title: "Plan de conciliación de la vida personal, familiar y laboral",
      url: "https://ddper.uct.cl/wp-content/uploads/2024/06/PLAN-DE-CONCILIACION-3.pdf",
      type: "reglamento" as DocumentType,
      description:
        "Documento que establece las políticas de conciliación para funcionarios UCT",
      keywords: [
        "conciliación",
        "vida personal",
        "familiar",
        "laboral",
        "corresponsabilidad",
        "funcionarios",
      ],
    },
    {
      title: "Reglamento de asignación de beneficios",
      url: "https://ddper.uct.cl/beneficios/reglamento-beneficios.pdf",
      type: "reglamento" as DocumentType,
      description:
        "Normativa sobre beneficios para funcionarios universitarios",
      keywords: ["beneficios", "asignación", "funcionarios", "reglamento"],
    },
    {
      title: "Formulario de solicitud de permiso administrativo",
      url: "https://ddper.uct.cl/formularios/permiso-administrativo.pdf",
      type: "formulario" as DocumentType,
      description: "Formato para solicitar permisos administrativos",
      keywords: ["permiso", "administrativo", "solicitud", "formulario"],
    },
  ];

  // Mensajes de bienvenida y guías rápidas
  const welcomeMessage: DDPERMessage = {
    id: "welcome-1",
    sender: "bot",
    content: `¡Hola! Soy el Asistente de la Dirección de Desarrollo de Personas (DDPER) de la UCT. 

Puedo ayudarte a encontrar:
• 📋 Reglamentos y políticas
• 📄 Formularios oficiales  
• 📖 Instructivos y guías
• 🎯 Información sobre beneficios

**Ejemplos de consultas:**
"¿Dónde encuentro el plan de conciliación familiar?"
"Necesito el formulario de permiso administrativo"
"¿Qué beneficios están disponibles?"`,
    timestamp: new Date(),
    feedbackRequested: false,
  };

  // Inicializar con mensaje de bienvenida
  useEffect(() => {
    setMessages([welcomeMessage]);
  }, []);

  // Scroll automático
  const scrollToBottom = () => {
    setTimeout(() => {
      chatRef.current?.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  };

  // Búsqueda semántica simulada
  const searchDocuments = (query: string): DocumentLink[] => {
    const queryLower = query.toLowerCase();
    const matches = ddperDocuments.filter(
      (doc) =>
        doc.keywords.some((keyword) =>
          queryLower.includes(keyword.toLowerCase())
        ) ||
        doc.title.toLowerCase().includes(queryLower) ||
        doc.description.toLowerCase().includes(queryLower)
    );

    return matches.map((doc) => ({
      title: doc.title,
      url: doc.url,
      type: doc.type,
      description: doc.description,
    }));
  };

  // Generar respuesta del bot
  const generateBotResponse = (
    userQuery: string
  ): { content: string; links: DocumentLink[] } => {
    const foundDocuments = searchDocuments(userQuery);

    if (foundDocuments.length > 0) {
      const content = `He encontrado ${
        foundDocuments.length === 1 ? "este documento" : "estos documentos"
      } que pueden ayudarte:`;
      return { content, links: foundDocuments };
    }

    // Respuestas para consultas ambiguas
    if (
      userQuery.toLowerCase().includes("documento") &&
      userQuery.length < 20
    ) {
      return {
        content: `¿Puedes especificar el tipo de documento que buscas? Por ejemplo:
• "reglamento de beneficios"
• "formulario de permiso"  
• "instructivo de postulación"

O puedes contactar directamente a: **ddper@uct.cl**`,
        links: [],
      };
    }

    // Respuesta por defecto cuando no se encuentra nada
    return {
      content: `No encontré documentos específicos para tu consulta. 

Te sugiero:
1. Revisar la sección de documentos en https://ddper.uct.cl
2. Contactar directamente al correo: **ddper@uct.cl**

¿Hay algo más específico que pueda ayudarte a encontrar?`,
      links: [],
    };
  };

  // Enviar mensaje
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    // Mensaje del usuario
    const userMsg: DDPERMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simular typing
    setTimeout(() => {
      const response = generateBotResponse(trimmed);

      const botMsg: DDPERMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        content: response.content,
        documentLinks: response.links,
        feedbackRequested: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      scrollToBottom();
    }, 1500);

    scrollToBottom();
  };

  // Manejar feedback
  const handleFeedback = (
    messageId: string,
    isHelpful: boolean,
    comment?: string
  ) => {
    const feedback: FeedbackData = {
      messageId,
      isHelpful,
      comment,
    };

    // Aquí enviarías el feedback al backend
    console.log("Feedback enviado:", feedback);

    // Actualizar el mensaje para mostrar que se envió el feedback
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedbackRequested: false } : msg
      )
    );

    setShowFeedback(null);
  };

  // Acciones rápidas específicas para DDPER
  const quickActions = [
    {
      text: "¿Dónde encuentro el plan de conciliación familiar?",
      icon: "fas fa-balance-scale",
      category: "Conciliación",
    },
    {
      text: "Necesito el formulario de permiso administrativo",
      icon: "fas fa-file-alt",
      category: "Formularios",
    },
    {
      text: "¿Qué beneficios están disponibles para funcionarios?",
      icon: "fas fa-gift",
      category: "Beneficios",
    },
    {
      text: "Información sobre reglamento de asistencia",
      icon: "fas fa-clock",
      category: "Reglamentos",
    },
  ];

  // Renderizar mensaje
  const renderMessage = (msg: DDPERMessage) => {
    if (msg.sender === "user") {
      return (
        <div key={msg.id} className="flex justify-end mb-4">
          <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-md shadow-lg">
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
          </div>
        </div>
      );
    }

    return (
      <div key={msg.id} className="flex justify-start mb-4">
        <div className="flex items-start space-x-3 max-w-2xl">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-robot text-white text-sm"></i>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
            <div className="prose prose-sm dark:prose-invert max-w-none mb-3">
              {msg.content.split("\n").map((line, idx) => (
                <p key={idx} className="mb-2 last:mb-0">
                  {line}
                </p>
              ))}
            </div>

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
                    className="text-green-600 hover:text-green-700 text-sm p-1"
                    title="Sí, me fue útil"
                  >
                    <i className="fas fa-thumbs-up"></i>
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, false)}
                    className="text-red-600 hover:text-red-700 text-sm p-1"
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

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header específico DDPER */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
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

      {/* Chat Container */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow">
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
        )}
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Consultas frecuentes:
          </h3>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => setInput(action.text)}
                className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <i className={`${action.icon} mr-1`}></i>
                {action.category}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              placeholder="Pregúntame sobre documentos DDPER..."
              className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <i className="fas fa-paper-plane"></i>
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
  );
};

export default DDPERBot;
