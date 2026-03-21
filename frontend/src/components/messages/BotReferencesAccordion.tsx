import React from "react";
import {
  Layers,
  ChevronDown,
  FileText,
  File,
  FileSpreadsheet,
  Image as ImageIcon,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageReference, ReferenceFileType } from "./utils/referenceUtils";

interface BotReferencesAccordionProps {
  references?: MessageReference[];
}

const getFileConfig = (type: ReferenceFileType) => {
   switch (type) {
     case "pdf":
       return {
         icon: FileText,
         color: "text-destructive/80 dark:text-destructive/60",
         bg: "bg-destructive/10 dark:bg-destructive/20",
       };
     case "docx":
       return {
         icon: File,
         color: "text-primary/80 dark:text-primary/60",
         bg: "bg-primary/10 dark:bg-primary/20",
       };
     case "xlsx":
       return {
         icon: FileSpreadsheet,
         color: "text-accent/80 dark:text-accent/60",
         bg: "bg-accent/10 dark:bg-accent/20",
       };
     case "img":
       return {
         icon: ImageIcon,
         color: "text-accent/80 dark:text-accent/60",
         bg: "bg-accent/10 dark:bg-accent/20",
       };
     default:
       return {
         icon: FileText,
         color: "text-muted/80 dark:text-muted/60",
         bg: "bg-muted/10 dark:bg-muted/20",
       };
   }
 };

const ReferenceItem: React.FC<{ reference: MessageReference }> = ({ reference }) => {
  const { icon: Icon, color, bg } = getFileConfig(reference.document.type);

  return (
    <div className="group p-3.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1 rounded-md", bg)}>
          <Icon className={cn("w-3.5 h-3.5 opacity-90", color)} />
        </div>

        {reference.document.url ? (
          <a
            href={reference.document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12.5px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#002f6c] dark:hover:text-blue-300 underline-offset-2 hover:underline"
          >
            {reference.document.title}
          </a>
        ) : (
          <span className="text-[12.5px] font-semibold text-zinc-700 dark:text-zinc-300">
            {reference.document.title}
          </span>
        )}
      </div>

      <div className="pl-[22px] relative">
        <div className="absolute left-[8px] top-0 bottom-0 w-[2px] rounded-full bg-zinc-200 dark:bg-zinc-700 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600 transition-colors" />
        <div className="flex items-start gap-2">
          <Quote className="mt-0.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
          <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-light italic">
            {`"${reference.quote}"`}
          </p>
        </div>
      </div>
    </div>
  );
};

export const BotReferencesAccordion: React.FC<BotReferencesAccordionProps> = ({
  references = [],
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!references.length) return null;

  return (
    <div className="mt-4 w-full">
       <button
         onClick={() => setIsExpanded((prev) => !prev)}
         className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 dark:bg-primary/10 dark:hover:bg-primary/20 text-primary/80 dark:text-primary/60 text-[12px] font-bold transition-all duration-300 group/ref focus:outline-none w-fit"
       >
        <Layers className="w-4 h-4" />
        <span>
          {isExpanded ? "Ocultar fuentes" : `${references.length} fuentes consultadas`}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isExpanded
              ? "rotate-180"
              : "opacity-70 group-hover/ref:translate-y-0.5",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isExpanded
            ? "grid-rows-[1fr] opacity-100 mt-2.5"
            : "grid-rows-[0fr] opacity-0 mt-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md">
            {references.map((reference) => (
              <ReferenceItem key={reference.id} reference={reference} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotReferencesAccordion;
