# Plan de Refactorización Progresivo - ChatBot.tsx

## Estado Actual (Diagnóstico Validado)

### Números

- **Estados (useState)**: 16 en ChatBot.tsx
  1. `isSidebarOpen`
  2. `isDocumentsModalOpen`
  3. `isMindMapModalOpen`
  4. `selectedMindMapData`
  5. `selectedMindMapTitle`
  6. `messages`
  7. `inputMessage`
  8. `activeConversationId`
  9. `quotedMessage`
  10. `currentChat`
  11. `conversations`
  12. `selectedParameters`
  13. `selectedDocuments`
  14. `deleteDialogOpen`
  15. `conversationToDelete`
  16. `errorDialog` (objeto con 2 propiedades)

- **Diálogos anidados en JSX**: 2 (DeleteConversationDialog + ErrorDialog)
- **Lineas de JSX para diálogos**: ~50 líneas que podrían extraerse
- **Handlers**: 12+ useCallbacks mezclando UI y lógica

### Problemas Identificados

| Problema                           | Impacto                                       | Severidad         |
| ---------------------------------- | --------------------------------------------- | ----------------- |
| **State Bloat**                    | Componente difícil de leer, overhead mental   | 🔴 Alta           |
| **Prop Drilling**                  | onQuickAction, onQuoteMessage, handleFeedback | 🟡 Media          |
| **Diálogos Anidados**              | Desorden en JSX, difícil de mantener          | 🟡 Media          |
| **Estados Relacionados Dispersos** | MindMap tiene 2 useState que son 1 entidad    | 🟢 Baja           |
| **Sin Virtualización**             | Escalará mal con >100 mensajes                | 🟡 Media (Future) |

---

## Fases de Refactorización

### ✅ FASE 1: Extraer Diálogos (Prioridad 1 - QUICK WIN)

**Tiempo estimado**: 30 minutos  
**Riesgo**: Muy bajo (cambios visuales solo)  
**Beneficio**: Reduce 50 líneas de JSX, mejora legibilidad

#### Qué hacer

1. Crear `DeleteConversationDialog.tsx`
2. Crear `ErrorDialog.tsx`
3. Remover diálogos del JSX principal
4. Pasar estados como props

#### Resultados esperados

- ChatBot.tsx más limpio (reducción visual estimada: 40-50%)
- Componentes reutilizables
- Mantenimiento más fácil futura

**Archivos a crear**:

```
frontend/src/components/
  ├── DeleteConversationDialog.tsx (37 líneas)
  └── ErrorDialog.tsx (25 líneas)
```

---

### ✅ FASE 2: Agrupar Estados Relacionados (Prioridad 2 - ALTO IMPACTO)

**Tiempo estimado**: 40 minutos  
**Riesgo**: Bajo (refactor puro de estado)  
**Beneficio**: Reduce 5 useState a 2-3, lógica más clara

#### Qué hacer

**2a) Modal State Consolidation**
Convertir:

```typescript
const [isMindMapModalOpen, setIsMindMapModalOpen] = useState(false);
const [selectedMindMapData, setSelectedMindMapData] = useState(null);
const [selectedMindMapTitle, setSelectedMindMapTitle] = useState("Mapa Mental");
```

En:

```typescript
const [mindMapState, setMindMapState] = useState<{
  isOpen: boolean;
  data: MindMapData | null;
  title: string;
}>({
  isOpen: false,
  data: null,
  title: "Mapa Mental",
});
```

**2b) Documents State Consolidation**
Convertir:

```typescript
const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
const [selectedDocuments, setSelectedDocuments] = useState<DocumentData[]>([]);
```

En:

```typescript
const [documentsState, setDocumentsState] = useState<{
  isOpen: boolean;
  selected: DocumentData[];
}>({
  isOpen: false,
  selected: [],
});
```

**2c) Delete Dialog State Consolidation**
Convertir:

```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [conversationToDelete, setConversationToDelete] = useState<string | null>(
  null,
);
```

En:

```typescript
const [deleteDialogState, setDeleteDialogState] = useState<{
  open: boolean;
  conversationId: string | null;
}>({
  open: false,
  conversationId: null,
});
```

#### Resultados esperados

- Reducción de useState: 16 → 11 estados
- Cada handler actualiza UN objeto en lugar de múltiples setters
- Menos ruido mental al leer el código
- Relaciones lógicas claras

---

### 🔵 FASE 3: State Management Layer (Prioridad 3 - ARQUITECTURA)

**Tiempo estimado**: 2-3 horas  
**Riesgo**: Medio (requiere testing)  
**Beneficio**: Elimina prop drilling, escala mejor, facilita testing

#### Opciones (elige una)

**Opción A: Context API + useReducer** (Recomendado si no quieres dependencias)

- Crea `ChatContext.tsx` con `ChatState` y `useChatDispatch`
- Agrupa: `messages`, `inputMessage`, `selectedParameters`, `selectedDocuments`, `quotedMessage`
- Los componentes anidados usan `useContext` en lugar de props

**Opción B: Zustand** (Recomendado para apps grandes)

- Librería ligera (~2.5KB)
- Crea `useChatStore.ts`
- Store con acciones para cada operación

**Opción C: Jotai** (Alternativa moderna)

- Atoms granulares, sin boilerplate
- Mejor para aplicaciones muy complejas

#### Para esta aplicación recomiendo: **Context API + useReducer**

**Razones**:

- No agrega dependencias
- Mantiene la app ligera
- Suficiente para el scope actual
- Fácil migrar a Zustand después

#### Estructura propuesta

```typescript
// src/contexts/ChatContext.tsx
interface ChatState {
  messages: Message[];
  inputMessage: string;
  selectedParameters: string[];
  selectedDocuments: DocumentData[];
  quotedMessage: Message | null;
  isTyping: boolean;
}

type ChatAction =
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "SET_INPUT"; payload: string }
  | { type: "ADD_PARAMETER"; payload: string }
  | { type: "REMOVE_PARAMETER"; payload: string }
  | { type: "SET_DOCUMENTS"; payload: DocumentData[] }
  | { type: "SET_QUOTED_MESSAGE"; payload: Message | null }
  | { type: "SET_TYPING"; payload: boolean };

// En componentes child:
const { dispatch, state } = useChatContext();
dispatch({ type: "SET_INPUT", payload: "nuevo texto" });
```

#### Resultados esperados

- Zero prop drilling
- Componentes más desacoplados
- Mejor testabilidad
- Preparado para agregar más features

---

### ⚡ FASE 4: Virtualización de Mensajes (Prioridad 4 - PERFORMANCE)

**Tiempo estimado**: 1.5-2 horas  
**Riesgo**: Medio (requiere refactor de lista)  
**Beneficio**: App usable con 500+ mensajes

#### Qué cambiar

- Reemplazar `messages.map()` por `react-virtuoso` o `react-window`
- Solo renderiza los mensajes visibles en pantalla
- Scroll infinito arriba para cargar mensajes antiguos

#### Instalación

```bash
pnpm add react-virtuoso
```

#### Implementación mínima

```typescript
import { VirtuosoMessageList } from 'react-virtuoso';

<VirtuosoMessageList
  messages={messages}
  renderItem={renderMessageComponent}
  onScroll={handleScrollToLoadOlder}
/>
```

#### Resultados esperados

- Conversaciones largas sin FPS drops
- Scrolling suave incluso con 1000+ mensajes
- Lista de mensajes profesional

---

## Roadmap de Ejecución Recomendado

```
Semana 1 (Recomendado)
├── Fase 1: Extraer Diálogos        [30 min]   ✅ Ready
├── Fase 2: Agrupar Estados        [40 min]   ✅ Ready
└── TESTING: verificar funcionalidad

Semana 2 (Si hay tiempo)
├── Fase 3: Context API            [2-3h]    🔵 Medium
└── TESTING: asegurar que props no rompan

Cuando necesites escalar (Future)
└── Fase 4: Virtualización         [2h]      ⚡ Polish
```

---

## Checklist Ejecutivo

### Antes de empezar cualquier fase

- [ ] Branch nuevo: `git checkout -b refactor/phase-X`
- [ ] Verificar tests actuales pasan
- [ ] Si no hay tests, crear test básico para regresiones

### Después de cada fase

- [ ] Compilador TypeScript limpio (sin errores)
- [ ] App funciona en navegador
- [ ] Consola sin errores
- [ ] Commit con mensaje descriptivo

### Quality gates

- [ ] ChatBot.tsx tiene <300 líneas de lógica (excluye JSX)
- [ ] Máximo 8 useState en componentes principales
- [ ] Máximo 2 niveles de prop drilling
- [ ] 100% de tipos TypeScript definidos

---

## Estimaciones Finales

| Fase               | Tiempo    | Complejidad | Beneficio | Dependencia |
| ------------------ | --------- | ----------- | --------- | ----------- |
| 1 (Diálogos)       | 30 min    | 🟢 Bajo     | 🟠 Medio  | Ninguna     |
| 2 (Estados)        | 40 min    | 🟢 Bajo     | 🟠 Medio  | Fase 1      |
| 3 (Context)        | 2-3h      | 🟡 Medio    | 🔴 Alto   | Fase 2      |
| 4 (Virtualización) | 2h        | 🟡 Medio    | 🟠 Medio  | Ninguna     |
| **Total**          | **~4-5h** |             |           |             |

---

## Impacto Total Esperado

**Antes**:

- ChatBot.tsx: ~600 líneas
- Estados: 16
- Prop drilling: Alto
- Mantenibilidad: 6/10

**Después de Fases 1-3**:

- ChatBot.tsx: ~350-400 líneas
- Estados: 8-9
- Prop drilling: Eliminado
- Mantenibilidad: 8.5/10
- Escalabilidad: 8/10

**Después de Fase 4 (Full)**:

- Rendimiento con 500+ mensajes: ✅
- Escalabilidad: 9.5/10

---

## Próximos Pasos

1. **Leer detenidamente este documento**
2. **Decidir qué fases ejecutar** (Recomendación: 1-3)
3. **Crear rama de trabajo** para Fase 1
4. **Implementar** siguiendo los templates proporcionados

¿Quieres que comience con la **Fase 1** (Extraer Diálogos)?
