/**
 * Componente principal para la burbuja del mensaje
 * Coordina todos los subcomponentes del mensaje (parámetros, contenido, artefactos, acciones)
 */

import MessageParameters from "./MessageParameters";
import MessageContent from "./MessageContent";
import MessageArtifacts from "./MessageArtifacts";
import MessageActions from "./MessageActions";

/**
 * Componente MessageBubble
 * @param {Object} props - Props del componente
 * @param {Object} props.message - Objeto del mensaje
 * @param {number} props.index - Índice del mensaje en el array
 * @param {Function} props.onFeedback - Handler para feedback
 * @param {Function} props.onQuickAction - Handler para acciones rápidas
 * @param {Function} props.onQuoteMessage - Handler para citar mensaje
 * @param {Function} props.onViewMindMap - Handler para ver mapa mental
 * @param {boolean} props.isDarkMode - Modo oscuro activado
 */
const MessageBubble = ({ 
  message, 
  index, 
  onFeedback, 
  onQuickAction, 
  onQuoteMessage, 
  onViewMindMap, 
  isDarkMode 
}) => {
  const isUser = message.sender === "user";
  const isContext = message.isContext;

  return (
    <div
      key={message.id || index}
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-3 group`}
    >
      <div
        className={`flex max-w-[85%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div className="flex-1 min-w-0">
          {/* Mensaje citado */}
          {message.quotedMessageId && (
            <div
              className={`mb-2 px-3 py-2 rounded-lg border-l-2 text-xs ${
                isUser
                  ? isDarkMode
                    ? "bg-blue-900/20 border-blue-500 text-blue-300"
                    : "bg-blue-50 border-blue-400 text-blue-700"
                  : isDarkMode
                  ? "bg-gray-800 border-gray-600 text-gray-400"
                  : "bg-gray-100 border-gray-400 text-gray-600"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-medium">
                <i className="fas fa-reply text-xs"></i>
                <span>
                  {message.quotedMessageSender === "user"
                    ? "Tú"
                    : "Asistente"}
                </span>
              </div>
              <p className="line-clamp-2 opacity-80">
                {message.quotedMessageContent || "Contenido no disponible"}
              </p>
            </div>
          )}

          {/* Contenedor principal del mensaje */}
          <div
            className={`rounded-lg px-3 py-2 ${
              isContext
                ? isDarkMode
                  ? "bg-gray-800/50 text-gray-500 italic"
                  : "bg-gray-100 text-gray-500 italic"
                : isUser
                ? isDarkMode
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : isDarkMode
                ? "bg-gray-800 text-gray-100"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            {/* Parámetros del mensaje (no para mensajes de contexto) */}
            {!isContext && (
              <MessageParameters
                parameters={message.parameters || message.responseParameters}
                isUser={isUser}
                isDarkMode={isDarkMode}
              />
            )}

            {/* Contenido del mensaje */}
            <MessageContent content={message.content} />

            {/* Artefactos (documentos y mapas mentales) */}
            <MessageArtifacts
              documentLinks={message.documentLinks}
              artifact={message.artifact}
              artifactData={message.artifactData}
              onViewMindMap={onViewMindMap}
              isUser={isUser}
              isDarkMode={isDarkMode}
            />

            {/* Acciones del mensaje */}
            <MessageActions
              message={message}
              onFeedback={onFeedback}
              onQuickAction={onQuickAction}
              onQuoteMessage={onQuoteMessage}
              isUser={isUser}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;