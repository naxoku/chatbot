import { useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE } from "../config.js";

/**
 * Hook personalizado para cargar conversaciones desde el backend
 *
 * Responsabilidades:
 * - Cargar el historial de conversaciones del usuario
 * - Transformar las conversaciones al formato del frontend
 * - Cargar los mensajes de una conversación específica
 *
 * @param {Object} user - Datos del usuario actual
 * @param {Function} setChats - Función para actualizar la lista de conversaciones
 * @param {Function} setMessages - Función para actualizar los mensajes del chat
 * @returns {Object} Funciones para cargar conversaciones
 */
export const useConversationLoader = (user, setChats, setMessages) => {
  /**
   * Carga los mensajes de una conversación específica desde el backend
   * @param {number} conversacionId - ID de la conversación a cargar
   */
  const loadConversacionMessages = useCallback(
    async (conversacionId) => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/conversaciones/${conversacionId}`
        );

        if (response.data.success) {
          const conversacion = response.data.conversacion;

          // Mensaje de bienvenida siempre al inicio
          const welcomeMessage = {
            id: "welcome",
            sender: "bot",
            content: `¡Hola **${user.name}**! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?`,
            timestamp: new Date(),
            feedbackRequested: false,
          };

          // Combinar mensaje de bienvenida con historial y ordenar por timestamp
          const formattedMessages = [
            welcomeMessage,
            ...conversacion.chat_history,
          ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error al cargar mensajes de conversación:", error);
      }
    },
    [user?.name, setMessages]
  );

  /**
   * Efecto para cargar el historial de conversaciones al iniciar sesión
   */
  useEffect(() => {
    if (!user) return;

    const fetchConversaciones = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/conversaciones`);

        if (response.data.success) {
          const conversaciones = response.data.conversaciones;

          // Transformar conversaciones al formato esperado por el sidebar
          const formattedChats = conversaciones.map((conv) => {
            const lastMessage =
              conv.chat_history && conv.chat_history.length > 0
                ? conv.chat_history[conv.chat_history.length - 1].content
                : "Sin mensajes";

            return {
              id: `conv-${conv.id}`,
              name: conv.titulo || `Conversación ${conv.id}`,
              lastMessage:
                lastMessage.substring(0, 50) +
                (lastMessage.length > 50 ? "..." : ""),
              timestamp: conv.fecha_creacion,
              mapasAsociados: conv.mapas_asociados || [],
              conversacionId: conv.id,
            };
          });

          setChats(formattedChats);
        }
      } catch (error) {
        console.error("Error al cargar conversaciones:", error);
      }
    };

    fetchConversaciones();
  }, [user, setChats]);

  return { loadConversacionMessages };
};
