Este de acá es un rediseño del chatbot y es lo que quiero lograr:

```typescript
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send, X, FileText, Plus, Search,
  Check, File, Image as ImageIcon, FileSpreadsheet,
  MessageSquare, Menu, Library,
  ThumbsUp, ThumbsDown, Copy, ChevronDown, Quote, Paperclip,
  Eye, Download, Layers, Sparkles, MoreVertical, Reply, ListEnd, Lightbulb, Network, Brain
} from 'lucide-react';

// ==========================================
// 1. SHADCN-LIKE UI COMPONENTS (BASE)
// ==========================================
// Utilidad para combinar clases (similar a clsx/tailwind-merge en shadcn)
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'glass', size?: 'default' | 'sm' | 'icon' }>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-[#002f6c] text-white hover:bg-[#001f4c] shadow-sm",
    outline: "border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:text-zinc-100",
    ghost: "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 text-zinc-500",
    glass: "bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    icon: "h-10 w-10",
  };
  return (
    <button
      ref={ref}
      className={cn("inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
Button.displayName = "Button";

const Badge = ({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'outline' | 'glass' }) => {
  const variants = {
    default: "border-transparent bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
    outline: "text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800",
    glass: "bg-white/10 border-white/20 text-white backdrop-blur-sm"
  };
  return (
    <div className={cn("inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium transition-colors border", variants[variant], className)} {...props} />
  );
};

const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-2xl border border-zinc-200 bg-white text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50", className)} {...props} />
);

// ==========================================
// 2. TYPES & MOCK DATA
// ==========================================
interface DocumentData {
  id: string;
  title: string;
  type: 'pdf' | 'docx' | 'txt' | 'xlsx' | 'img';
  category: string;
}

interface MessageReference {
  id: string;
  document: DocumentData;
  quote: string;
}

interface QuotedMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  actionLabel?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  documentLinks?: DocumentData[];
  references?: MessageReference[];
  quotedMessage?: QuotedMessage;
  isGeneratingArtifact?: boolean;
  artifact?: { type: string; title: string };
}

const MOCK_DB_DOCUMENTS: DocumentData[] = [
  { id: '1', title: 'Reporte_VRAE_2024.pdf', type: 'pdf', category: 'Reportes' },
  { id: '2', title: 'Minuta_Reunion_Comite.docx', type: 'docx', category: 'Actas' },
  { id: '3', title: 'Reglamento_Estudiantil.pdf', type: 'pdf', category: 'Normativas' },
  { id: '4', title: 'Presupuesto_Talleres.xlsx', type: 'xlsx', category: 'Finanzas' },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    content: 'Por favor, cruza los datos de estos documentos para entender las necesidades de la Plataforma de gestión de talleres deportivos.',
    sender: 'user',
    timestamp: new Date(Date.now() - 100000),
    documentLinks: [MOCK_DB_DOCUMENTS[0], MOCK_DB_DOCUMENTS[3]],
  },
  {
    id: 'm2',
    content: 'Analizando los documentos adjuntos, he encontrado las siguientes relaciones para la Plataforma de gestión de talleres deportivos:\n\nEl reporte principal indica un aumento sostenido en la participación que exige mejorar la infraestructura actual. Sin embargo, al revisar el archivo financiero, los mayores gastos proyectados están concentrados en la adquisición de equipamiento, dejando un margen ajustado para ampliaciones de espacio físico.\n\nTe sugiero revisar la redistribución de la "Partida 2" para equilibrar las necesidades operativas.',
    sender: 'bot',
    timestamp: new Date(Date.now() - 90000),
    references: [
      { id: 'r1', document: MOCK_DB_DOCUMENTS[0], quote: "Incremento sostenido del 15% en la participación de los estudiantes, evidenciando un déficit de m2 disponibles." },
      { id: 'r2', document: MOCK_DB_DOCUMENTS[3], quote: "Partida 2: Equipamiento representa el 45% del gasto proyectado, limitando los fondos de expansión para la infraestructura." }
    ]
  }
];

// ==========================================
// 3. HELPERS
// ==========================================
const getFileConfig = (type: string) => {
  switch (type) {
    case 'pdf': return { icon: FileText, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
    case 'docx': return { icon: File, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    case 'xlsx': return { icon: FileSpreadsheet, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    default: return { icon: FileText, color: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-100 dark:bg-zinc-800' };
  }
};

// ==========================================
// 4. FEATURE COMPONENTS
// ==========================================

// Adjuntos del Usuario (Glassmorphism Pills)
const UserAttachments = ({ docs }: { docs: DocumentData[] }) => {
  if (!docs || docs.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {docs.map(doc => {
        const { icon: Icon } = getFileConfig(doc.type);
        return (
          <Badge key={doc.id} variant="glass" className="gap-2 px-3 py-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.1)] group/att cursor-default">
            <Icon className="w-4 h-4 text-amber-400 drop-shadow-sm group-hover/att:scale-110 transition-transform duration-300" />
            <span className="text-[13px] tracking-wide drop-shadow-sm">{doc.title}</span>
          </Badge>
        );
      })}
    </div>
  );
};

// Acordeón de Referencias (Bot)
const BotReferencesAccordion = ({ references }: { references?: MessageReference[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!references || references.length === 0) return null;

  return (
    <div className="mt-5 w-full">
      <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#002f6c]/5 hover:bg-[#002f6c]/10 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-[#002f6c] dark:text-blue-400 text-xs font-bold transition-all duration-300 group/ref focus:outline-none">
        <Layers className={cn("w-4 h-4 transition-transform duration-300", isExpanded ? 'rotate-180' : 'group-hover/ref:-translate-y-0.5')} />
        {isExpanded ? 'Ocultar evidencia documental' : `Ver Evidencia Documental (${references.length})`}
      </button>
      <div className={cn("grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]", isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0')}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 pb-2">
            {references.map((ref, i) => {
              const { icon: Icon, color, bg } = getFileConfig(ref.document.type);
              return (
                <Card key={i} className="p-3.5 shadow-sm flex flex-col gap-2.5 relative overflow-hidden border-zinc-200/80 dark:border-zinc-800/80">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#002f6c] to-blue-400 dark:from-blue-600 dark:to-blue-400 opacity-80" />
                  <div className="flex items-center gap-2.5 pl-2">
                    <div className={cn("p-1.5 rounded-lg", bg)}><Icon className={cn("w-3.5 h-3.5", color)} /></div>
                    <span className="text-[13px] font-bold truncate pr-2">{ref.document.title}</span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-xl flex items-start gap-2.5 ml-2 border border-zinc-100 dark:border-zinc-800/50">
                    <Quote className="w-4 h-4 text-amber-500/60 shrink-0 mt-0.5" />
                    <p className="text-[13.5px] text-zinc-600 dark:text-zinc-400 italic leading-relaxed">{ref.quote}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Renderizador de Artefactos (Mapas Mentales)
const ArtifactRenderer = ({ isGenerating, artifact }: { isGenerating?: boolean, artifact?: { type: string, title: string } }) => {
  if (isGenerating) {
    return (
      <Card className="mt-4 p-4 border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10 flex items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="relative flex items-center justify-center w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping"></div>
          <div className="absolute inset-1 rounded-full border-2 border-[#002f6c] border-t-transparent animate-spin"></div>
          <Brain className="w-4 h-4 text-[#002f6c] dark:text-blue-400 relative z-10" />
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-bold text-[#002f6c] dark:text-blue-400">Generando mapa mental...</span>
          <span className="text-[12px] text-blue-600/70 dark:text-blue-400/70">Estructurando la información institucional</span>
        </div>
      </Card>
    );
  }

  if (artifact) {
    return (
      <Card className="mt-4 p-4 hover:shadow-md transition-shadow duration-300 flex items-center justify-between group/art">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-[#002f6c]/10 dark:bg-blue-900/30 rounded-xl text-[#002f6c] dark:text-blue-400 group-hover/art:scale-110 transition-transform">
            <Network className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold">{artifact.title}</span>
            <span className="text-[12px] text-zinc-500 font-medium uppercase tracking-wide">Mapa Mental Generado</span>
          </div>
        </div>
        <Button variant="default" size="sm" onClick={() => alert('Abriendo modal del mapa mental...')}>
          Ver Mapa
        </Button>
      </Card>
    );
  }
  return null;
};

// ==========================================
// 5. MESSAGE COMPONENTS
// ==========================================
const BotMessage = ({ message, onQuickAction }: { message: Message, onQuickAction: (action: string, msg: Message) => void }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-start w-full max-w-3xl mx-auto mb-8 px-4 group/msg animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col items-start w-full">
        <div className="flex items-center gap-2 mb-2 pl-1">
          <div className="w-6 h-6 rounded-lg bg-[#002f6c] text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span className="text-[12px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">Asistente VRAE</span>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap w-full pl-1">
          {message.content && message.content.split('\n').map((line, i) => (
            <p key={i} className="mb-2 last:mb-0 text-[15px] font-light">
               {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                 part.startsWith('**') && part.endsWith('**') ? <strong key={j} className="text-[#002f6c] dark:text-blue-400 font-semibold">{part.slice(2, -2)}</strong> : part
               )}
            </p>
          ))}
        </div>

        <ArtifactRenderer isGenerating={message.isGeneratingArtifact} artifact={message.artifact} />
        <BotReferencesAccordion references={message.references} />

        {/* Quick Actions Menu */}
        <div className="flex items-center gap-1 mt-3 pl-1 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-300 relative" ref={menuRef}>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg"><ThumbsUp className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg"><ThumbsDown className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg"><Copy className="w-4 h-4" /></Button>
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

          <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)} className={cn("w-8 h-8 rounded-lg", showMenu && "bg-zinc-200 dark:bg-zinc-800 text-[#002f6c]")}>
            <MoreVertical className="w-4 h-4" />
          </Button>

          {showMenu && (
            <Card className="absolute top-full left-0 mt-2 w-56 py-2 z-20 animate-in fade-in zoom-in-95 origin-top-left border-zinc-200/80 shadow-xl">
              <div className="px-3 pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Acciones</div>
              <button onClick={() => { setShowMenu(false); onQuickAction('Responder', message); }} className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"><Reply className="w-4 h-4 text-blue-500" /> Responder</button>
              <button onClick={() => { setShowMenu(false); onQuickAction('Resumir', message); }} className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"><ListEnd className="w-4 h-4 text-emerald-500" /> Resumir</button>
              <button onClick={() => { setShowMenu(false); onQuickAction('Explicar', message); }} className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"><Lightbulb className="w-4 h-4 text-amber-500" /> Explicar a detalle</button>
              <button onClick={() => { setShowMenu(false); onQuickAction('Ejemplo', message); }} className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"><FileText className="w-4 h-4 text-purple-500" /> Dar un ejemplo</button>
              <div className="mx-3 my-1 border-t border-zinc-100 dark:border-zinc-800"></div>
              <button onClick={() => { setShowMenu(false); onQuickAction('Mapa', message); }} className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-zinc-700 hover:bg-blue-50 transition-colors"><Network className="w-4 h-4 text-[#002f6c]" /> Generar mapa mental</button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const UserMessage = ({ message }: { message: Message }) => (
  <div className="flex justify-end w-full max-w-3xl mx-auto mb-10 px-4 group/msg animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="flex flex-col items-end max-w-[90%] md:max-w-[85%]">
      <div className="px-5 py-4 rounded-3xl rounded-tr-[4px] bg-gradient-to-br from-[#002f6c] to-[#001f4c] text-white shadow-lg shadow-[#002f6c]/10 flex flex-col min-w-0 border border-[#001f4c]/50">

        {message.quotedMessage && (
          <div className="mb-3 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              {message.quotedMessage.actionLabel === 'Responder' ? <Reply className="w-3.5 h-3.5" /> :
               message.quotedMessage.actionLabel === 'Resumir' ? <ListEnd className="w-3.5 h-3.5" /> :
               <Lightbulb className="w-3.5 h-3.5" />}
              {message.quotedMessage.actionLabel} a Asistente VRAE
            </div>
            <p className="text-[13px] text-white/80 italic line-clamp-2 border-l-2 border-amber-300/50 pl-2">
              "{message.quotedMessage.content}"
            </p>
          </div>
        )}

        <UserAttachments docs={message.documentLinks || []} />
        <div className="leading-relaxed text-[15px] whitespace-pre-wrap text-white/95 font-light">{message.content}</div>
      </div>
      <span className="text-[10px] text-zinc-400 font-medium mt-2 mr-1 uppercase tracking-wide opacity-0 group-hover/msg:opacity-100 transition-opacity duration-300">
        {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </span>
    </div>
  </div>
);

// ==========================================
// 6. LAYOUT COMPONENTS
// ==========================================
const ChatInput = ({ inputMessage, onInputChange, onSendMessage, selectedDocuments, onRemoveDocument, onAddDocuments, quotedMessage, onClearQuote }: any) => {
  return (
    <div className="sticky bottom-0 w-full bg-gradient-to-t from-[#f8fafc] via-[#f8fafc] to-transparent dark:from-zinc-950 dark:via-zinc-950 pt-8 pb-6 px-4 flex justify-center z-10">
      <div className="w-full max-w-3xl flex flex-col gap-2">
        <div className="relative flex flex-col bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden focus-within:border-[#002f6c]/50 dark:focus-within:border-blue-500/50 focus-within:shadow-[0_8px_30px_rgb(0,47,108,0.08)] transition-all duration-300">

          {quotedMessage && (
            <div className="mx-4 mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-2xl relative flex flex-col gap-1.5 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#002f6c] dark:text-blue-400 uppercase tracking-wider">
                {quotedMessage.actionLabel === 'Responder' ? <Reply className="w-3.5 h-3.5" /> :
                 quotedMessage.actionLabel === 'Resumir' ? <ListEnd className="w-3.5 h-3.5" /> :
                 <Lightbulb className="w-3.5 h-3.5" />}
                {quotedMessage.actionLabel} a Asistente VRAE
              </div>
              <p className="text-[13px] text-zinc-600 dark:text-zinc-400 line-clamp-2 pr-6">"{quotedMessage.content}"</p>
              <Button variant="ghost" size="icon" onClick={onClearQuote} className="absolute top-2.5 right-2.5 w-6 h-6 hover:bg-red-50 hover:text-red-500">
                <X className="w-3 h-3"/>
              </Button>
            </div>
          )}

          {selectedDocuments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-3 pb-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
              {selectedDocuments.map((doc: DocumentData) => {
                const { icon: Icon, color } = getFileConfig(doc.type);
                return (
                  <Badge key={doc.id} variant="outline" className="group/badge pr-1.5 py-1 pl-2 bg-white shadow-sm">
                    <Icon className={cn("h-3.5 w-3.5 mr-2", color)} />
                    <span className="text-[12px] mr-1 font-semibold truncate max-w-[150px]">{doc.title}</span>
                    <button onClick={() => onRemoveDocument(doc.id)} className="p-1 rounded-md hover:bg-red-50 hover:text-red-600 text-zinc-400 transition-colors"><X className="h-3.5 w-3.5" /></button>
                  </Badge>
                );
              })}
            </div>
          )}

          <div className="flex items-end gap-2 p-2.5">
            <button className="mb-1 p-3 rounded-2xl text-[#002f6c] bg-[#002f6c]/5 hover:bg-[#002f6c]/10 dark:text-blue-400 shrink-0 transition-all duration-300 hover:scale-105 active:scale-95" onClick={onAddDocuments}>
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSendMessage(); } }}
              placeholder={quotedMessage ? "Escribe tu respuesta..." : "Haz una consulta sobre la Plataforma de gestión de talleres deportivos..."}
              className="flex-1 max-h-[150px] min-h-[44px] py-3 px-3 bg-transparent text-[15px] placeholder:text-zinc-400 resize-none focus:outline-none text-zinc-900"
            />
            <Button
              onClick={onSendMessage}
              disabled={!inputMessage.trim() && selectedDocuments.length === 0}
              className={cn("mb-1 h-12 w-12 rounded-2xl transition-all duration-300", inputMessage.trim() || selectedDocuments.length > 0 ? "hover:-translate-y-0.5" : "bg-zinc-100 text-zinc-300 shadow-none hover:bg-zinc-100")}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, onToggle }: any) => (
  <div className={cn("fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-[280px] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-500", isOpen ? 'translate-x-0' : '-translate-x-full lg:block')}>
    <div className="p-6 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#002f6c] text-white flex items-center justify-center font-serif font-bold text-xl shadow-md border border-[#001f4c]">U</div><div className="flex flex-col"><span className="font-extrabold text-[15px] text-[#002f6c] leading-tight">UCT</span><span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-tight mt-0.5">VRAE Assistant</span></div></div><Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden"><Menu className="w-5 h-5" /></Button></div>
  </div>
);

// ==========================================
// 7. MAIN APP
// ==========================================
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentData[]>([]);
  const [quotedMessage, setQuotedMessage] = useState<QuotedMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuickAction = (action: string, msg: Message) => {
    if (action === 'Mapa') {
      const botGeneratingMsg: Message = { id: Date.now().toString(), content: '', sender: 'bot', timestamp: new Date(), isGeneratingArtifact: true };
      setMessages(prev => [...prev, botGeneratingMsg]);
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === botGeneratingMsg.id ? { ...m, isGeneratingArtifact: false, content: 'He generado un mapa mental estructurando la información sobre la Plataforma de gestión de talleres deportivos basado en tu solicitud.', artifact: { type: 'mindmap', title: 'Estructura Operativa VRAE' } } : m));
      }, 3000);
      return;
    }

    setQuotedMessage({ id: msg.id, content: msg.content, sender: msg.sender, actionLabel: action });
    if (action === 'Resumir') setInputMessage('Por favor, resume este mensaje: ');
    if (action === 'Explicar') setInputMessage('¿Me podrías explicar más a detalle esto? ');
    if (action === 'Ejemplo') setInputMessage('Dame un ejemplo práctico sobre esto: ');
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() && selectedDocuments.length === 0) return;
    const newUserMsg: Message = { id: Date.now().toString(), content: inputMessage, sender: 'user', timestamp: new Date(), documentLinks: selectedDocuments.length > 0 ? selectedDocuments : undefined, quotedMessage: quotedMessage || undefined };
    setMessages(prev => [...prev, newUserMsg]);
    setInputMessage('');
    setSelectedDocuments([]);
    setQuotedMessage(null);

    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), content: `He recibido tu instrucción respecto a la Plataforma de gestión de talleres deportivos. Entendido.`, sender: 'bot', timestamp: new Date() }]);
    }, 1000);
  };

  return (
    <div className="h-screen bg-[#f8fafc] dark:bg-zinc-950 flex overflow-hidden font-sans text-zinc-900 dark:text-zinc-100 selection:bg-[#002f6c]/20">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <div className="flex-1 overflow-y-auto pt-12 pb-6 scroll-smooth">
          <div className="flex flex-col max-w-4xl mx-auto">
             <div className="text-center mb-12 pb-6 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-16 h-16 bg-[#002f6c] rounded-2xl flex items-center justify-center shadow-lg border border-[#001f4c] mb-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-amber-300" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#002f6c] dark:text-blue-400 mb-2 tracking-tight">VRAE Assistant</h1>
              <p className="text-[14px] text-zinc-500 max-w-md mx-auto font-medium">Interactúa con los mensajes de la Plataforma de gestión de talleres deportivos.</p>
            </div>

            {messages.map((message) =>
              message.sender === 'bot'
                ? <BotMessage key={message.id} message={message} onQuickAction={handleQuickAction} />
                : <UserMessage key={message.id} message={message} />
            )}
            <div ref={messagesEndRef} className="h-8" />
          </div>
        </div>

        <ChatInput
          inputMessage={inputMessage}
          onInputChange={setInputMessage}
          onSendMessage={handleSendMessage}
          selectedDocuments={selectedDocuments}
          onRemoveDocument={(id: string) => setSelectedDocuments(prev => prev.filter(d => d.id !== id))}
          quotedMessage={quotedMessage}
          onClearQuote={() => setQuotedMessage(null)}
        />
      </main>
    </div>
  );
}
```
