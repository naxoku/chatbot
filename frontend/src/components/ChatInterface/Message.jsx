import React from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { renderMindMap } from "../../utils/renderMindMap"; // Ajusta la ruta si es necesario

const Message = ({ msg, onFeedback, isDarkMode }) => {
  // Efecto para renderizar mindmap (solo para artifacts)
  React.useEffect(() => {
    if (msg.artifact && msg.content) {
      try {
        const data = JSON.parse(msg.content);
        renderMindMap(data, `mindmap-${msg.id}`);
      } catch (e) {
        console.error("Error renderizando mapa mental:", e);
      }
    }
  }, [msg.id, msg.artifact, msg.content]);

  if (msg.sender === "user") {
    return (
      <div className="flex justify-end mb-4 px-2 animate-fade-in">
        <div className="flex items-start space-x-3 max-w-md w-auto">
          <div className="bg-blue-600 dark:bg-blue-700 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg break-words word-wrap">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {msg.content}
            </p>
          </div>
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-user text-blue-600 dark:text-blue-400 text-sm"></i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4 px-2 animate-fade-in">
      <div className="flex items-start space-x-3 max-w-2xl w-auto">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <i className="fas fa-robot text-white text-sm"></i>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg break-words word-wrap min-w-0 flex-1">
          {/* Contenido principal */}
          {msg.artifact && msg.content ? (
            <div className="w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-lg relative">
              <div
                id={`mindmap-${msg.id}`}
                className="absolute inset-0 w-full h-full"
              />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(marked(msg.content || "")),
                }}
              />
            </div>
          )}

          {/* Enlaces de documentos */}
          {msg.documentLinks && msg.documentLinks.length > 0 && (
            <div className="space-y-2 mb-3">
              {msg.documentLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-start space-x-2">
                    <i
                      className={`fas ${
                        link.type === "formulario"
                          ? "fa-file-alt"
                          : link.type === "reglamento"
                          ? "fa-gavel"
                          : link.type === "instructivo"
                          ? "fa-book"
                          : link.type === "beneficio"
                          ? "fa-gift"
                          : "fa-file"
                      } text-blue-600 mt-1`}
                    ></i>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {link.title}
                      </h4>
                      {link.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {link.description}
                        </p>
                      )}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 text-sm font-medium"
                      >
                        <span>Ver documento</span>
                        <i className="fas fa-external-link-alt text-xs"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Feedback */}
          {msg.feedbackRequested && (
            <FeedbackButtons messageId={msg.id} onFeedback={onFeedback} />
          )}
        </div>
      </div>
    </div>
  );
};

// Subcomponente anidado para feedback (lo extraeremos en un paso futuro, pero lo ponemos aquí por ahora)
const FeedbackButtons = ({ messageId, onFeedback }) => (
  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
    <span className="text-xs text-gray-500 dark:text-gray-400">
      ¿Te fue útil esta respuesta?
    </span>
    <div className="flex space-x-2">
      <button
        onClick={() => onFeedback(messageId, true)}
        className="text-green-600 hover:text-green-700 text-sm p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
        title="Sí, me fue útil"
        aria-label="Sí, me fue útil"
      >
        <i className="fas fa-thumbs-up"></i>
      </button>
      <button
        onClick={() => onFeedback(messageId, false)}
        className="text-red-600 hover:text-red-700 text-sm p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
        title="No me fue útil"
        aria-label="No me fue útil"
      >
        <i className="fas fa-thumbs-down"></i>
      </button>
    </div>
  </div>
);

export default Message;