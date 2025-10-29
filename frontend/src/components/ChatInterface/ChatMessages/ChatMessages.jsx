/**
 * Componente principal ChatMessages completamente modularizado
 * Coordina todos los subcomponentes para una mejor mantenibilidad
 */

import { MessageBubble, EmptyState } from "./components";

/**
 * Componente principal ChatMessages
 * @param {Object} props - Props del componente
 * @param {Array} props.messages - Array de mensajes
 * @param {boolean} props.isTyping - Si el bot está escribiendo
 * @param {boolean} props.isLoadingMessages - Si se están cargando mensajes
 * @param {Function} props.onFeedback - Handler para feedback de mensajes
 * @param {boolean} props.isDarkMode - Modo oscuro activado
 * @param {Function} props.onViewMindMap - Handler para ver mapa mental
 * @param {Function} props.onQuickAction - Handler para acciones rápidas
 * @param {Function} props.onQuoteMessage - Handler para citar mensaje
 */
const ChatMessages = ({
  messages = [],
  isTyping,
  isLoadingMessages = false,
  onFeedback,
  isDarkMode,
  onViewMindMap,
  onQuickAction,
  onQuoteMessage,
}) => {
  
  // Componente de Skeleton para mensajes cargando
  const SkeletonMessage = () => (
    <div className="flex justify-start mb-3">
      <div className="flex max-w-[85%]">
        <div
          className={`rounded-lg px-3 py-2 space-y-2 w-96 ${
            isDarkMode ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <div
            className={`h-3 rounded animate-pulse ${
              isDarkMode ? "bg-gray-700" : "bg-gray-300"
            }`}
            style={{ width: "90%" }}
          />
          <div
            className={`h-3 rounded animate-pulse ${
              isDarkMode ? "bg-gray-700" : "bg-gray-300"
            }`}
            style={{ width: "75%" }}
          />
          <div
            className={`h-3 rounded animate-pulse ${
              isDarkMode ? "bg-gray-700" : "bg-gray-300"
            }`}
            style={{ width: "85%" }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Estado vacío - solo se muestra cuando no hay mensajes y no se está escribiendo */}
      {messages.length === 0 && !isTyping && (
        <EmptyState isDarkMode={isDarkMode} />
      )}

      {/* Renderizado de mensajes */}
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id || index}
          message={message}
          index={index}
          onFeedback={onFeedback}
          onQuickAction={onQuickAction}
          onQuoteMessage={onQuoteMessage}
          onViewMindMap={onViewMindMap}
          isDarkMode={isDarkMode}
        />
      ))}

      {/* Skeleton para carga de mensajes */}
      {isLoadingMessages && <SkeletonMessage />}

      {/* Indicador de escritura */}
      {isTyping && !isLoadingMessages && (
        <div className="flex justify-start mb-3">
          <div className="flex max-w-[85%]">
            <div
              className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                isDarkMode ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                  isDarkMode ? "bg-gray-400" : "bg-gray-500"
                }`}
                style={{ animationDelay: "0s", animationDuration: "1s" }}
              ></div>
              <div
                className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                  isDarkMode ? "bg-gray-400" : "bg-gray-500"
                }`}
                style={{ animationDelay: "0.2s", animationDuration: "1s" }}
              ></div>
              <div
                className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                  isDarkMode ? "bg-gray-400" : "bg-gray-500"
                }`}
                style={{ animationDelay: "0.4s", animationDuration: "1s" }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;