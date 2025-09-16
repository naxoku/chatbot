// src/components/ChatInterface/useChatLogic.js
import { useState } from "react";
import axios from "axios";  // Para llamadas al backend
import { nanoid } from "nanoid";

export const useChatLogic = (ddperDocuments, navigate, addArtifact, setMessages, setInput) => {
  const [isTyping, setIsTyping] = useState(false);

  // Búsqueda semántica de documentos (lógica local)
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

  // Enviar mensaje (lógica completa: user msg, typing, API call, bot response, error fallback)
  const sendMessage = async (input) => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    // Agregar mensaje del user
    const userMsg = {
      id: nanoid(),
      sender: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // Nota: scrollToBottom debe manejarse en ChatMessages o ChatInterface

    setIsTyping(true);  // Activa typing indicator

    try {
      const foundDocuments = searchDocuments(trimmed);

      // Llamada al backend con Axios
      const res = await axios.post("/api/chat", {
        pregunta: trimmed,
      });

      let botResponse = res.data.respuesta || "No hay respuesta disponible.";

      if (foundDocuments.length > 0) {
        botResponse += `\n\n📎 **Documentos relacionados encontrados:**`;
      }

      // Agregar respuesta del bot
      const botMsg = {
        id: nanoid(),
        sender: "bot",
        content: botResponse,
        documentLinks: foundDocuments.length > 0 ? foundDocuments : undefined,
        feedbackRequested: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Error en sendMessage:", err);

      const foundDocuments = searchDocuments(trimmed);
      let errorResponse = "Error al conectar con el servidor.";

      if (foundDocuments.length > 0) {
        errorResponse =
          "No pude conectar con el servidor, pero encontré estos documentos que podrían ayudarte:";
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

      // Agregar respuesta de error
      setMessages((prev) => [
        ...prev,
        {
          id: nanoid(),
          sender: "bot",
          content: errorResponse,
          documentLinks: foundDocuments.length > 0 ? foundDocuments : undefined,
          feedbackRequested: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);  // Desactiva typing
    }
  };

  // Generar mapa mental (lógica completa: toma último bot msg, API call, artifact)
  const generarMapaMental = async (messages) => {
    const lastBotMsg = [...messages].reverse().find((m) => m.sender === "bot");

    if (!lastBotMsg) {
      alert("No hay mensaje del bot para generar mapa.");
      return;
    }

    if (!lastBotMsg.content || lastBotMsg.content.trim() === "") {
      alert("El último mensaje del bot no contiene contexto válido.");
      return;
    }

    // Agregar placeholder msg para mapa
    const mapMsg = {
      id: nanoid(),
      sender: "bot",
      content: "",
      artifact: true,
    };
    setMessages((prev) => [...prev, mapMsg]);

    try {
      // Llamada al backend con Axios
      const res = await axios.post("/api/generar-mapa-mental", {
        contexto: lastBotMsg.content,
      });

      const jsonData = res.data;  // Axios parsea JSON

      // Crear y agregar artifact
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

      // Actualizar msg con JSON data (para renderMindMap en ChatMessages o similar)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === mapMsg.id ? { ...m, content: JSON.stringify(jsonData) } : m
        )
      );
    } catch (err) {
      console.error("Error al generar mapa mental:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === mapMsg.id
            ? { ...m, content: `Error al generar mapa: ${err.response?.data?.error || err.message}` }
            : m
        )
      );
    }
  };

  // Manejar feedback (actualiza messages para ocultar UI)
  const handleFeedback = async (messageId, isHelpful, comment = "") => {
    const feedback = {
      messageId,
      isHelpful,
      comment,
    };

    // Opcional: Enviar a backend (ej. axios.post("/api/feedback", feedback))
    console.log("Feedback enviado:", feedback);

    // Actualizar mensaje para ocultar feedback
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedbackRequested: false } : msg
      )
    );
  };

  // Quick action (set input)
  const handleQuickAction = (text) => {
    setInput(text);
  };

  return {
    isTyping,  // Para mostrar typing en ChatMessages
    sendMessage,  // Llamar desde ChatInput
    handleFeedback,  // Pasar a ChatMessages
    generarMapaMental,  // Llamar desde ChatInput
    handleQuickAction,  // Para quick buttons en ChatInput
  };
};