import React, { useEffect, useRef } from "react";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator"; // Lo crearemos en el siguiente paso

const ChatMessages = ({ messages, isTyping, onFeedback, isDarkMode }) => {
  const chatRef = useRef(null);

  // Scroll automático
  useEffect(() => {
    const scrollToBottom = () => {
      setTimeout(() => {
        chatRef.current?.scrollTo({
          top: chatRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    };
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div
      ref={chatRef}
      className="flex-1 flex flex-col overflow-y-auto py-6 custom-scrollbar px-4"
      style={{ maxHeight: "calc(100vh - 300px)" }}
      role="log"  // Mejora de accesibilidad
      aria-live="polite"
    >
      {messages.map((msg) => (
        <Message
          key={msg.id}
          msg={msg}
          onFeedback={onFeedback}
          isDarkMode={isDarkMode}
        />
      ))}
      {isTyping && <TypingIndicator />}
    </div>
  );
};

export default ChatMessages;