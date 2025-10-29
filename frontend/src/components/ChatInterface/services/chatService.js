import axios from "axios";
import { nanoid } from "nanoid";

export const chatService = {
  async sendMessage({ pregunta, documentos, parametros, conversacionId, quotedMessage }) {
    const response = await axios.post("/api/chat", {
      pregunta,
      documentos,
      parametros,
      conversacionId,
      ...quotedMessage
    });
    return response.data;
  },

  async delete(conversacionId) {
    const response = await axios.delete(`/api/conversaciones/${conversacionId}`);
    return response.data;
  },

  async rename(conversacionId, name) {
    const response = await axios.put(`/api/conversaciones/${conversacionId}`, {
      nombre: name
    });
    return response.data;
  },

  async getConversations() {
    const response = await axios.get('/api/conversaciones');
    return response.data;
  },

  async generateMindMap({ contexto, conversacionId }) {
    const response = await axios.post("/api/chat/mapa-mental", {
      contexto,
      conversacionId,
    });
    return response.data;
  },

  async getMindMap(mapaId) {
    const response = await axios.get(`/api/mapas-mentales/${mapaId}`);
    return response.data;
  }
};

export const createMessage = (sender, content, options = {}) => ({
  id: nanoid(),
  sender,
  content,
  timestamp: new Date(),
  ...options,
});

export const getErrorMessage = () => {
  return `Hubo un fallo en la conexión con el servidor. Por favor, inténtalo de nuevo más tarde.

Si el problema persiste, puedes contactar directamente a: **ddper@uct.cl**`;
};