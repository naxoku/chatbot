/**
 * Hook personalizado para funcionalidad de copiar al portapapeles
 * Encapsula la lógica para copiar texto plano desde contenido markdown
 */

import { useState, useCallback } from 'react';
import { formatMarkdownToPlainText } from '../utils/messageUtils';

interface UseCopyToClipboardReturn {
  copiedMessageId: string | null;
  copyToClipboard: (content: string, messageId: string) => Promise<void>;
  clearCopiedStatus: () => void;
}

/**
 * Hook para manejar la funcionalidad de copiar texto al portapapeles
 * Convierte markdown a texto plano antes de copiar
 * @returns Estado y métodos para copiar texto
 */
export const useCopyToClipboard = (): UseCopyToClipboardReturn => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  /**
   * Copia el contenido al portapapeles como texto plano
   * @param content Contenido a copiar (puede ser markdown)
   * @param messageId ID del mensaje para tracking
   */
  const copyToClipboard = useCallback(async (content: string, messageId: string) => {
    try {
      // Convertir markdown a texto plano
      const plainText = formatMarkdownToPlainText(content);
      
      // Usar Clipboard API moderna
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(plainText);
      } else {
        // Fallback para contextos no seguros o navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = plainText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      // Marcar como copiado temporalmente
      setCopiedMessageId(messageId);
      
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
    }
  }, []);

  /**
   * Limpia el estado de "copiado"
   */
  const clearCopiedStatus = useCallback(() => {
    setCopiedMessageId(null);
  }, []);

  return {
    copiedMessageId,
    copyToClipboard,
    clearCopiedStatus,
  };
};

export default useCopyToClipboard;