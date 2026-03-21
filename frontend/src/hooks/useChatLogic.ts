import { useState, useRef, useCallback, useEffect } from "react";
import {
  backendService,
  type Message,
  type Conversation,
  type StreamResponse,
} from "@/services/backendService";

interface UseChatLogicProps {
  currentChat: Conversation | null;
  setCurrentChat: React.Dispatch<React.SetStateAction<Conversation | null>>;
  setChats: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  quotedMessage: Message | null;
  setQuotedMessage: React.Dispatch<React.SetStateAction<Message | null>>;
}

export const useChatLogic = ({
  currentChat,
  setCurrentChat,
  setChats,
  setMessages,
  setInput,
  quotedMessage,
  setQuotedMessage,
}: UseChatLogicProps) => {
  const [isTyping, setIsTyping] = useState(false);

  // REF para mantener el ID de la conversación actual
  const conversacionIdRef = useRef<string | null>(
    currentChat?.conversacionId || null,
  );
  const isSendingRef = useRef(false);

  // Ref para rastrear el mapa mental que se está generando actualmente
  const generatingMindMapRef = useRef<{
    messageId: string;
    mapaId?: string;
    conversacionId: string;
  } | null>(null);

  // Sincronizar el ref cuando cambia currentChat
  useEffect(() => {
    conversacionIdRef.current = currentChat?.conversacionId || null;
    console.log("🔄 ConversacionId actualizado:", conversacionIdRef.current);
  }, [currentChat?.conversacionId]);

  // ==================== SEND MESSAGE ====================
  /**
   * Envía un mensaje al backend con streaming SSE
   * El backend se encarga de guardar automáticamente en la DB
   */
  const sendMessage = useCallback(
    async (
      input: string,
      selectedParameters?: string[],
      selectedDocuments?: unknown[],
    ): Promise<string | null> => {
      const trimmed = input.trim();

      // ===== VALIDACIONES =====
      if (!trimmed) {
        console.warn("⚠️ Mensaje vacío, ignorando");
        return null;
      }

      if (isTyping) {
        console.warn("⚠️ Bot está escribiendo, esperando");
        return null;
      }

      if (isSendingRef.current) {
        console.warn("⚠️ Ya hay un mensaje enviándose, ignorando duplicado");
        return null;
      }

      console.log("📨 ===== ENVIANDO MENSAJE =====");
      console.log("   Input:", trimmed.substring(0, 50) + "...");
      console.log("   ConversacionId actual:", conversacionIdRef.current);
      console.log("   Parámetros:", selectedParameters);
      console.log(
        "   Documentos seleccionados:",
        selectedDocuments?.length || 0,
      );
      console.log("   Mensaje citado:", quotedMessage?.id || "ninguno");

      // Bloquear envíos duplicados
      isSendingRef.current = true;
      setIsTyping(true);

      try {
        // ===== CREAR MENSAJE DEL USUARIO =====
        const userMsg = backendService.createMessage("user", trimmed, {
          parameters: selectedParameters,
          ...(quotedMessage && {
            quotedMessageId: quotedMessage.id,
            quotedMessageContent: quotedMessage.content,
            quotedMessageSender: quotedMessage.sender,
          }),
        });

        console.log("✅ Mensaje del usuario creado:", userMsg.id);

        // Agregar mensaje del usuario a la UI
        setMessages((prev) => {
          const newMessages = [...prev, userMsg];
          console.log(
            "📝 Total mensajes después de agregar usuario:",
            newMessages.length,
          );
          return newMessages;
        });

        // Limpiar input y mensaje citado
        setInput("");
        setQuotedMessage(null);

        // ===== CREAR MENSAJE PLACEHOLDER DEL BOT =====
        const botMsg = backendService.createMessage("bot", "");

        console.log("✅ Mensaje placeholder del bot creado:", botMsg.id);

        // Agregar mensaje placeholder del bot
        setMessages((prev) => {
          const newMessages = [...prev, botMsg];
          console.log(
            "📝 Total mensajes después de agregar bot placeholder:",
            newMessages.length,
          );
          return newMessages;
        });

        // ===== VARIABLES PARA TRACKING =====
        const conversacionActualId = conversacionIdRef.current;
        let finalConversacionId = conversacionActualId;
        let chunkCount = 0;

        console.log("🚀 Iniciando streaming SSE...");

        // ===== ENVIAR MENSAJE CON STREAMING =====
        await backendService.sendMessageWithStreaming(
          trimmed,
          conversacionActualId,
          quotedMessage,

          // ===== onChunk: Actualización progresiva =====
          (chunk: string) => {
            chunkCount++;
            if (chunkCount % 5 === 0) {
              // Log cada 5 chunks para no saturar
              console.log(
                `📊 Chunk ${chunkCount} recibido (${chunk.length} chars)`,
              );
            }

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMsg.id ? { ...msg, content: chunk } : msg,
              ),
            );
          },

          // ===== onComplete: Respuesta final =====
          (response: StreamResponse) => {
            console.log("✅ ===== STREAMING COMPLETADO =====");
            console.log("   Total chunks recibidos:", chunkCount);
            console.log(
              "   Respuesta final length:",
              response.respuesta.length,
            );
            console.log(
              "   Documentos:",
              response.documentosRecomendados.length,
            );
            console.log("   ConversacionId recibido:", response.conversacionId);

            finalConversacionId = response.conversacionId;

            // Actualizar mensaje del bot con respuesta final
            setMessages((prev) => {
              const updated = prev.map((msg) =>
                msg.id === botMsg.id
                  ? {
                      ...msg,
                      content: response.respuesta,
                      documentLinks:
                        response.documentosRecomendados.length > 0
                          ? response.documentosRecomendados
                          : undefined,
                      references:
                        (response.references?.length || 0) > 0
                          ? response.references
                          : undefined,
                    }
                  : msg,
              );
              console.log("📝 Mensaje del bot actualizado con respuesta final");
              return updated;
            });

            // ===== ACTUALIZAR ESTADO DE CONVERSACIONES =====
            console.log("🔄 Actualizando estado de conversaciones...");

            if (!conversacionActualId && finalConversacionId) {
              // ===== NUEVA CONVERSACIÓN =====
              console.log("🆕 Creando nueva conversación en el estado");

              const newChatEntry: Conversation = {
                id: finalConversacionId,
                conversacionId: finalConversacionId,
                title:
                  trimmed.substring(0, 50) + (trimmed.length > 50 ? "..." : ""),
                lastMessage:
                  trimmed.substring(0, 50) + (trimmed.length > 50 ? "..." : ""),
                timestamp: new Date(),
                mapasMentales: [],
              };

              console.log("   Nueva conversación:", newChatEntry);

              // Actualizar currentChat
              setCurrentChat(newChatEntry);

              // Agregar a la lista de chats
              setChats((prev) => {
                const updated = [newChatEntry, ...prev];
                console.log(
                  "   Total chats después de agregar:",
                  updated.length,
                );
                return updated;
              });

              // Actualizar ref
              conversacionIdRef.current = finalConversacionId;
              console.log(
                "   ConversacionIdRef actualizado a:",
                finalConversacionId,
              );
            } else if (conversacionActualId) {
              // ===== ACTUALIZAR CONVERSACIÓN EXISTENTE =====
              console.log(
                "🔄 Actualizando conversación existente:",
                conversacionActualId,
              );

              setChats((prev) => {
                const updated = prev.map((chat) =>
                  chat.conversacionId === conversacionActualId
                    ? {
                        ...chat,
                        lastMessage:
                          trimmed.substring(0, 50) +
                          (trimmed.length > 50 ? "..." : ""),
                        timestamp: new Date(),
                      }
                    : chat,
                );
                console.log("   Conversación actualizada en la lista");
                return updated;
              });
            }

            console.log(
              "✅ Estado de conversaciones actualizado correctamente",
            );
          },

          // ===== onError: Manejo de errores =====
          (errorMessage: string) => {
            console.error("❌ Error en el streaming:", errorMessage);

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMsg.id
                  ? { ...msg, content: errorMessage }
                  : msg,
              ),
            );
          },
          selectedParameters,
          selectedDocuments,
        );

        console.log("✅ ===== MENSAJE ENVIADO EXITOSAMENTE =====");
        console.log("   ConversacionId final:", finalConversacionId);

        return finalConversacionId;
      } catch (error) {
        console.error("❌ ===== ERROR AL ENVIAR MENSAJE =====");
        console.error("   Error:", error);

        const errorMsg = backendService.createMessage(
          "bot",
          backendService["getErrorMessage"](),
        );

        setMessages((prev) => [...prev, errorMsg]);

        return null;
      } finally {
        console.log("🔚 Limpiando estados...");
        setIsTyping(false);
        isSendingRef.current = false;
        console.log("✅ Estados limpiados");
      }
    },
    [
      isTyping,
      quotedMessage,
      setMessages,
      setInput,
      setQuotedMessage,
      setCurrentChat,
      setChats,
    ],
  );

  // ==================== GENERATE MIND MAP ====================
  /**
   * Genera un mapa mental basado en el contenido específico del mensaje
   * @param contenidoMensaje - El contenido específico del mensaje desde donde se activó la acción
   * @param conversacionId - ID de la conversación actual
   * @param originalMessageId - ID del mensaje original del bot que se usó como base
   */
  const generarMapaMental = useCallback(
    async (
      contenidoMensaje: string,
      conversacionId: string,
      originalMessageId?: string,
    ): Promise<string | null> => {
      console.log("🧠 ===== GENERANDO MAPA MENTAL =====");
      console.log("   ConversacionId:", conversacionId);
      console.log(
        "   Contenido del mensaje específico:",
        contenidoMensaje.substring(0, 100) + "...",
      );
      console.log("   Original MessageId:", originalMessageId || "no proporcionado");

      if (!conversacionId) {
        console.error("❌ No hay conversacionId");
        alert(
          "La conversación debe guardarse antes de generar un mapa mental.",
        );
        return null;
      }

      // Usar el contenido específico del mensaje
      const contextoCompleto = contenidoMensaje.trim();

      if (!contextoCompleto) {
        console.warn("⚠️ No hay contexto válido en el mensaje");
        alert("No hay contenido en el mensaje para generar un mapa mental.");
        return null;
      }

      console.log(
        "   Contexto a usar:",
        contextoCompleto.substring(0, 200) + "...",
      );
      console.log("   Total caracteres:", contextoCompleto.length);

      // Crear mensaje de loading con artifactData que puede incluir título preliminar
      const mapMsg = backendService.createMessage(
        "bot",
        "Generando mapa mental...",
        {
          artifact: true,
          artifactOriginalMessageId: originalMessageId,
        },
      );
      setMessages((prev) => [...prev, mapMsg]);

      // Guardar referencia del mensaje que se está generando
      generatingMindMapRef.current = {
        messageId: mapMsg.id,
        conversacionId,
      };

      try {
        const mapaMental = await backendService.generateMindMap(
          contextoCompleto,
          conversacionId,
          `Mapa Mental de ${currentChat?.title || "Conversación"}`,
        );

        // Verificar si fue cancelado mientras se generaba
        if (generatingMindMapRef.current?.messageId !== mapMsg.id) {
          console.log("⚠️ Generación de mapa mental fue cancelada");
          return null;
        }

        if (!mapaMental) {
          throw new Error("No se pudo generar el mapa mental");
        }

        // Verificar si fue cancelado después de la generación
        if (generatingMindMapRef.current?.messageId !== mapMsg.id) {
          console.log("⚠️ Generación de mapa mental fue cancelada después de obtener respuesta");
          // Limpiar de la DB si ya se guardó
          await backendService.deleteMindMap(mapaMental.id);
          return null;
        }

        // Actualizar la referencia con el ID del mapa
        generatingMindMapRef.current = {
          messageId: mapMsg.id,
          mapaId: mapaMental.id,
          conversacionId,
        };

        console.log("✅ Mapa mental generado:", mapaMental.id);

        // Actualizar chat con nuevo mapa (usar mapasMentales para objetos completos)
        const updatedMapas = [
          ...(currentChat?.mapasMentales || []),
          mapaMental,
        ];

        setCurrentChat((prev) =>
          prev
            ? {
                ...prev,
                mapasMentales: updatedMapas,
              }
            : null,
        );

        setChats((prev) =>
          prev.map((chat) =>
            chat.conversacionId === conversacionId
              ? { ...chat, mapasMentales: updatedMapas }
              : chat,
          ),
        );

        // Construir datos del artefacto y actualizar el mensaje
        const estructuraData = mapaMental.estructura_json as
          | Record<string, unknown>
          | undefined;
        
        // Normalizar datos: soportar múltiples formatos de n8n
        let normalizedData;
        if (estructuraData?.respuesta) {
          const respuestaData = estructuraData.respuesta as Record<string, unknown>;
          // Caso 1: respuesta.respuesta.datos (doble anidamiento - legacy)
          if (respuestaData.respuesta) {
            normalizedData = (respuestaData.respuesta as Record<string, unknown>)?.datos;
          }
          // Caso 2: respuesta.datos (formato esperado)
          else if (respuestaData.datos) {
            normalizedData = respuestaData.datos;
          }
          // Caso 3: respuesta es directamente los datos
          else {
            normalizedData = respuestaData;
          }
        }
        // Caso 4: estructura_json.datos (sin wrapper respuesta)
        else if (estructuraData?.datos) {
          normalizedData = estructuraData.datos;
        }
        // Caso 5: estructura_json es directamente los datos
        else {
          normalizedData = estructuraData;
        }
        
        const newArtifact = {
          id: mapaMental.id,
          name: mapaMental.titulo,
          type: "mindmap",
          icon: "fas fa-project-diagram",
          color: "purple",
          data: normalizedData,
          createdAt: mapaMental.fecha_creacion,
          description: "Mapa mental generado",
          conversacionId,
        };

        // Actualizar mensaje con el artefacto
        const updatedArtifactMsg = {
          ...mapMsg,
          content: "Se ha generado un mapa mental.",
          artifact: true as const,
          artifactData: newArtifact,
        };

        setMessages((prev) =>
          prev.map((m) => (m.id === mapMsg.id ? updatedArtifactMsg : m)),
        );

        // Agregar el mensaje del mapa mental al chat_history del backend
        const currentMessages =
          await backendService.getConversationMessages(conversacionId);
        currentMessages.push(updatedArtifactMsg);

        const saved = await backendService.updateConversationMessages(
          conversacionId,
          currentMessages,
        );
        if (saved) {
          console.log("✅ Historial guardado en backend con mapa mental");
        } else {
          console.error("❌ No se pudo guardar el historial en backend");
        }

        // Limpiar referencia
        generatingMindMapRef.current = null;

        console.log("✅ ===== MAPA MENTAL COMPLETADO =====");
        return mapMsg.id;
      } catch (error: unknown) {
        console.error("❌ Error al generar mapa mental:", error);

        // Verificar si fue cancelado
        if (generatingMindMapRef.current?.messageId !== mapMsg.id) {
          console.log("⚠️ Generación de mapa mental fue cancelada");
          return null;
        }

        let errorMessage = "Error desconocido";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        // Marcar como error (no completed) para permitir reintento
        setMessages((prev) =>
          prev.map((m) =>
            m.id === mapMsg.id
              ? {
                  ...m,
                  content: `Error al generar mapa mental: ${errorMessage}`,
                  artifact: true,
                  artifactError: true,
                  artifactOriginalContent: contextoCompleto,
                  artifactOriginalMessageId: originalMessageId,
                }
              : m,
          ),
        );

        // Limpiar referencia
        generatingMindMapRef.current = null;

        return null;
      }
    },
    [currentChat, setCurrentChat, setChats, setMessages],
  );

  /**
   * Cancela la generación del mapa mental en curso
   */
  const cancelarMapaMental = useCallback(async (messageId: string): Promise<void> => {
    console.log("🚫 ===== CANCELANDO MAPA MENTAL =====");
    console.log("   MessageId:", messageId);

    const current = generatingMindMapRef.current;
    if (!current || current.messageId !== messageId) {
      console.log("⚠️ No hay mapa mental en generación o ID no coincide");
      return;
    }

    // Eliminar el mensaje de la UI
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    // Si ya se generó y tiene ID, eliminar de la DB
    if (current.mapaId) {
      console.log("🗑️ Eliminando mapa mental de la DB:", current.mapaId);
      await backendService.deleteMindMap(current.mapaId);

      // Actualizar estado local
      setCurrentChat((prev) =>
        prev
          ? {
              ...prev,
              mapasMentales: (prev.mapasMentales || []).filter(
                (m) => m.id !== current.mapaId,
              ),
            }
          : null,
      );

      setChats((prev) =>
        prev.map((chat) =>
          chat.conversacionId === current.conversacionId
            ? {
                ...chat,
                mapasMentales: (chat.mapasMentales || []).filter(
                  (m) => m.id !== current.mapaId,
                ),
              }
            : chat,
        ),
      );
    }

    // Limpiar referencia
    generatingMindMapRef.current = null;

    console.log("✅ ===== MAPA MENTAL CANCELADO =====");
  }, [setMessages, setCurrentChat, setChats]);

  /**
   * Reintenta la generación de un mapa mental que falló
   */
  const reintentarMapaMental = useCallback(
    async (
      contenidoMensaje: string,
      conversacionId: string,
      oldMessageId: string,
    ): Promise<string | null> => {
      console.log("🔁 ===== REINTENTANDO MAPA MENTAL =====");
      console.log("   OldMessageId:", oldMessageId);

      // Eliminar el mensaje de error
      setMessages((prev) => prev.filter((m) => m.id !== oldMessageId));

      // Generar nuevo mapa mental
      return generarMapaMental(contenidoMensaje, conversacionId);
    },
    [generarMapaMental, setMessages],
  );

  // ==================== LOAD CONVERSATION ====================
  const loadConversation = useCallback(
    async (conversacionId: string): Promise<void> => {
      console.log("📂 Cargando conversación:", conversacionId);

      try {
        const conversation =
          await backendService.getConversation(conversacionId);

        if (conversation) {
          setCurrentChat(conversation);
          conversacionIdRef.current = conversacionId;
          console.log("✅ Conversación cargada");
        }
      } catch (error) {
        console.error("❌ Error al cargar conversación:", error);
      }
    },
    [setCurrentChat],
  );

  return {
    isTyping,
    sendMessage,
    generarMapaMental,
    cancelarMapaMental,
    reintentarMapaMental,
    loadConversation,
    conversacionIdRef,
  };
};

// Hook personalizado para manejar conversaciones
export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  const loadConversations = useCallback(async (): Promise<void> => {
    console.log("📂 Cargando todas las conversaciones...");
    setIsLoadingConversations(true);

    try {
      const loadedConversations = await backendService.getConversations();
      console.log("✅ Conversaciones cargadas:", loadedConversations.length);

      setConversations(loadedConversations);
    } catch (error) {
      console.error("❌ Error al cargar conversaciones:", error);
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  const loadConversationMessages = useCallback(
    async (conversacionId: string): Promise<Message[]> => {
      console.log("📂 Cargando mensajes de conversación:", conversacionId);

      try {
        const messages =
          await backendService.getConversationMessages(conversacionId);
        console.log("✅ Mensajes cargados:", messages.length);
        return messages;
      } catch (error) {
        console.error("❌ Error al cargar mensajes de conversación:", error);
        return [];
      }
    },
    [],
  );

  return {
    conversations,
    isLoadingConversations,
    loadConversations,
    loadConversationMessages,
    setConversations,
  };
};
