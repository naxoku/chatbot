import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import { nanoid } from "nanoid";
import { API_BASE } from "../config";

// Log de configuración
const isDev = import.meta.env.DEV;
if (isDev) {
  console.log("🔧 Modo desarrollo: API_BASE =", API_BASE);
} else {
  console.log(
    "🚀 Modo producción: API_BASE =",
    API_BASE || "(rutas relativas)",
  );
}

// ==================== RETRY HELPER ====================
const MAX_RETRIES = 2;
const RETRY_DELAY = 500; // ms

async function withRetry<T>(
  fn: () => Promise<AxiosResponse<T>>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY,
): Promise<AxiosResponse<T>> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      console.log(
        `🔄 Reintentando petición... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

function isRetryableError(error: unknown): boolean {
  // Type guard para AxiosError
  const isAxiosError = (err: unknown): err is AxiosError => {
    return err !== null && typeof err === "object" && "isAxiosError" in err;
  };

  if (isAxiosError(error)) {
    // Reintentar en errores de red o errores 5xx del servidor
    const response = error.response;
    return (
      !response ||
      (typeof response.status === "number" &&
        response.status >= 500 &&
        response.status < 600)
    );
  }
  return false;
}

// ==================== TYPES ====================
export interface DocumentData {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  url: string;
  keywords?: string[];
}

export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  quotedMessageId?: string;
  quotedMessageContent?: string;
  quotedMessageSender?: "user" | "bot";
  parameters?: string[];
  responseParameters?: string[];
  documentLinks?: DocumentLink[];
  references?: MessageReference[];
  artifact?: boolean;
  artifactData?: Record<string, unknown>;
  artifactError?: boolean;
  artifactOriginalContent?: string;
  artifactOriginalMessageId?: string;
  isContext?: boolean;
}

export interface DocumentLink {
  url: string;
  title: string;
  description?: string;
  type?: string;
}

export interface MessageReference {
  id: string;
  document: {
    id: string;
    title: string;
    type: "pdf" | "docx" | "txt" | "xlsx" | "img" | "other";
    category: string;
    url?: string;
  };
  quote: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  conversacionId?: string;
  mapasAsociados?: string[];
  mapasMentales?: MindMap[];
}

export interface MindMap {
  id: string;
  titulo: string;
  fecha_creacion: Date;
  estructura_json?: unknown;
  contexto?: string;
}

export interface StreamResponse {
  respuesta: string;
  documentosRecomendados: DocumentLink[];
  references?: MessageReference[];
  conversacionId: string;
}

// ==================== BACKEND SERVICE ====================
export class BackendService {
  private static instance: BackendService;

  private constructor() {}

  static getInstance(): BackendService {
    if (!BackendService.instance) {
      BackendService.instance = new BackendService();
    }
    return BackendService.instance;
  }

  // ==================== CHAT METHODS ====================

  /**
   * Envía un mensaje al backend usando Server-Sent Events (SSE)
   * Recibe respuestas progresivas del bot y guarda en DB automáticamente
   */
  async sendMessageWithStreaming(
    input: string,
    conversacionId: string | null,
    quotedMessage: Message | null,
    onChunk: (chunk: string) => void,
    onComplete: (response: StreamResponse) => void,
    onError: (error: string) => void,
    selectedParameters?: string[],
    selectedDocuments?: unknown[],
  ): Promise<void> {
    try {
      console.log("📤 Enviando mensaje con streaming...");
      console.log("   ConversacionId:", conversacionId);
      console.log("   Parámetros:", selectedParameters);
      console.log(
        "   Documentos seleccionados:",
        selectedDocuments?.length || 0,
      );
      console.log("   URL:", `${API_BASE}/api/chat/stream`);

      const requestData = {
        pregunta: input,
        conversacionId,
        parametros: selectedParameters,
        documentosSeleccionados: selectedDocuments || [],
        ...(quotedMessage && {
          quotedMessageId: quotedMessage.id,
          quotedMessageContent: quotedMessage.content,
          quotedMessageSender: quotedMessage.sender,
        }),
      };

      console.log("   Request data:", JSON.stringify(requestData, null, 2));

      const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      console.log("   Response status:", response.status);
      console.log("   Response ok:", response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No se pudo obtener el reader del stream");
      }

      const decoder = new TextDecoder();
      let accumulatedText = "";
      let finalDocumentos: DocumentLink[] = [];
      let finalReferences: MessageReference[] = [];
      let finalConversacionId = conversacionId || "";
      let lastEventType: string | null = null;
      let buffer = ""; // Buffer para manejar líneas divididas

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // Mantener la última línea parcial en el buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            if (trimmedLine.startsWith("event: ")) {
              lastEventType = trimmedLine.slice(7).trim();
            } else if (trimmedLine.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmedLine.slice(6));

                if (lastEventType === "start") {
                  console.log("🟢 Stream iniciado");
                } else if (lastEventType === "chunk") {
                  // Actualizar texto acumulado
                  accumulatedText =
                    data.fullText || accumulatedText + (data.text || "");
                  onChunk(accumulatedText);
                } else if (lastEventType === "complete") {
                  console.log("✅ Stream completado");
                  accumulatedText = data.respuesta || accumulatedText;
                  finalDocumentos = data.documentosRecomendados || [];
                  finalReferences = data.references || [];
                  finalConversacionId = data.conversacionId;

                  console.log(
                    "   Respuesta final:",
                    accumulatedText.substring(0, 100) + "...",
                  );
                  console.log("   ConversacionId final:", finalConversacionId);
                  console.log("   Documentos:", finalDocumentos.length);
                  console.log("   Referencias:", finalReferences.length);

                  onComplete({
                    respuesta: accumulatedText,
                    documentosRecomendados: finalDocumentos,
                    references: finalReferences,
                    conversacionId: finalConversacionId,
                  });
                } else if (lastEventType === "error") {
                  throw new Error(data.message || "Error en el streaming");
                }
              } catch (parseError) {
                console.warn("⚠️ Error parseando chunk SSE:", parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error("❌ Error en sendMessageWithStreaming:", error);
      onError(this.getErrorMessage());
    }
  }

  /**
   * Envía un mensaje sin streaming (fallback)
   */
  async sendMessageSimple(
    input: string,
    conversacionId: string | null,
    quotedMessage: Message | null,
  ): Promise<StreamResponse> {
    try {
      const requestData = {
        pregunta: input,
        conversacionId,
        ...(quotedMessage && {
          quotedMessageId: quotedMessage.id,
          quotedMessageContent: quotedMessage.content,
          quotedMessageSender: quotedMessage.sender,
        }),
      };

      const response = await axios.post(`${API_BASE}/api/chat`, requestData, {
        withCredentials: true,
      });

      return {
        respuesta: response.data.respuesta,
        documentosRecomendados: response.data.documentosRecomendados || [],
        references: response.data.references || [],
        conversacionId: response.data.conversacionId,
      };
    } catch (error) {
      console.error("❌ Error en sendMessageSimple:", error);
      throw error;
    }
  }

  // ==================== CONVERSATION METHODS ====================

  /**
   * Obtiene todas las conversaciones del usuario
   */
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await withRetry(() =>
        axios.get(`${API_BASE}/api/conversaciones`, {
          withCredentials: true,
        }),
      );

      if (response.data.success) {
        return response.data.conversaciones.map((conv: unknown) => {
          const convObj = conv as Record<string, unknown>;
          return {
            id: String(convObj.id),
            conversacionId: String(convObj.id),
            title: String(convObj.titulo),
            lastMessage: this.getLastMessagePreview(
              convObj.chat_history as unknown[],
            ),
            timestamp: new Date(convObj.fecha_creacion as string),
            mapasAsociados: (convObj.mapas_mentales_ids as unknown[]) || [],
          };
        });
      }
      return [];
    } catch (error) {
      console.error("❌ Error al obtener conversaciones:", error);
      return [];
    }
  }

  /**
   * Obtiene una conversación específica con sus mensajes
   */
  async getConversation(conversacionId: string): Promise<Conversation | null> {
    try {
      const response = await withRetry(() =>
        axios.get(`${API_BASE}/api/conversaciones/${conversacionId}`, {
          withCredentials: true,
        }),
      );

      if (response.data.success) {
        const conv = response.data.conversacion;

        // Mapas mentales completos desde el backend
        const mapasCompletos: MindMap[] = (conv.mapas_mentales || []).map(
          (m: Record<string, unknown>) => ({
            id: m.id,
            titulo: m.titulo,
            fecha_creacion: new Date(m.fecha_creacion as string),
            estructura_json: m.estructura_json,
            contexto: m.contexto,
          }),
        );

        return {
          id: conv.id,
          conversacionId: conv.id,
          title: conv.titulo,
          lastMessage: this.getLastMessagePreview(conv.chat_history),
          timestamp: new Date(conv.fecha_creacion),
          mapasAsociados: conv.mapas_mentales_ids || [],
          mapasMentales: mapasCompletos,
        };
      }
      return null;
    } catch (error) {
      console.error("❌ Error al obtener conversación:", error);
      return null;
    }
  }

  /**
   * Obtiene los mensajes de una conversación específica
   */
  async getConversationMessages(conversacionId: string): Promise<Message[]> {
    try {
      console.log("📂 Obteniendo conversación con mensajes:", conversacionId);

      const response = await withRetry(() =>
        axios.get(`${API_BASE}/api/conversaciones/${conversacionId}`, {
          withCredentials: true,
        }),
      );

      if (response.data.success) {
        const conversation = response.data.conversacion;
        const chatHistory = conversation.chat_history || [];

        console.log(
          "📝 Conversación obtenida. Mensajes en history:",
          chatHistory.length,
        );

        // Mapear el chat_history a formato Message
        const messages = chatHistory.map((msg: unknown) => {
          const msgObj = msg as Record<string, unknown>;
          const directDocs =
            (msgObj.documentLinks as DocumentLink[] | undefined) || [];
          const legacyDocs =
            (msgObj.documentos as DocumentLink[] | undefined) || [];

          return {
            id: String(msgObj.id || nanoid()),
            content: String(msgObj.content || ""),
            sender:
              msgObj.sender === "user" ? ("user" as const) : ("bot" as const),
            timestamp: new Date(
              typeof msgObj.timestamp === "string" ||
                typeof msgObj.timestamp === "number"
                ? msgObj.timestamp
                : typeof msgObj.fecha_creacion === "string" ||
                    typeof msgObj.fecha_creacion === "number"
                  ? msgObj.fecha_creacion
                  : Date.now(),
            ),
            quotedMessageId: msgObj.quotedMessageId as string | undefined,
            quotedMessageContent: msgObj.quotedMessageContent as
              | string
              | undefined,
            quotedMessageSender: msgObj.quotedMessageSender as
              | "user"
              | "bot"
              | undefined,
            parameters: (msgObj.parameters as string[]) || [],
            responseParameters: (msgObj.responseParameters as string[]) || [],
            documentLinks: directDocs.length > 0 ? directDocs : legacyDocs,
            references: (msgObj.references as MessageReference[]) || [],
            artifact: Boolean(msgObj.artifact),
            artifactData: msgObj.artifactData as
              | Record<string, unknown>
              | undefined,
            isContext: Boolean(msgObj.isContext),
          };
        });

        console.log("✅ Mensajes procesados:", messages.length);
        return messages;
      }
      return [];
    } catch (error) {
      console.error("❌ Error al obtener conversación con mensajes:", error);
      return [];
    }
  }

  /**
   * Elimina una conversación
   */
  async deleteConversation(conversacionId: string): Promise<boolean> {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/conversaciones/${conversacionId}`,
        { withCredentials: true },
      );
      return response.data.success;
    } catch (error) {
      console.error("❌ Error al eliminar conversación:", error);
      return false;
    }
  }

  /**
   * Renombra una conversación
   */
  async renameConversation(
    conversacionId: string,
    newTitle: string,
  ): Promise<boolean> {
    try {
      const response = await axios.put(
        `${API_BASE}/api/conversaciones/${conversacionId}`,
        { titulo: newTitle },
        { withCredentials: true },
      );
      return response.data.success;
    } catch (error) {
      console.error("❌ Error al renombrar conversación:", error);
      return false;
    }
  }

  /**
   * Actualiza el chat_history de una conversación
   */
  async updateConversationMessages(
    conversacionId: string,
    chatHistory: Message[],
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        `${API_BASE}/api/conversaciones/${conversacionId}`,
        { chat_history: chatHistory },
        { withCredentials: true },
      );
      return response.data.success;
    } catch (error) {
      console.error("❌ Error al actualizar mensajes de conversación:", error);
      return false;
    }
  }

  // ==================== MIND MAP METHODS ====================

  /**
   * Genera un mapa mental
   */
  async generateMindMap(
    contexto: string,
    conversacionId: string,
    titulo?: string,
  ): Promise<MindMap | null> {
    try {
      const response = await axios.post(
        `${API_BASE}/api/chat/mapa-mental`,
        { contexto, conversacionId, titulo },
        { withCredentials: true },
      );

      if (response.data.mapaMental) {
        const mapaMental = response.data.mapaMental;
        return {
          id: mapaMental.id,
          titulo: mapaMental.titulo || titulo || "Mapa Mental",
          fecha_creacion: new Date(mapaMental.fecha_creacion),
          estructura_json: mapaMental.estructura_json || mapaMental,
          contexto,
        };
      }
      return null;
    } catch (error) {
      console.error("❌ Error al generar mapa mental:", error);
      return null;
    }
  }

  /**
   * Obtiene un mapa mental por ID
   */
  async getMindMap(mapaId: string): Promise<MindMap | null> {
    try {
      const response = await axios.get(
        `${API_BASE}/api/mapas-mentales/${mapaId}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        const mapa = response.data.mapa;
        return {
          id: mapa.id,
          titulo: mapa.titulo,
          fecha_creacion: new Date(mapa.fecha_creacion),
          estructura_json: mapa.estructura_json,
          contexto: mapa.contexto,
        };
      }
      return null;
    } catch (error) {
      console.error("❌ Error al obtener mapa mental:", error);
      return null;
    }
  }

  /**
   * Elimina un mapa mental por ID
   */
  async deleteMindMap(mapaId: string): Promise<boolean> {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/mapas-mentales/${mapaId}`,
        { withCredentials: true },
      );
      return response.data.success;
    } catch (error) {
      console.error("❌ Error al eliminar mapa mental:", error);
      return false;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Crea un mensaje con estructura estándar
   */
  createMessage(
    sender: "user" | "bot",
    content: string,
    options: Partial<Message> = {},
  ): Message {
    return {
      id: nanoid(),
      sender,
      content,
      timestamp: new Date(),
      ...options,
    };
  }

  /**
   * Obtiene un mensaje de error estándar
   */
  private getErrorMessage(): string {
    return `Hubo un fallo en la conexión con el servidor. Por favor, inténtalo de nuevo más tarde.

Si el problema persiste, puedes contactar directamente a: **ddper@uct.cl**`;
  }

  /**
   * Obtiene un preview del último mensaje
   */
  private getLastMessagePreview(chatHistory: unknown[]): string {
    if (!chatHistory || chatHistory.length === 0) return "";

    const lastMsg = chatHistory[chatHistory.length - 1] as Record<
      string,
      unknown
    >;
    const content = String(lastMsg.content || "");
    return content.substring(0, 50) + (content.length > 50 ? "..." : "");
  }
}

// Exportar instancia singleton
export const backendService = BackendService.getInstance();
