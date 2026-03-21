import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import MessageActions from "./MessageActions";
import MessageArtifacts from "./MessageArtifacts";
import MessageParameters from "./MessageParameters";
import MessageQuickActions from "./MessageQuickActions";
import BotReferencesAccordion from "./BotReferencesAccordion";
import { quickActions } from "../config/quickActions";
import { type QuickAction } from "../config/quickActions";
import type { Message } from "../../services/backendService";
import { Brain, Sparkles, X, RotateCcw, AlertCircle, FileText } from "lucide-react";
import {
  getQuotedSenderText,
  formatMessageTimestamp,
} from "./utils/messageUtils";

interface BotMessageProps {
  message: Message;
  onQuickAction?: (action: QuickAction, message: Message) => void;
  onQuoteMessage?: (message: Message) => void;
  onViewMindMap?: (artifactData: unknown) => void;
  onRetry?: (message: Message) => void;
  onCancelMindMap?: (messageId: string) => void;
  onRetryMindMap?: (message: Message, originalContent: string) => void;
  onFocusMessage?: (messageId: string) => void;
  isHighlighted?: boolean;
}

/**
 * Componente para el mensaje citado
 */
interface QuotedMessageProps {
  message: Message;
}

const QuotedMessage: React.FC<QuotedMessageProps> = ({ message }) => {
  if (!message.quotedMessageId) return null;

  return (
     <div className="mb-2 rounded-xl border border-muted/30 bg-muted/10 px-3 py-2 text-xs text-muted-foreground dark:border-muted/60 dark:text-muted-foreground/60">
      <div className="mb-1 flex items-center gap-1.5 font-medium">
        <i className="fas fa-reply text-xs" />
        <span>{getQuotedSenderText(message.quotedMessageSender)}</span>
      </div>
      <p className="line-clamp-2 opacity-80">
        {message.quotedMessageContent || "Contenido no disponible"}
      </p>
    </div>
  );
};

export const BotMessage: React.FC<BotMessageProps> = ({
  message,
  onQuickAction,
  onQuoteMessage,
  onViewMindMap,
  onRetry,
  onCancelMindMap,
  onRetryMindMap,
  onFocusMessage,
  isHighlighted = false,
}) => {
  const messageReferences = React.useMemo(
    () => message.references || [],
    [message.references],
  );

  const showLegacyDocumentList = false;

  // Detectar si está esperando respuesta (placeholder vacío)
  const isThinking = message.content === "" && !message.artifact;

  // Detectar si es un mensaje de generación de mapa mental
  const isGeneratingMindMap =
    message.content === "Generando mapa mental..." && message.artifact && !message.artifactError;

  // Detectar si es un mensaje de error de mapa mental
  const isMindMapError =
    message.artifact && message.artifactError;

  // Detectar si es un mensaje final de mapa mental generado
  const isMindMapGenerated =
    message.content === "Se ha generado un mapa mental." &&
    message.artifact &&
    message.artifactData &&
    !message.artifactError;

  // Extraer el contenido original usado para generar el mapa mental
  const getOriginalContent = (): string => {
    if (message.artifactOriginalContent) {
      return message.artifactOriginalContent;
    }
    return "";
  };

  // Si está pensando, mostrar animación de espera
  if (isThinking) {
    return (
      <div data-message-id={message.id} className="group/msg mb-8 flex animate-in fade-in slide-in-from-bottom-2 justify-center px-4 duration-500">
        <div className="w-full max-w-3xl">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
              Asistente VRAE
            </span>
          </div>

          <div className="inline-flex min-w-[56px] items-center gap-1.5 rounded-tl-lg rounded-tr-lg rounded-br-md bg-muted p-4">
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  // Si es un mensaje de generación de mapa mental, mostrar con animación de barrido
  if (isGeneratingMindMap) {
    const handleCancel = () => {
      onCancelMindMap?.(message.id);
    };

    // Extraer título del artifactData si está disponible
    const extractTitle = () => {
      if (message.artifactData?.datos) {
        const datos = message.artifactData.datos as Record<string, unknown>;
        if (datos.respuesta) {
          const respuesta = datos.respuesta as Record<string, unknown>;
          if (respuesta.respuesta) {
            const inner = respuesta.respuesta as Record<string, unknown>;
            if (inner.titulo) return inner.titulo as string;
          }
          if (respuesta.titulo) return respuesta.titulo as string;
        }
      }
      return null;
    };

    const titulo = extractTitle();

    return (
      <div data-message-id={message.id} className="group/msg mb-8 flex animate-in fade-in slide-in-from-bottom-2 justify-center px-4 duration-500">
        <div className="w-full max-w-3xl">
          {/* Mensaje citado */}
          <QuotedMessage message={message} />

             <div className="mt-4 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group/art border-primary/40 dark:border-primary/50 bg-gradient-to-br from-primary/10 via-primary/2 to-primary/5 dark:from-primary/20 dark:via-primary/15 dark:to-primary/8 relative overflow-hidden rounded-3xl shadow-lg shadow-primary/15 dark:shadow-primary/25">
            {/* Animated sweep effect - more vibrant */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/35 to-transparent dark:via-primary/40 -translate-x-full animate-[sweep_1.5s_ease-in-out_infinite] pointer-events-none"></div>
            
            {/* Glow effect */}
             <div className="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-primary/25 to-transparent dark:from-primary/35 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-4 z-10">
              <div className="relative">
                 <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/20 dark:bg-primary/30"></div>
                  <div className="relative p-3 bg-gradient-to-br from-[oklch(0.45_0.15_254)] to-[oklch(0.35_0.15_254)] dark:from-[#1e5a9e] dark:to-[oklch(0.25_0.15_250)] shadow-lg shadow-primary/30 rounded-2xl text-white group-hover/art:scale-110 group-hover/art:rotate-3 transition-transform duration-300">
                  <Brain className="w-5 h-5" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-[14px] font-bold text-[oklch(0.65_0.1_250)] dark:text-primary">Generando mapa mental...</span>
                {titulo ? (
                   <span className="text-[12px] text-primary/70 dark:text-primary/80 font-medium line-clamp-1">{titulo}</span>
                ) : (
                   <span className="text-[12px] text-primary/60 dark:text-primary/70 font-medium">Esto puede tardar unos segundos</span>
                )}
              </div>
            </div>

            {/* Cancel button */}
            <button
              onClick={handleCancel}
               className="w-full sm:w-auto z-10 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-primary/30 dark:border-primary/40 hover:border-red-400 hover:text-red-500 dark:hover:border-red-600 dark:hover:text-red-400 shadow-sm text-[13px] font-semibold rounded-xl text-primary dark:text-primary hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si es un mensaje de error de mapa mental, mostrar con opción de reintentar
  if (isMindMapError) {
    const errorMsg = message.content.replace("Error al generar mapa mental: ", "");
    const originalContent = getOriginalContent();
    const hasOriginalMessageRef = !!message.artifactOriginalMessageId;

    const handleRetry = () => {
      if (originalContent) {
        onRetryMindMap?.(message, originalContent);
      } else {
        onRetry?.(message);
      }
    };

    const handleFocusContext = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (message.artifactOriginalMessageId) {
        onFocusMessage?.(message.artifactOriginalMessageId);
      }
    };

    return (
      <div data-message-id={message.id} className="group/msg mb-8 flex animate-in fade-in slide-in-from-bottom-2 justify-center px-4 duration-500">
        <div className="w-full max-w-3xl">
          {/* Mensaje citado */}
          <QuotedMessage message={message} />

          <div className="mt-4 p-5 flex flex-col gap-4 relative overflow-hidden rounded-3xl border border-destructive/20 bg-gradient-to-br from-destructive/5 via-background to-destructive/10 dark:from-destructive/10 dark:via-background dark:to-destructive/5 shadow-sm">
            <div className="flex items-start gap-4 z-10">
              {/* Error icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 dark:bg-destructive/20 shadow-sm">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground/90 dark:text-foreground">
                    Error al generar mapa mental
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {errorMsg}
                </p>
              </div>
            </div>

             {/* Action buttons */}
             <div className="flex items-center gap-2 z-10 w-full sm:w-auto">
               {hasOriginalMessageRef && (
                 <button
                   onClick={handleFocusContext}
                   className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-primary/25 dark:border-primary/35 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 shadow-sm text-[12px] font-medium rounded-xl text-primary dark:text-primary transition-all duration-200"
                 >
                   <FileText className="w-3.5 h-3.5" />
                   Ver contexto
                 </button>
               )}
               <button
                 onClick={handleRetry}
                 className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-[oklch(0.65_0.1_250)] dark:from-primary dark:to-[oklch(0.12_0.01_250)] hover:from-[oklch(0.65_0.1_250)] hover:to-[oklch(0.30_0.15_250)] dark:hover:from-[oklch(0.12_0.01_250)] dark:hover:to-[oklch(0.30_0.15_250)] shadow-lg shadow-primary/25 text-white text-[13px] font-semibold rounded-xl transition-all duration-200"
               >
                 <RotateCcw className="w-3.5 h-3.5" />
                 Reintentar
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si es un mensaje final de mapa mental generado, mostrar diseño sobrio
  if (isMindMapGenerated) {
    const artifactData = message.artifactData as {
      name?: string;
      [key: string]: unknown;
    };
    const handleViewMindMap = () => {
      onViewMindMap?.(artifactData);
    };

    // Extraer título y mensaje del artifactData
    const extractMindMapInfo = () => {
      let title = "Mapa Mental Generado";
      let description = "";
      
      if (artifactData?.datos) {
        const datos = artifactData.datos as Record<string, unknown>;
        // Formato: datos.respuesta.respuesta.mensaje / titulo
        if (datos.respuesta) {
          const respuesta = datos.respuesta as Record<string, unknown>;
          if (respuesta.respuesta) {
            const inner = respuesta.respuesta as Record<string, unknown>;
            if (inner.mensaje) title = inner.mensaje as string;
            if (inner.titulo) description = inner.titulo as string;
          } else {
            if (respuesta.mensaje) title = respuesta.mensaje as string;
            if (respuesta.titulo) description = respuesta.titulo as string;
          }
        }
      }
      
      return { title, description };
    };

    const { title, description } = extractMindMapInfo();
    const hasOriginalMessageRef = !!message.artifactOriginalMessageId;

    const handleFocusContext = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (message.artifactOriginalMessageId) {
        onFocusMessage?.(message.artifactOriginalMessageId);
      }
    };

     return (
       <div data-message-id={message.id} className={`group/msg mb-8 flex animate-in fade-in slide-in-from-bottom-2 justify-center px-4 duration-500 transition-all ${isHighlighted ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-3xl' : ''}`}>
        <div className="w-full max-w-3xl">
          {/* Mensaje citado */}
          <QuotedMessage message={message} />

           <div className="mt-4 p-5 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group/art border-primary/30 dark:border-primary/40 bg-gradient-to-br from-primary/5 via-white to-primary/3 dark:from-primary/12 dark:via-primary/8 dark:to-primary/5 relative overflow-hidden cursor-pointer rounded-3xl"
            onClick={handleViewMindMap}>
             <div className="absolute -right-6 -top-6 w-28 h-28 bg-gradient-to-br from-primary/20 to-transparent dark:from-primary/30 rounded-full blur-2xl group-hover/art:scale-150 transition-transform duration-700"></div>
            
             <div className="flex items-center gap-4 z-10">
                  <div className="p-3 bg-gradient-to-br from-[oklch(0.55_0.15_254)] to-[oklch(0.45_0.15_254)] dark:from-[oklch(0.55_0.1_250)] dark:to-[oklch(0.45_0.1_250)] shadow-lg shadow-primary/25 rounded-2xl text-white group-hover/art:scale-110 group-hover/art:rotate-3 transition-transform duration-300">
                <Brain className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-[14px] font-bold text-[oklch(0.55_0.15_254)] dark:text-primary/80">{title}</span>
                {description && (
                  <span className="text-[12px] text-[#3d88de]/70 dark:text-[#3d88de]/80 font-medium line-clamp-1">{description}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 z-10 w-full sm:w-auto">
              {hasOriginalMessageRef && (
                 <button
                   onClick={handleFocusContext}
                   className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-primary/25 dark:border-primary/35 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 shadow-sm text-[12px] font-medium rounded-xl text-primary dark:text-primary transition-all duration-200"
                 >
                  <FileText className="w-3.5 h-3.5" />
                  Ver contexto
                </button>
              )}
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   handleViewMindMap();
                 }}
                 className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-[oklch(0.65_0.1_250)] dark:from-primary dark:to-[oklch(0.12_0.01_250)] hover:from-[oklch(0.65_0.1_250)] hover:to-[oklch(0.30_0.15_250)] dark:hover:from-[oklch(0.12_0.01_250)] dark:hover:to-[oklch(0.30_0.15_250)] shadow-lg shadow-primary/25 text-white text-[13px] font-semibold rounded-xl transition-all duration-200"
               >
                 Ver interactivo
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Diseño normal para otros mensajes
  const isErrorMessage = /(Hubo un fallo en la conexión con el servidor|ddper@uct\.cl)/i.test(
    message.content,
  );
  return (
    <div data-message-id={message.id} className={`group/msg mb-8 flex animate-in fade-in slide-in-from-bottom-2 justify-center px-4 duration-500 transition-all ${isHighlighted ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-2xl' : ''}`}>
      <div className="w-full max-w-3xl">
        {/* Header del asistente */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            ASISTENTE VRAE
          </span>
        </div>

        {/* Contenido principal */}
        <div className="p-0">
          {/* Parámetros del mensaje */}
          <MessageParameters
            parameters={message.parameters || message.responseParameters}
            isUser={false}
          />

          {/* Contenido del mensaje */}
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 leading-relaxed">
            <MarkdownRenderer content={message.content} />
          </div>

          {/* Referencias estructuradas del mensaje */}
          <BotReferencesAccordion references={messageReferences} />

          {/* Artefactos (documentos y mapas mentales) */}
          <MessageArtifacts
            documentLinks={showLegacyDocumentList ? message.documentLinks : []}
            artifact={message.artifact}
            artifactData={message.artifactData}
            onViewMindMap={onViewMindMap}
          />
        </div>

        {/* Acciones del mensaje */}
        {isErrorMessage ? (
          <div className="mt-3 flex items-center gap-2 pl-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetry?.(message);
              }}
              className="px-3 py-1.5 bg-transparent border border-border text-sm rounded-lg hover:bg-muted/50 transition-colors duration-150"
            >
              Reintentar
            </button>
            <span className="ml-auto text-[10px] text-zinc-400 font-medium uppercase tracking-wide self-center">
              {formatMessageTimestamp(message.timestamp)}
            </span>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-1 pl-1">
            <MessageActions
              message={message}
              isUser={false}
              onQuoteMessage={onQuoteMessage}
            />
            <div className="mx-1 h-4 w-px bg-border/50" />
            <MessageQuickActions
              message={message}
              onQuickAction={onQuickAction}
              quickActions={quickActions}
            />

            <span className="ml-auto text-[10px] text-zinc-400 font-medium uppercase tracking-wide self-center opacity-0 group-hover/msg:opacity-100 transition-opacity duration-300">
              {formatMessageTimestamp(message.timestamp)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
