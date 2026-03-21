# Templates de Implementación - Fases de Refactorización

Este documento contiene código listo para copiar/pegar en cada fase.

---

## FASE 1: Extraer Diálogos

### 1.1 DeleteConversationDialog.tsx

```typescript
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export const DeleteConversationDialog: React.FC<DeleteConversationDialogProps> = ({
  open,
  onOpenChange,
  onConfirmDelete,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar conversación</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la
            conversación y todos sus mensajes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

### 1.2 ErrorDialog.tsx

```typescript
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ErrorDialogProps {
  open: boolean;
  message: string;
  onOpenChange: (open: boolean) => void;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  message,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Error</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

### 1.3 Cambios en ChatBot.tsx - IMPORTS

**REMOVER**:

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
```

**AGREGAR**:

```typescript
import { DeleteConversationDialog } from "@/components/DeleteConversationDialog";
import { ErrorDialog } from "@/components/ErrorDialog";
```

### 1.4 Cambios en ChatBot.tsx - JSX

**REMOVER** (líneas 450-490 aprox):

```typescript
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Eliminar conversación</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente la conversación y todos sus mensajes.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteConversation}
              >
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
              <DialogDescription>
                {errorDialog.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setErrorDialog({ open: false, message: "" })}
              >
                Aceptar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
```

**REEMPLAZAR CON**:

```typescript
        <DeleteConversationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirmDelete={confirmDeleteConversation}
        />

        <ErrorDialog
          open={errorDialog.open}
          message={errorDialog.message}
          onOpenChange={(open) =>
            setErrorDialog(prev => ({ ...prev, open }))
          }
        />
```

---

## FASE 2: Agrupar Estados Relacionados

### 2.1 Nuevos tipos

Agregar al inicio de ChatBot.tsx después de los imports:

```typescript
// ===== TIPOS PARA ESTADOS AGRUPADOS =====
interface MindMapState {
  isOpen: boolean;
  data: {
    name: string;
    subtitle?: string;
    icon?: string;
    children?: Array<{
      name: string;
      subtitle?: string;
      icon?: string;
      children?: Array<{
        name: string;
        subtitle?: string;
        icon?: string;
        children?: Array<{
          name: string;
          subtitle?: string;
          icon?: string;
          children?: unknown[];
        }>;
      }>;
    }>;
  } | null;
  title: string;
}

interface DocumentsState {
  isOpen: boolean;
  selected: DocumentData[];
}

interface DeleteDialogState {
  open: boolean;
  conversationId: string | null;
}
```

### 2.2 Reemplazar estados individuales

**REMOVER**:

```typescript
  const [isMindMapModalOpen, setIsMindMapModalOpen] = React.useState(false);
  const [selectedMindMapData, setSelectedMindMapData] = React.useState<{...}>(null);
  const [selectedMindMapTitle, setSelectedMindMapTitle] = React.useState<string>("Mapa Mental");

  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = React.useState(false);
  const [selectedDocuments, setSelectedDocuments] = React.useState<DocumentData[]>([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [conversationToDelete, setConversationToDelete] = React.useState<string | null>(null);
```

**AGREGAR**:

```typescript
const [mindMapState, setMindMapState] = React.useState<MindMapState>({
  isOpen: false,
  data: null,
  title: "Mapa Mental",
});

const [documentsState, setDocumentsState] = React.useState<DocumentsState>({
  isOpen: false,
  selected: [],
});

const [deleteDialogState, setDeleteDialogState] =
  React.useState<DeleteDialogState>({
    open: false,
    conversationId: null,
  });
```

### 2.3 Actualizar handlers

**handleOpenMindMap - REEMPLAZAR**:

```typescript
const handleOpenMindMap = useCallback(
  (artifactData: unknown, title?: string) => {
    if (
      artifactData &&
      typeof artifactData === "object" &&
      "name" in artifactData
    ) {
      setMindMapState({
        isOpen: true,
        data: artifactData as MindMapState["data"],
        title: title || "Mapa Mental",
      });
    }
  },
  [],
);
```

**handleCloseMindMap - REEMPLAZAR**:

```typescript
const handleCloseMindMap = useCallback(() => {
  setMindMapState({
    isOpen: false,
    data: null,
    title: "Mapa Mental",
  });
}, []);
```

**handleOpenDocuments - REEMPLAZAR**:

```typescript
const handleOpenDocuments = useCallback(() => {
  setDocumentsState((prev) => ({ ...prev, isOpen: true }));
}, []);
```

**handleCloseDocuments - REEMPLAZAR**:

```typescript
const handleCloseDocuments = useCallback(() => {
  setDocumentsState((prev) => ({ ...prev, isOpen: false }));
}, []);
```

**handleDocumentsSelect - REEMPLAZAR**:

```typescript
const handleDocumentsSelect = useCallback((documents: DocumentData[]) => {
  console.log("📄 Documentos seleccionados:", documents);
  setDocumentsState((prev) => ({ ...prev, selected: documents }));
}, []);
```

**handleRemoveDocument - REEMPLAZAR**:

```typescript
const handleRemoveDocument = useCallback((documentId: string) => {
  console.log("🗑️ Eliminando documento:", documentId);
  setDocumentsState((prev) => ({
    ...prev,
    selected: prev.selected.filter((doc) => doc.id !== documentId),
  }));
}, []);
```

**handleAddDocuments - REEMPLAZAR**:

```typescript
const handleAddDocuments = useCallback(() => {
  console.log("➕ Añadiendo nuevos documentos");
  setDocumentsState((prev) => ({ ...prev, isOpen: true }));
}, []);
```

**handleDeleteConversation - REEMPLAZAR**:

```typescript
const handleDeleteConversation = useCallback((id: string) => {
  console.log("🗑️ Solicitud de eliminar conversación:", id);
  setDeleteDialogState({ open: true, conversationId: id });
}, []);
```

**confirmDeleteConversation - REEMPLAZAR el inicio**:

```typescript
  const confirmDeleteConversation = useCallback(async () => {
    const id = deleteDialogState.conversationId;
    if (!id) return;

    setDeleteDialogState({ open: false, conversationId: null });

    // ... resto del código igual
```

### 2.4 Actualizar JSX

**DocumentsModal - REEMPLAZAR**:

```typescript
        {documentsState.isOpen && (
          <DocumentsModal
            isOpen={documentsState.isOpen}
            onClose={handleCloseDocuments}
            onSelect={handleDocumentsSelect}
            selectedDocuments={documentsState.selected}
            onRemoveDocument={handleRemoveDocument}
          />
        )}
```

**MindMapModal - REEMPLAZAR**:

```typescript
        {mindMapState.isOpen && (
          <MindMapModal
            isOpen={mindMapState.isOpen}
            onClose={handleCloseMindMap}
            artifact={{
              name: mindMapState.title,
              data: mindMapState.data,
              description: "Mapa mental de la conversación",
            }}
          />
        )}
```

**DeleteConversationDialog - REEMPLAZAR**:

```typescript
        <DeleteConversationDialog
          open={deleteDialogState.open}
          onOpenChange={(open) => setDeleteDialogState(prev => ({ ...prev, open }))}
          onConfirmDelete={confirmDeleteConversation}
        />
```

**ErrorDialog - sinLos cambios**:

```typescript
        <ErrorDialog
          open={errorDialog.open}
          message={errorDialog.message}
          onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, open }))}
        />
```

---

## FASE 3: State Management con Context API

Coming soon (más complejo, requiere reestructuración)

---

## FASE 4: Virtualización de Mensajes

Coming soon (requiere refactor de lista de mensajes)

---

## Testing Checklist

Después de cada fase, verificar:

### Después de Fase 1

- [ ] Los dos diálogos se abren correctamente
- [ ] Los botones de eliminar/cancelar funcionan
- [ ] Los mensajes de error se muestran
- [ ] No hay errores en consola

### Después de Fase 2

- [ ] MindMap se abre con datos correctos
- [ ] Documents modal se abre y cierra
- [ ] Seleccionar/remover documentos funciona
- [ ] Eliminar conversación pide confirmación
- [ ] Estado se sincroniza correctamente

### Después de Fase 3

- [ ] Los componentes hijos NO reciben props que pueden pasar por Context
- [ ] No hay prop drilling
- [ ] Los dispatches funcionan correctamente
- [ ] Cada cambio de state se refleja en UI

---

## Comandos Útiles

```bash
# Compilar TypeScript
pnpm run build

# Desarrollo
pnpm run dev

# Verificar tipos
pnpm run type-check

# Linter
pnpm run lint
```
