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
export const useConversationLoader = (
  user,
  setChats,
  setMessages,
  addArtifact
) => {
  /**
   * Carga los mensajes de una conversación específica desde el backend
   * @param {number} conversacionId - ID de la conversación a cargar
   */
  const loadConversacionMessages = useCallback(
    async (conversacionId) => {
      console.log('🟣 useConversationLoader.loadConversacionMessages llamado con:', conversacionId);
      try {
        const response = await axios.get(
          `${API_BASE}/api/conversaciones/${conversacionId}`
        );
        console.log('🟣 Respuesta del backend:', response.data);

        if (response.data.success) {
          const conversacion = response.data.conversacion;
          console.log('🟣 Conversación cargada:', conversacion);

          // No añadir mensaje de bienvenida aquí, se gestiona en ChatInterface
          const formattedMessages = conversacion.chat_history.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          console.log('🟣 Mensajes formateados:', formattedMessages);

          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error al cargar mensajes de conversación:", error);
      }
    },
    [setMessages]
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
              mapasAsociados: [], // Inicializar vacío, se llenará después
              conversacionId: conv.id,
            };
          });

          // Cargar detalles de mapas mentales para cada conversación
          const chatsWithMaps = await Promise.all(
            formattedChats.map(async (chat) => {
              const originalConv = conversaciones.find(
                (c) => c.id === chat.conversacionId
              );
              if (
                originalConv &&
                originalConv.mapas_mentales_ids &&
                originalConv.mapas_mentales_ids.length > 0
              ) {
                try {
                  const mapsResponse = await axios.get(
                    `${API_BASE}/api/mapas-mentales/conversacion/${chat.conversacionId}`
                  );
                  if (mapsResponse.data.success) {
                    return { ...chat, mapasAsociados: mapsResponse.data.mapas };
                  }
                } catch (mapError) {
                  console.error(
                    `Error al cargar mapas mentales para conversación ${chat.conversacionId}:`,
                    mapError
                  );
                }
              }
              return chat;
            })
          );

          setChats(chatsWithMaps);

          // Añadir todos los mapas mentales cargados al contexto global de artefactos
          const allMaps = chatsWithMaps.flatMap((chat) =>
            chat.mapasAsociados.map((mapa) => ({
              id: mapa.id,
              name: mapa.titulo || `Mapa Mental de ${chat.name}`,
              type: "mindmap",
              icon: "fas fa-project-diagram",
              color: "purple",
              data:
                mapa.estructura_json?.respuesta?.datos ||
                mapa.estructura_json ||
                mapa.respuesta?.datos ||
                {},
              createdAt: mapa.fecha_creacion,
              description:
                mapa.contexto || "Mapa mental guardado en la base de datos",
            }))
          );
          allMaps.forEach(addArtifact);
        }
      } catch (error) {
        console.error("Error al cargar conversaciones:", error);
      }
    };

    fetchConversaciones();
  }, [user, setChats, addArtifact]);

  return { loadConversacionMessages };
};
