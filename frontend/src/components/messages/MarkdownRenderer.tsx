import React, { useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * Componente para renderizar contenido markdown de manera segura
 * Convierte markdown a HTML y limpia el contenido para prevenir XSS
 */
interface MarkdownRendererProps {
  content: string;
  isUserMessage?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isUserMessage = false,
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
        // Wrap tables with a responsive wrapper so CSS .table-wrapper applies
        let wrappedHtml = sanitizedContent.replace(
          /<table(.*?)>/gi,
          '<div class="table-wrapper"><table$1>',
        );
        wrappedHtml = wrappedHtml.replace(/<\/table>/gi, "</table></div>");
        setHtmlContent(wrappedHtml);
      } catch (error) {
        console.error("Error al renderizar markdown:", error);
        setHtmlContent(content); // Fallback al texto plano
      }
    };

    renderMarkdown();
  }, [content]);

    return (
      <div
        className={`message-content prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-primary prose-pre:bg-muted prose-code:bg-muted/50 ${
          isUserMessage
            ? "user-message prose-headings:text-white prose-p:text-white prose-strong:text-white prose-em:text-white prose-a:text-white prose-li:text-white"
            : ""
        }`}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
};

export default MarkdownRenderer;
