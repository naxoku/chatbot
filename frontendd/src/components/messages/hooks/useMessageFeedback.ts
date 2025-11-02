/**
 * Hook personalizado para el manejo de feedback de mensajes
 * Encapsula la lógica de estado y efectos relacionados con feedback
 */

import { useState, useCallback } from 'react';

interface FeedbackState {
  submitted: boolean;
  isHelpful?: boolean;
}

interface UseMessageFeedbackReturn {
  feedbackStates: Record<string, FeedbackState>;
  handleFeedback: (messageId: string, isHelpful: boolean, comment?: string) => void;
  getFeedbackState: (messageId: string) => FeedbackState | undefined;
}

/**
 * Hook para manejar el estado de feedback de múltiples mensajes
 * @param onFeedback Callback opcional para enviar feedback al backend
 * @returns Objeto con estado y métodos para manejar feedback
 */
export const useMessageFeedback = (
  onFeedback?: (messageId: string, isHelpful: boolean, comment?: string) => void
): UseMessageFeedbackReturn => {
  const [feedbackStates, setFeedbackStates] = useState<Record<string, FeedbackState>>({});

  /**
   * Maneja el envío de feedback para un mensaje específico
   * @param messageId ID del mensaje
   * @param isHelpful Indica si el feedback es positivo
   * @param comment Comentario opcional del usuario
   */
  const handleFeedback = useCallback((
    messageId: string,
    isHelpful: boolean,
    comment = ''
  ) => {
    // Actualizar estado local
    setFeedbackStates((prev) => ({
      ...prev,
      [messageId]: { submitted: true, isHelpful },
    }));

    // Llamar callback externo si existe
    if (onFeedback) {
      onFeedback(messageId, isHelpful, comment);
    }
  }, [onFeedback]);

  /**
   * Obtiene el estado de feedback para un mensaje específico
   * @param messageId ID del mensaje
   * @returns Estado de feedback o undefined si no existe
   */
  const getFeedbackState = useCallback((messageId: string) => {
    return feedbackStates[messageId];
  }, [feedbackStates]);

  return {
    feedbackStates,
    handleFeedback,
    getFeedbackState,
  };
};

export default useMessageFeedback;