import { useState, useRef, useEffect } from "react";
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
  quotedMessage, // Añadir quotedMessage
  setQuotedMessage // Añadir setQuotedMessage
) => {
  const { currentChat, setCurrentChat, setChats } = chatState;
  const [isTyping, setIsTyping] = useState(false);
  const conversacionIdRef = useRef(currentChat.conversacionId);
  const isSendingRef = useRef(false);

  // Sincronizar la referencia si el chat actual cambia
  useEffect(() => {
    conversacionIdRef.current = currentChat.conversacionId;
  }, [currentChat.conversacionId]);

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
    if (!trimmed || isTyping || isSendingRef.current) {
      if (isSendingRef.current)
        console.warn("⚠️ Ya hay un mensaje enviándose, ignorando duplicado");
      return;
    }

    isSendingRef.current = true;
    setIsTyping(true);

    const userMsg = createMessage("user", trimmed, {
      quotedMessage: quotedMessage,
    });
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setQuotedMessage(null); // Limpiar el mensaje citado después de enviarlo

    try {
      const conversacionActualId = conversacionIdRef.current;
      console.log(
        `📝 Enviando mensaje... conversacionId: ${conversacionActualId}`
      );

      const chatResponse = await axios.post("/api/chat", {
        pregunta: trimmed,
        documentos: documents,
        parametros: selectedParameters,
        conversacionId: conversacionActualId,
        quotedMessageId: quotedMessage ? quotedMessage.id : undefined, // Enviar ID del mensaje citado
        quotedMessageContent: quotedMessage ? quotedMessage.content : undefined, // Enviar contenido del mensaje citado
        quotedMessageSender: quotedMessage ? quotedMessage.sender : undefined, // Enviar remitente del mensaje citado
      });

      const {
        respuesta,
        documentosRecomendados = [],
        conversacionId,
      } = chatResponse.data;
      console.log(`✅ Respuesta recibida. conversacionId: ${conversacionId}`);

      const botMsg = createMessage("bot", respuesta || "No hay respuesta.", {
        documentLinks:
          documentosRecomendados.length > 0
            ? documentosRecomendados
            : undefined,
        feedbackRequested: true,
      });
      setMessages((prev) => [...prev, botMsg]);

      if (!conversacionActualId) {
        const newChatEntry = {
          id: `conv-${conversacionId}`,
          name: trimmed.substring(0, 50) + (trimmed.length > 50 ? "..." : ""),
          lastMessage:
            trimmed.substring(0, 50) + (trimmed.length > 50 ? "..." : ""),
          timestamp: new Date(),
          mapasAsociados: [],
          conversacionId: conversacionId,
        };
        conversacionIdRef.current = conversacionId;
        setCurrentChat(newChatEntry);
        setChats((prev) => [newChatEntry, ...prev]);
        console.log(
          "✅ Estado local actualizado - Nueva conversación:",
          conversacionId
        );
      } else {
        setChats((prev) =>
          prev.map((chat) =>
            chat.conversacionId === conversacionActualId
              ? {
                  ...chat,
                  lastMessage:
                    trimmed.substring(0, 50) +
                    (trimmed.length > 50 ? "..." : ""),
                  timestamp: new Date(),
                }
              : chat
          )
        );
        console.log(
          "✅ Estado local actualizado - Conversación existente:",
          conversacionActualId
        );
      }
      return conversacionId; // Devolver el ID
    } catch (err) {
      console.error("❌ Error en sendMessage:", err);
      const errorMsg = createMessage("bot", getErrorMessage(), {
        feedbackRequested: true,
      });
      setMessages((prev) => [...prev, errorMsg]);
      return null; // Devolver null en caso de error
    } finally {
      setIsTyping(false);
      isSendingRef.current = false;
    }
  };

  const generarMapaMental = async (messages, conversacionId) => {
    const lastBotMsg = [...messages].reverse().find((m) => m.sender === "bot");
    if (!lastBotMsg || !lastBotMsg.content.trim()) {
      alert("No hay contexto válido para generar un mapa mental.");
      return;
    }

    if (!conversacionId) {
      alert("La conversación debe guardarse antes de generar un mapa mental.");
      console.error("ID de conversación para asociar mapa:", conversacionId);
      return;
    }

    const mapMsg = createMessage("bot", "Generando mapa mental...", {
      artifact: true,
    });
    setMessages((prev) => [...prev, mapMsg]);

    try {
      console.log(
        "Intentando generar mapa mental. conversacionId:",
        conversacionId
      );
      const mapGenResponse = await axios.post("/api/chat/mapa-mental", {
        contexto: lastBotMsg.content,
        conversacionId: conversacionId,
      });

      const { mapaMental, mensaje } = mapGenResponse.data;
      let jsonData = mapaMental || {};
      if (typeof jsonData === "string") {
        jsonData = JSON.parse(jsonData);
      }

      const nuevoMapa = {
        id: jsonData.id,
        titulo: jsonData.titulo || `Mapa Mental de ${currentChat.name}`,
        fecha_creacion: new Date(jsonData.fecha_creacion),
      };
      const updatedMapasMentalesIds = [
        ...(currentChat.mapasAsociados || []),
        nuevoMapa,
      ];

      setCurrentChat((prev) => ({
        ...prev,
        mapasAsociados: updatedMapasMentalesIds,
      }));
      setChats((prev) =>
        prev.map((chat) =>
          chat.conversacionId === conversacionId
            ? { ...chat, mapasAsociados: updatedMapasMentalesIds }
            : chat
        )
      );

      const newArtifact = {
        id: jsonData.id,
        name:
          (jsonData.titulo || `Mapa Mental de ${currentChat.name}`) +
          ` - ${new Date().toLocaleDateString()}`,
        type: "mindmap",
        icon: "fas fa-project-diagram",
        color: "purple",
        data:
          jsonData.estructura_json?.respuesta?.datos ||
          jsonData.respuesta?.datos ||
          jsonData.datos, // Acceder a la estructura correcta
        createdAt: new Date(jsonData.fecha_creacion),
        description: "Mapa mental guardado en la base de datos",
      };
      addArtifact(newArtifact);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === mapMsg.id
            ? {
                ...m,
                content: mensaje || "Se ha generado un mapa mental.", // Mensaje más descriptivo
                artifact: true, // Asegurar que la bandera de artefacto esté en true
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

  return {
    isTyping,
    sendMessage,
    handleFeedback,
    generarMapaMental,
  };
};
