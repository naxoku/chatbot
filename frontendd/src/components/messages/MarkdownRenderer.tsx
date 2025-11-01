import React, { useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * Componente para renderizar contenido markdown de manera segura
 * Convierte markdown a HTML y limpia el contenido para prevenir XSS
 */
interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    // Configurar marked con opciones seguras
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    // Manejar el Promise que devuelve marked.parse
    const renderMarkdown = async () => {
      try {
        const parsedContent = await marked.parse(content);
        const sanitizedContent = DOMPurify.sanitize(parsedContent);
        setHtmlContent(sanitizedContent);
      } catch (error) {
        console.error("Error al renderizar markdown:", error);
        setHtmlContent(content); // Fallback al texto plano
      }
    };

    renderMarkdown();
  }, [content]);

  return (
    <div
      className="message-content prose prose-sm max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;
