import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import MessageParameters from "./MessageParameters";
import MessageArtifacts from "./MessageArtifacts";
import { formatMessageTimestamp } from "./utils/messageUtils";
import { type QuickAction } from "../config/quickActions";
import type { Message } from "../../services/backendService";

interface UserMessageProps {
  message: Message;
  onQuoteMessage?: (message: Message) => void;
  onQuickAction?: (action: QuickAction, message: Message) => void;
  onViewMindMap?: (artifactData: unknown) => void;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  message,
  onViewMindMap,
}) => {
  return (
    <div className="group/msg mb-8 flex justify-center px-4">
      <div className="w-full max-w-3xl">
        <div className="flex justify-end gap-3">
          <div className="w-full md:max-w-[85%]">
            {message.quotedMessageId && (
              <div className="mb-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
                <div className="mb-1 flex items-center gap-1.5 font-medium">
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

            <div className="rounded-3xl rounded-tr-md border border-primary/30 bg-primary px-4 py-3 text-primary-foreground shadow-sm">
              <MessageParameters parameters={undefined} isUser={true} />
              <MarkdownRenderer
                content={message.content}
                isUserMessage={true}
              />
              <MessageArtifacts
                documentLinks={message.documentLinks}
                artifact={message.artifact}
                artifactData={message.artifactData}
                onViewMindMap={onViewMindMap}
              />
            </div>

            <div className="mr-1 mt-2 text-right">
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide self-center opacity-0 group-hover/msg:opacity-100 transition-opacity duration-300">
                {formatMessageTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
