import { useState, useRef } from "react";
import axios from "axios";
import { nanoid } from "nanoid";
import { API_BASE } from "../../config";

export const useChatLogic = (
  documents,
  navigate,
  addArtifact,
  setMessages,
  setInput,
  chatState,
  messages
) => {
  const { currentChat, setCurrentChat, setChats } = chatState;
  const [isTyping, setIsTyping] = useState(false);
  
  const conversacionIdRef = useRef(currentChat.conversacionId);
  const isSendingRef = useRef(false);

  // Actualizar ref cuando cambie currentChat
  if (conversacionIdRef.current !== currentChat.conversacionId) {
    conversacionIdRef.current = currentChat.conversacionId;
  }

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

    if (isSendingRef.current) {
      console.warn("⚠️ Ya hay un mensaje enviándose, ignorando duplicado");
      return;
    }

    isSendingRef.current = true;
    setIsTyping(true);

    const userMsg = createMessage("user", trimmed);
    let updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");

    try {
      // ✅ Enviar al backend, que maneja TODO el guardado
      const conversacionActualId = conversacionIdRef.current;
      
      console.log(`📝 Enviando mensaje... conversacionId: ${conversacionActualId}`);

      const chatResponse = await axios.post("/api/chat", {
        pregunta: trimmed,
        documentos: documents,
        parametros: selectedParameters,
        conversacionId: conversacionActualId, // ← Enviar el ID actual
      });

      let botResponseContent = chatResponse.data.respuesta || "No hay respuesta disponible.";
      const documentosRecomendados = chatResponse.data.documentosRecomendados || [];
      const conversacionId = chatResponse.data.conversacionId; // ← Backend devuelve el ID

      console.log(`✅ Respuesta recibida. conversacionId: ${conversacionId}`);

      const botMsg = {
        id: nanoid(),
        sender: "bot",
        content: botResponseContent,
        timestamp: new Date(),
        documentLinks: documentosRecomendados.length > 0 ? documentosRecomendados : undefined,
        feedbackRequested: true,
      };

      updatedMessages = [...updatedMessages, botMsg];
      setMessages(updatedMessages);

      // ✅ Actualizar el estado local SOLO si es conversación nueva
      const isNewConversation = !conversacionActualId;

      if (isNewConversation) {
        const newChatEntry = {
          id: `conv-${conversacionId}`,
          name: trimmed.substring(0, 50) + (trimmed.length > 50 ? '...' : ''),
          lastMessage: trimmed.substring(0, 50) + (trimmed.length > 50 ? '...' : ''),
          timestamp: new Date(),
          mapasAsociados: [],
          conversacionId: conversacionId,
        };

        // Actualizar refs y estado
        conversacionIdRef.current = conversacionId;
        setCurrentChat(newChatEntry);
        setChats((prev) => [newChatEntry, ...prev]);
        
        console.log("✅ Estado local actualizado - Nueva conversación:", conversacionId);
      } else {
        // Actualizar última mensaje en la lista
        setChats((prev) =>
          prev.map((chat) =>
            chat.conversacionId === conversacionActualId
              ? {
                  ...chat,
                  lastMessage: trimmed.substring(0, 50) + (trimmed.length > 50 ? '...' : ''),
                  timestamp: new Date(),
                }
              : chat
          )
        );
        
        console.log("✅ Estado local actualizado - Conversación existente:", conversacionActualId);
      }

    } catch (err) {
      console.error("❌ Error en sendMessage:", err);
      const errorResponse = getErrorMessage();
      const errorMsg = createMessage("bot", errorResponse, {
        feedbackRequested: true,
      });
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      isSendingRef.current = false;
    }
  };

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

    const conversacionActualId = conversacionIdRef.current;
    if (!conversacionActualId) {
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
        estructura_json: {},
        conversacion_id: conversacionActualId,
      });

      const newMindMapId = res.data.mapa.id;

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

      if (jsonData.respuesta?.mensaje) {
        console.log("✅ " + jsonData.respuesta.mensaje);
      }

      await axios.put(`${API_BASE}/api/mapas-mentales/${newMindMapId}`, {
        titulo: `Mapa Mental de ${currentChat.name}`,
        contexto: lastBotMsg.content,
        estructura_json: jsonData,
        conversacion_id: conversacionActualId,
      });

      const nuevoMapa = {
        id: newMindMapId,
        titulo: `Mapa Mental de ${currentChat.name}`,
        fecha_creacion: new Date()
      };
      
      const updatedMapasMentalesIds = [...(currentChat.mapasAsociados || []), nuevoMapa];

      await axios.put(`${API_BASE}/api/conversaciones/${conversacionActualId}`, {
        chat_history: messages.filter(msg => msg.id !== "welcome"),
        titulo: currentChat.name,
        mapas_mentales_ids: updatedMapasMentalesIds.map(m => m.id),
      });

      setCurrentChat((prev) => ({
        ...prev,
        mapasAsociados: updatedMapasMentalesIds,
      }));

      setChats((prev) =>
        prev.map((chat) =>
          chat.conversacionId === conversacionActualId
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
              }
            : m
        )
      );
    } catch (err) {
      console.error("❌ Error al generar mapa mental:", err);
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