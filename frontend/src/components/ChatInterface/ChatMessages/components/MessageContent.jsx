/**
 * Componente para renderizar el contenido del mensaje con markdown
 * Maneja la limpieza de HTML y el renderizado seguro
 */

import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * Componente MessageContent
 * @param {Object} props - Props del componente
 * @param {string} props.content - Contenido del mensaje
 * @param {boolean} props.isDarkMode - Modo oscuro activado
 */
const MessageContent = ({ content }) => {
  return (
    <div
      className="message-content"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(marked.parse(content)),
      }}
    />
  );
};

export default MessageContent;