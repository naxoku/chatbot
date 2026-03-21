import type { DocumentLink } from "@/services/backendService";

export type ReferenceFileType = "pdf" | "docx" | "txt" | "xlsx" | "img" | "other";

export interface ReferenceDocument {
  id: string;
  title: string;
  type: ReferenceFileType;
  category: string;
  url?: string;
}

export interface MessageReference {
  id: string;
  document: ReferenceDocument;
  quote: string;
}

const SOURCE_LINE_REGEX = /^\s*(fuente|fuentes|referencia|referencias)\s*:\s*/i;

const cleanMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^[-*]\s+/, "")
    .replace(/^\d+\.\s+/, "")
    .trim();
};

const inferFileType = (title: string): ReferenceFileType => {
  const lower = title.toLowerCase();

  if (lower.includes(".pdf")) return "pdf";
  if (lower.includes(".doc") || lower.includes(".docx")) return "docx";
  if (lower.includes(".xls") || lower.includes(".xlsx") || lower.includes(".csv")) {
    return "xlsx";
  }
  if (lower.includes(".txt") || lower.includes(".md")) return "txt";
  if (
    lower.includes(".png") ||
    lower.includes(".jpg") ||
    lower.includes(".jpeg") ||
    lower.includes(".webp") ||
    lower.includes(".gif")
  ) {
    return "img";
  }

  return "other";
};

const extractDocTitleFromSource = (sourceLine: string): string => {
  const withoutPrefix = sourceLine.replace(SOURCE_LINE_REGEX, "").trim();
  if (!withoutPrefix) return "Documento consultado";

  // Mantiene la cita principal antes de saltos de lista de fuentes.
  const firstChunk = withoutPrefix.split(/[;|]/)[0]?.trim() || withoutPrefix;

  return firstChunk;
};

const extractNearestQuote = (lines: string[], sourceIndex: number): string => {
  const maxLookback = 8;

  for (let offset = 1; offset <= maxLookback; offset += 1) {
    const idx = sourceIndex - offset;
    if (idx < 0) break;

    const raw = lines[idx]?.trim() || "";
    if (!raw) continue;
    if (SOURCE_LINE_REGEX.test(raw)) continue;
    if (/^#{1,6}\s+/.test(raw)) continue;

    const cleaned = cleanMarkdown(raw);
    if (!cleaned) continue;

    return cleaned.length > 280 ? `${cleaned.slice(0, 277)}...` : cleaned;
  }

  return "Referencia documental usada para fundamentar esta respuesta.";
};

const normalizeFromDocumentLinks = (
  documentLinks: DocumentLink[],
  seenKeys: Set<string>,
  startIndex: number,
): MessageReference[] => {
  const refs: MessageReference[] = [];

  for (const doc of documentLinks) {
    const title = (doc.title || "").trim();
    if (!title) continue;

    const key = `${title.toLowerCase()}|${(doc.url || "").toLowerCase()}`;
    if (seenKeys.has(key)) continue;

    seenKeys.add(key);
    refs.push({
      id: `ref-${startIndex + refs.length + 1}`,
      document: {
        id: key,
        title,
        type: inferFileType(doc.type || title || doc.url || ""),
        category: "Documentos relacionados",
        url: doc.url,
      },
      quote:
        (doc.description || "").trim() ||
        "Documento relacionado consultado en la respuesta.",
    });
  }

  return refs;
};

export const buildMessageReferences = (
  content: string,
  documentLinks?: DocumentLink[],
): MessageReference[] => {
  const refs: MessageReference[] = [];
  const seenKeys = new Set<string>();
  const lines = (content || "").split(/\r?\n/);

  lines.forEach((line, index) => {
    if (!SOURCE_LINE_REGEX.test(line)) return;

    const title = extractDocTitleFromSource(line);
    const key = title.toLowerCase();
    if (seenKeys.has(key)) return;

    seenKeys.add(key);

    refs.push({
      id: `ref-${refs.length + 1}`,
      document: {
        id: key,
        title,
        type: inferFileType(title),
        category: "Fuentes citadas",
      },
      quote: extractNearestQuote(lines, index),
    });
  });

  if (Array.isArray(documentLinks) && documentLinks.length > 0) {
    refs.push(...normalizeFromDocumentLinks(documentLinks, seenKeys, refs.length));
  }

  return refs;
};
