import { useState, useRef, useCallback, useContext } from "react";
import { ChatContext } from "../providers/ChatContext";
import { chatService, createMessage, getErrorMessage } from "../services/chatService";

export const useMessageHandler = () => {
  const [isTyping, setIsTyping] = useState(false);
  const isSendingRef = useRef(false);
  const { setMessages } = useContext(ChatContext);

  const send = useCallback(async (input, options = {}) => {
    const trimmed = input.trim();
    if (!trimmed || isTyping || isSendingRef.current) {
      if (isSendingRef.current)
        console.warn("⚠️ Ya hay un mensaje enviándose, ignorando duplicado");
      return;
    }

    isSendingRef.current = true;
    setIsTyping(true);

    const userMsg = createMessage("user", trimmed, options.quotedMessage ? {
      quotedMessageId: options.quotedMessage.id,
      quotedMessageContent: options.quotedMessage.content,
      quotedMessageSender: options.quotedMessage.sender,
    } : {});

    setMessages((prev) => [...prev, userMsg]);

    try {
      const chatResponse = await chatService.sendMessage({
        pregunta: trimmed,
        documentos: options.documentos || [],
        parametros: options.parametros,
        conversacionId: options.conversacionId,
        quotedMessage: options.quotedMessage ? {
          quotedMessageId: options.quotedMessage.id,
          quotedMessageContent: options.quotedMessage.content,
          quotedMessageSender: options.quotedMessage.sender,
        } : null
      });

      const { respuesta, documentosRecomendados = [], conversacionId } = chatResponse;

      const botMsg = createMessage("bot", respuesta || "No hay respuesta.", {
        documentLinks: documentosRecomendados.length > 0 ? documentosRecomendados : undefined,
        feedbackRequested: true,
      });
      
      setMessages((prev) => [...prev, botMsg]);

      return conversacionId;
    } catch (err) {
      console.error("❌ Error en sendMessage:", err);
      const errorMsg = createMessage("bot", getErrorMessage(), {
        feedbackRequested: true,
      });
      setMessages((prev) => [...prev, errorMsg]);
      return null;
    } finally {
      setIsTyping(false);
      isSendingRef.current = false;
    }
  }, [isTyping, setMessages]);

  const handleFeedback = useCallback(async (messageId, isHelpful, comment = "") => {
    console.log("Feedback enviado:", { messageId, isHelpful, comment });
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedbackRequested: false } : msg
      )
    );
  }, [setMessages]);

  return {
    isTyping,
    send,
    handleFeedback,
  };
};