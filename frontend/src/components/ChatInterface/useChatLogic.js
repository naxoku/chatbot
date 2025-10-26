"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { nanoid } from "nanoid";
import { API_BASE } from "../../config";

/**
 * Hook personalizado para la lógica principal del chat
 *
 * Responsabilidades:
 * - Enviar mensajes al backend y recibir respuestas
 * - Generar mapas mentales basados en el contexto de la conversación
 * - Manejar el feedback del usuario sobre las respuestas
 * - Gestionar el estado de "escribiendo" del bot
 *
 * @param {Array} documents - Lista de documentos disponibles
 * @param {Function} navigate - Función de navegación de React Router
 * @param {Function} addArtifact - Función para añadir artefactos (mapas mentales)
 * @param {Function} setMessages - Función para actualizar los mensajes
 * @param {Function} setInput - Función para actualizar el input
 * @param {Object} chatState - Estado global del chat
 * @param {Array} messages - Lista actual de mensajes
 * @returns {Object} Funciones y estado para la lógica del chat
 */
export const useChatLogic = (
  documents,
  navigate,
  addArtifact,
  setMessages,
  setInput,
  chatState,
  messages
) => {
  // --------------------------------------------------------------------------
  // ESTADO Y REFERENCIAS
  // --------------------------------------------------------------------------

  const { currentChat, setCurrentChat, setChats } = chatState;
  const [isTyping, setIsTyping] = useState(false);

  // Ref para mantener el ID de conversación actualizado sin causar re-renders
  const conversacionIdRef = useRef(currentChat.conversacionId);

  // Ref para prevenir envíos duplicados de mensajes
  const isSendingRef = useRef(false);

  // Sincronizar ref con el estado actual
  if (conversacionIdRef.current !== currentChat.conversacionId) {
    conversacionIdRef.current = currentChat.conversacionId;
  }

  // --------------------------------------------------------------------------
  // UTILIDADES
  // --------------------------------------------------------------------------

  /**
   * Crea un objeto de mensaje con la estructura estándar
   * @param {string} sender - "user" o "bot"
   * @param {string} content - Contenido del mensaje
   * @param {Object} options - Opciones adicionales (feedbackRequested, etc.)
   * @returns {Object} Objeto de mensaje formateado
   */
  const createMessage = (sender, content, options = {}) => ({
    id: nanoid(),
    sender,
    content,
    timestamp: new Date(),
    ...options,
  });

  /**
   * Genera un mensaje de error estándar para mostrar al usuario
   * @returns {string} Mensaje de error formateado en Markdown
   */
  const getErrorMessage = () => {
    return `Hubo un fallo en la conexión con el servidor. Por favor, inténtalo de nuevo más tarde.

Si el problema persiste, puedes contactar directamente a: **ddper@uct.cl**`;
  };

  // --------------------------------------------------------------------------
  // FUNCIÓN PRINCIPAL: ENVIAR MENSAJE
  // --------------------------------------------------------------------------

  /**
   * Envía un mensaje al backend y procesa la respuesta
   *
   * Flujo:
   * 1. Validar que no haya otro mensaje enviándose
   * 2. Añadir mensaje del usuario a la UI
   * 3. Enviar al backend con contexto (documentos, parámetros, conversación)
   * 4. Recibir respuesta y añadirla a la UI
   * 5. Actualizar el estado de la conversación (nueva o existente)
   *
   * @param {string} input - Texto del mensaje a enviar
   * @param {Array} selectedParameters - Parámetros de contexto seleccionados
   */
  const sendMessage = async (input, selectedParameters) => {
    const trimmed = input.trim();

    // Validaciones iniciales
    if (!trimmed || isTyping) return;
    if (isSendingRef.current) {
      console.warn("⚠️ Ya hay un mensaje enviándose, ignorando duplicado");
      return;
    }

    // Marcar como enviando
    isSendingRef.current = true;
    setIsTyping(true);

    // Añadir mensaje del usuario a la UI
    const userMsg = createMessage("user", trimmed);
    let updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");

    try {
      // Obtener ID de conversación actual
      const conversacionActualId = conversacionIdRef.current;

      console.log(
        `📝 Enviando mensaje... conversacionId: ${conversacionActualId}`
      );

      // Enviar al backend
      const chatResponse = await axios.post("/api/chat", {
        pregunta: trimmed,
        documentos: documents,
        parametros: selectedParameters,
        conversacionId: conversacionActualId,
      });

      // Extraer respuesta del backend
      const botResponseContent =
        chatResponse.data.respuesta || "No hay respuesta disponible.";
      const documentosRecomendados =
        chatResponse.data.documentosRecomendados || [];
      const conversacionId = chatResponse.data.conversacionId;

      console.log(`✅ Respuesta recibida. conversacionId: ${conversacionId}`);

      // Crear mensaje del bot con la respuesta
      const botMsg = {
        id: nanoid(),
        sender: "bot",
        content: botResponseContent,
        timestamp: new Date(),
        documentLinks:
          documentosRecomendados.length > 0
            ? documentosRecomendados
            : undefined,
        feedbackRequested: true,
      };

      // Añadir respuesta del bot a la UI
      updatedMessages = [...updatedMessages, botMsg];
      setMessages(updatedMessages);

      // Actualizar estado local según si es conversación nueva o existente
      const isNewConversation = !conversacionActualId;

      if (isNewConversation) {
        // Nueva conversación: crear entrada en la lista y actualizar refs
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
        // Conversación existente: actualizar último mensaje
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
    } catch (err) {
      // Manejo de errores: mostrar mensaje de error al usuario
      console.error("❌ Error en sendMessage:", err);
      const errorResponse = getErrorMessage();
      const errorMsg = createMessage("bot", errorResponse, {
        feedbackRequested: true,
      });
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      // Limpiar flags de estado
      setIsTyping(false);
      isSendingRef.current = false;
    }
  };

  // --------------------------------------------------------------------------
  // FUNCIÓN: GENERAR MAPA MENTAL
  // --------------------------------------------------------------------------

  /**
   * Genera un mapa mental basado en el contexto de la conversación
   *
   * Flujo:
   * 1. Validar que exista contexto (último mensaje del bot)
   * 2. Crear entrada en la base de datos para el mapa mental
   * 3. Enviar contexto al backend para generar la estructura
   * 4. Actualizar la entrada con la estructura generada
   * 5. Asociar el mapa mental a la conversación actual
   * 6. Añadir el mapa a los artefactos y actualizar la UI
   *
   * @param {Array} messages - Lista de mensajes de la conversación
   */
  const generarMapaMental = async (messages) => {
    // Buscar el último mensaje del bot para usar como contexto
    const lastBotMsg = [...messages].reverse().find((m) => m.sender === "bot");

    if (!lastBotMsg) {
      alert("No hay mensaje del bot para generar mapa.");
      return;
    }

    if (!lastBotMsg.content || lastBotMsg.content.trim() === "") {
      alert("El último mensaje del bot no contiene contexto válido.");
      return;
    }

    // Validar que la conversación esté guardada
    const conversacionActualId = conversacionIdRef.current;
    if (!conversacionActualId) {
      alert("Debes guardar la conversación antes de generar un mapa mental.");
      return;
    }

    // Mostrar mensaje de carga en la UI
    const mapMsg = {
      id: nanoid(),
      sender: "bot",
      content: "Generando mapa mental...",
      artifact: true,
    };
    setMessages((prev) => [...prev, mapMsg]);

    try {
      // Paso 1: Crear entrada en la base de datos
      const res = await axios.post(`${API_BASE}/api/mapas-mentales`, {
        titulo: `Mapa Mental de ${currentChat.name}`,
        contexto: lastBotMsg.content,
        estructura_json: {},
        conversacion_id: conversacionActualId,
      });

      const newMindMapId = res.data.mapa.id;

      // Paso 2: Generar estructura del mapa mental
      const mapGenResponse = await axios.post("/api/chat/mapa-mental", {
        contexto: lastBotMsg.content,
      });

      let jsonData = mapGenResponse.data.mapaMental || {};

      // Parsear respuesta si viene como string
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

      // Paso 3: Actualizar entrada con la estructura generada
      await axios.put(`${API_BASE}/api/mapas-mentales/${newMindMapId}`, {
        titulo: `Mapa Mental de ${currentChat.name}`,
        contexto: lastBotMsg.content,
        estructura_json: jsonData,
        conversacion_id: conversacionActualId,
      });

      // Paso 4: Asociar mapa mental a la conversación
      const nuevoMapa = {
        id: newMindMapId,
        titulo: `Mapa Mental de ${currentChat.name}`,
        fecha_creacion: new Date(),
      };

      const updatedMapasMentalesIds = [
        ...(currentChat.mapasAsociados || []),
        nuevoMapa,
      ];

      await axios.put(
        `${API_BASE}/api/conversaciones/${conversacionActualId}`,
        {
          chat_history: messages.filter((msg) => msg.id !== "welcome"),
          titulo: currentChat.name,
          mapas_mentales_ids: updatedMapasMentalesIds.map((m) => m.id),
        }
      );

      // Paso 5: Actualizar estado local
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

      // Paso 6: Añadir a artefactos y actualizar mensaje en la UI
      const newArtifact = {
        id: newMindMapId,
        name:
          jsonData.respuesta.titulo + ` - ${new Date().toLocaleDateString()}`,
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

  // --------------------------------------------------------------------------
  // FUNCIÓN: MANEJAR FEEDBACK
  // --------------------------------------------------------------------------

  /**
   * Maneja el feedback del usuario sobre una respuesta del bot
   *
   * NOTA: Actualmente solo actualiza la UI. El feedback NO se persiste en el backend.
   * TODO: Implementar persistencia del feedback en el backend
   *
   * @param {string} messageId - ID del mensaje que recibe feedback
   * @param {boolean} isHelpful - Si la respuesta fue útil o no
   * @param {string} comment - Comentario opcional del usuario
   */
  const handleFeedback = async (messageId, isHelpful, comment = "") => {
    console.log("Feedback enviado:", { messageId, isHelpful, comment });

    // Actualizar UI para ocultar botones de feedback
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedbackRequested: false } : msg
      )
    );

    // TODO: Enviar feedback al backend para persistencia
    // await axios.post(`${API_BASE}/api/feedback`, { messageId, isHelpful, comment });
  };

  // --------------------------------------------------------------------------
  // FUNCIÓN: MANEJAR ACCIÓN RÁPIDA
  // --------------------------------------------------------------------------

  /**
   * Maneja la selección de una acción rápida
   * Establece el texto de la acción en el input
   *
   * @param {string} text - Texto de la acción rápida
   */
  const handleQuickAction = (text) => setInput(text);

  // --------------------------------------------------------------------------
  // RETORNO DEL HOOK
  // --------------------------------------------------------------------------

  return {
    isTyping,
    sendMessage,
    handleFeedback,
    generarMapaMental,
    handleQuickAction,
  };
};
