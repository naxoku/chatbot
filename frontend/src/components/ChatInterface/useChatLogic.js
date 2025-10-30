import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { nanoid } from "nanoid";

export const useChatLogic = (
  documents,
  navigate,
  addArtifact,
  setMessages,
  setInput,
  chatState,
  quotedMessage,
  setQuotedMessage
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
      ...(quotedMessage && {
        quotedMessageId: quotedMessage.id,
        quotedMessageContent: quotedMessage.content,
        quotedMessageSender: quotedMessage.sender,
      }),
    });
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setQuotedMessage(null); // Limpiar el mensaje citado después de enviarlo

    try {
      const conversacionActualId = conversacionIdRef.current;
      console.log(
        `📝 Enviando mensaje en modo stream... conversacionId: ${conversacionActualId}`
      );

      // Crear mensaje del bot para actualización progresiva
      const botMsg = createMessage("bot", "", {
        feedbackRequested: true,
      });
      setMessages((prev) => [...prev, botMsg]);

      // Preparar datos para el endpoint SSE
      const requestData = {
        pregunta: trimmed,
        documentos: documents,
        parametros: selectedParameters,
        conversacionId: conversacionActualId,
        ...(quotedMessage && {
          quotedMessageId: quotedMessage.id,
          quotedMessageContent: quotedMessage.content,
          quotedMessageSender: quotedMessage.sender,
        }),
      };

      console.log("🔍 Probando endpoint SSE directamente...");
      
      // Hacer petición al endpoint SSE
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Configurar EventSource para recibir el stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let finalDocumentos = [];
      let finalConversacionId = conversacionActualId;

      try {
        let lastEventType = null; // Variable para rastrear el tipo de evento actual
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              lastEventType = line.slice(7);
            } else if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (lastEventType === 'start') {
                  // Stream iniciado
                } else if (lastEventType === 'chunk') {
                  // Actualizar mensaje con el chunk actual
                  accumulatedText = data.fullText || accumulatedText + (data.text || '');
                  setMessages(prev => prev.map(msg =>
                    msg.id === botMsg.id
                      ? { ...msg, content: accumulatedText }
                      : msg
                  ));
                } else if (lastEventType === 'complete') {
                  // Mensaje completo recibido
                  accumulatedText = data.respuesta || accumulatedText;
                  finalDocumentos = data.documentosRecomendados || [];
                  finalConversacionId = data.conversacionId;
                  
                  // Actualizar mensaje final
                  setMessages(prev => prev.map(msg =>
                    msg.id === botMsg.id
                      ? {
                          ...msg,
                          content: accumulatedText,
                          documentLinks: finalDocumentos.length > 0 ? finalDocumentos : undefined,
                        }
                      : msg
                  ));

                  // Actualizar estado de conversación
                  if (!conversacionActualId && finalConversacionId) {
                    const newChatEntry = {
                      id: `conv-${finalConversacionId}`,
                      name: trimmed.substring(0, 50) + (trimmed.length > 50 ? "..." : ""),
                      lastMessage: trimmed.substring(0, 50) + (trimmed.length > 50 ? "..." : ""),
                      timestamp: new Date(),
                      mapasMentales: [],
                      conversacionId: finalConversacionId,
                    };
                    setCurrentChat(newChatEntry);
                    setChats((prev) => [newChatEntry, ...prev]);
                  } else if (conversacionActualId) {
                    setChats((prev) =>
                      prev.map((chat) =>
                        chat.conversacionId === conversacionActualId
                          ? {
                              ...chat,
                              lastMessage: trimmed.substring(0, 50) + (trimmed.length > 50 ? "..." : ""),
                              timestamp: new Date(),
                            }
                          : chat
                      )
                    );
                  }

                } else if (lastEventType === 'error') {
                  throw new Error(data.message || "Error en el streaming");
                }
              } catch (parseError) {
                console.warn("Error parseando chunk SSE:", parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      return finalConversacionId;
    } catch (err) {
      console.error("❌ Error en sendMessage:", err);
      const errorMsg = createMessage("bot", getErrorMessage(), {
        feedbackRequested: true,
      });
      setMessages((prev) => [...prev, errorMsg]);
      return null;
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
