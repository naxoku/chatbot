/**
 * Utilidades para el procesamiento y formateo de mensajes
 * Centraliza funciones comunes reutilizables
 */

/**
 * Convierte contenido markdown a texto plano para copiar
 * @param markdownContent Contenido en formato markdown
 * @returns Texto plano sin formato markdown
 */
export const formatMarkdownToPlainText = (markdownContent: string): string => {
  if (!markdownContent) return '';
  
  // Crear un elemento temporal para procesar el markdown
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = markdownContent
    // Remover formato markdown
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Limpiar entidades HTML
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'");
    
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Determina si un mensaje es del sistema
 * @param content Contenido del mensaje
 * @returns true si es un mensaje del sistema
 */
export const isSystemMessage = (content: string): boolean => {
  return content.includes('¡') || content.includes('Hola');
};

/**
 * Determina el tipo de mensaje basado en su contenido
 * @param content Contenido del mensaje
 * @returns Tipo de mensaje: text, command, o question
 */
export const getMessageType = (content: string): "text" | "command" | "question" => {
  if (content.startsWith("/")) return "command";
  if (content.includes("?")) return "question";
  return "text";
};

/**
 * Obtiene el texto formateado del timestamp
 * @param timestamp Fecha del mensaje
 * @returns String formateado con la hora
 */
export const formatMessageTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString();
};

/**
 * Determina el texto del remitente para mensajes citados
 * @param sender Remitente del mensaje citado
 * @returns Texto apropiado según el remitente
 */
export const getQuotedSenderText = (sender: 'user' | 'bot' | undefined): string => {
  switch (sender) {
    case 'user':
      return 'Tú';
    case 'bot':
      return 'Asistente';
    default:
      return 'Usuario';
  }
};

/**
 * Obtiene parámetros basados en el tipo de mensaje
 * @param messageType Tipo de mensaje (text, command, question)
 * @returns Array de parámetros o undefined
 */
export const getMessageParameters = (messageType: "text" | "command" | "question"): string[] | undefined => {
  switch (messageType) {
    case "command":
      return ["comando"];
    case "question":
      return ["pregunta"];
    default:
      return undefined;
  }
};