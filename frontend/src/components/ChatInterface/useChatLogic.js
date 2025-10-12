import { useState } from "react";
import axios from "axios";
import { nanoid } from "nanoid";

export const useChatLogic = (
  documents,
  navigate,
  addArtifact,
  setMessages,
  setInput
) => {
  const [isTyping, setIsTyping] = useState(false);

  // 🔎 Búsqueda semántica local
  // Enviar mensaje al chat normal
  const createMessage = (sender, content, options = {}) => ({
    id: nanoid(),
    sender,
    content,
    timestamp: new Date(),
    ...options,
  });

  const getErrorMessage = () => {
    return `Hubo un fallo en la conexión con el servidor. Por favor, inténtalo de nuevo más tarde.

Si el problema persiste, puedes contactar directamente a: **ddper@uct.cl**`;
  };

  const sendMessage = async (input) => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg = createMessage("user", trimmed);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post("/api/chat", { pregunta: trimmed });
      let botResponse = res.data.respuesta || "No hay respuesta disponible.";
      const documentosRecomendados = res.data.documentosRecomendados || [];

      const botMsg = createMessage("bot", botResponse, {
        documentLinks:
          documentosRecomendados.length > 0
            ? documentosRecomendados
            : undefined,
        feedbackRequested: true,
      });
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Error en sendMessage:", err);
      const errorResponse = getErrorMessage();
      const errorMsg = createMessage("bot", errorResponse, {
        feedbackRequested: true,
      });
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Generar mapa mental desde último mensaje del bot
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

    const mapMsg = {
      id: nanoid(),
      sender: "bot",
      content: "Generando mapa mental...",
      artifact: true,
    };
    setMessages((prev) => [...prev, mapMsg]);

    try {
      const res = await axios.post("/api/chat/mapa-mental", {
        contexto: lastBotMsg.content,
      });

      // Parsear el JSON recibido
      let jsonData = res.data.mapaMental || {};

      try {
        if (typeof jsonData === "string") {
          jsonData = JSON.parse(jsonData);
        }
      } catch (parseErr) {
        console.error("❌ Error al parsear el JSON del mapa mental:", parseErr);
        jsonData = {
          respuesta: {
            mensaje: "Error",
            titulo: "No se pudo generar el mapa mental",
            datos: {
              name: "Error",
              children: [{ name: "No se pudo generar el mapa mental" }],
            },
          },
        };
      }

      // Mostrar mensaje de éxito si existe
      if (jsonData.respuesta.mensaje) {
        console.log("✅ " + jsonData.respuesta.mensaje);
      }

      const newArtifact = {
        id: jsonData.id || `artifact-${Date.now()}`,
        name:
          jsonData.respuesta.titulo + ` - ${new Date().toLocaleDateString()}`,
        type: "mindmap",
        icon: "fas fa-project-diagram",
        color: "purple",
        data: jsonData.respuesta.datos,
        createdAt: jsonData.fecha_creacion || new Date(),
        description: "Mapa mental guardado en la base de datos",
      };
      addArtifact(newArtifact);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === mapMsg.id
            ? {
                ...m,
                content: jsonData.respuesta.mensaje,
                artifactData: newArtifact,
              } // Adjuntar el artefacto completo
            : m
        )
      );
    } catch (err) {
      console.error("Error al generar mapa mental:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === mapMsg.id
            ? {
                ...m,
                content: `Error al generar mapa: ${
                  err.response?.data?.error || err.message
                }`,
              }
            : m
        )
      );
    }
  };

  const handleFeedback = async (messageId, isHelpful, comment = "") => {
    console.log("Feedback enviado:", { messageId, isHelpful, comment });
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedbackRequested: false } : msg
      )
    );
  };

  const handleQuickAction = (text) => setInput(text);

  return {
    isTyping,
    sendMessage,
    handleFeedback,
    generarMapaMental,
    handleQuickAction,
  };
};
