import { useState } from "react";
import axios from "axios";
import { nanoid } from "nanoid";
import { API_BASE } from "../../config"; // Importar API_BASE

export const useChatLogic = (
  documents,
  navigate,
  addArtifact,
  setMessages,
  setInput,
  chatState, // Recibir chatState completo
  messages // Recibir messages del estado de ChatInterface
) => {
  const { currentChat, setCurrentChat, setChats } = chatState; // Desestructurar de chatState
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

  const sendMessage = async (input, selectedParameters) => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg = createMessage("user", trimmed);
    let updatedMessages = [...messages, userMsg]; // Usar messages del estado local
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      // Enviar mensaje al backend
      const chatResponse = await axios.post("/api/chat", {
        pregunta: trimmed,
        documentos: documents,
        parametros: selectedParameters,
      });

      let botResponseContent = chatResponse.data.respuesta || "No hay respuesta disponible.";
      const documentosRecomendados = chatResponse.data.documentosRecomendados || [];

      updatedMessages = [...updatedMessages, {
        id: nanoid(),
        sender: "bot",
        content: botResponseContent,
        timestamp: new Date(),
        documentLinks: documentosRecomendados.length > 0 ? documentosRecomendados : undefined,
        feedbackRequested: true,
      }];
      setMessages(updatedMessages);
      // Guardar o actualizar la conversación en la base de datos
      const chatHistoryToSave = updatedMessages.filter(msg => msg.id !== "welcome");
      const conversationData = {
        chat_history: chatHistoryToSave,
        mapas_mentales_ids: currentChat.mapasAsociados ? currentChat.mapasAsociados.map(m => m.id) : [],
      };

      if (!currentChat.conversacionId) {
        // Crear nueva conversación
        const newConversationTitle = trimmed.substring(0, 50) + (trimmed.length > 50 ? '...' : '');
        conversationData.titulo = newConversationTitle;

        const res = await axios.post(`${API_BASE}/api/conversaciones`, conversationData);
        if (res.data.success) {
          const newConv = res.data.conversacion;
          const newChatEntry = {
            id: `conv-${newConv.id}`,
            name: newConv.titulo,
            lastMessage: trimmed,
            timestamp: newConv.fecha_creacion,
            mapasAsociados: [],
            conversacionId: newConv.id,
          };
          setCurrentChat(newChatEntry); // Actualizar currentChat con el ID de la nueva conversación
          setChats((prev) => [newChatEntry, ...prev]);
        }
      } else {
        // Actualizar conversación existente
        conversationData.titulo = currentChat.name; // Mantener el título existente
        const res = await axios.put(`${API_BASE}/api/conversaciones/${currentChat.conversacionId}`, conversationData);
        if (res.data.success) {
          setChats((prev) =>
            prev.map((chat) =>
              chat.conversacionId === currentChat.conversacionId
                ? { ...chat, lastMessage: trimmed, timestamp: res.data.conversacion.fecha_creacion }
                : chat
            )
          );
        }
      }

      // El mensaje del bot ya fue agregado anteriormente, no es necesario agregarlo de nuevo
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

    if (!currentChat.conversacionId) {
      alert("Debes guardar la conversación antes de generar un mapa mental.");
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
      const res = await axios.post(`${API_BASE}/api/mapas-mentales`, {
        titulo: `Mapa Mental de ${currentChat.name}`,
        contexto: lastBotMsg.content,
        estructura_json: {}, // Se actualizará después con la respuesta del bot
        conversacion_id: currentChat.conversacionId,
      });

      const newMindMapId = res.data.mapa.id;

      // Ahora, enviar el contexto al endpoint de generación de mapas mentales
      const mapGenResponse = await axios.post("/api/chat/mapa-mental", {
        contexto: lastBotMsg.content,
      });

      let jsonData = mapGenResponse.data.mapaMental || {};

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

      // Actualizar el mapa mental con la estructura JSON generada
      await axios.put(`${API_BASE}/api/mapas-mentales/${newMindMapId}`, {
        titulo: `Mapa Mental de ${currentChat.name}`,
        contexto: lastBotMsg.content,
        estructura_json: jsonData,
        conversacion_id: currentChat.conversacionId,
      });

      // Actualizar la conversación para incluir el ID del nuevo mapa mental
      const updatedMapasMentalesIds = [...(currentChat.mapasAsociados || []), { id: newMindMapId, titulo: `Mapa Mental de ${currentChat.name}`, fecha_creacion: new Date() }];
      await axios.put(`${API_BASE}/api/conversaciones/${currentChat.conversacionId}`, {
        chat_history: messages.filter(msg => msg.id !== "welcome"),
        titulo: currentChat.name,
        mapas_mentales_ids: updatedMapasMentalesIds.map(m => m.id),
      });

      // Actualizar el estado del chat en el frontend
      setCurrentChat((prev) => ({
        ...prev,
        mapasAsociados: updatedMapasMentalesIds,
      }));
      setChats((prev) =>
        prev.map((chat) =>
          chat.conversacionId === currentChat.conversacionId
            ? { ...chat, mapasAsociados: updatedMapasMentalesIds }
            : chat
        )
      );

      const newArtifact = {
        id: newMindMapId,
        name: jsonData.respuesta.titulo + ` - ${new Date().toLocaleDateString()}`,
        type: "mindmap",
        icon: "fas fa-project-diagram",
        color: "purple",
        data: jsonData.respuesta.datos,
        createdAt: new Date(),
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
