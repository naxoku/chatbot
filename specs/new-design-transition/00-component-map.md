# Mapa de Componentes del Rediseño vs Proyecto Actual

## Componentes del rediseño que ya existen (equivalente directo)

- Button -> frontend/src/components/ui/button.tsx
- Badge -> frontend/src/components/ui/badge.tsx
- Card -> frontend/src/components/ui/card.tsx
- Sidebar -> frontend/src/components/sidebar/Sidebar.tsx
- ChatInput -> frontend/src/components/ChatInput.tsx
- BotMessage -> frontend/src/components/messages/BotMessage.tsx
- UserMessage -> frontend/src/components/messages/UserMessage.tsx

## Componentes del rediseño que existen como equivalente compuesto (no 1:1)

- ArtifactRenderer -> compuesto por frontend/src/components/messages/BotMessage.tsx + frontend/src/components/messages/MessageArtifacts.tsx + frontend/src/components/MindMapModal/MindMapModal.tsx
- Quick Actions Menu dentro de BotMessage -> compuesto por frontend/src/components/messages/MessageQuickActions.tsx + frontend/src/components/messages/MessageActions.tsx

## Componentes del rediseño sin equivalente directo hoy

- UserAttachments como componente aislado: hoy está resuelto como tags dentro de frontend/src/components/ChatInput.tsx y tarjetas de enlaces en frontend/src/components/messages/MessageArtifacts.tsx
- BotReferencesAccordion: no existe un acordeón de citas/evidencias en mensajes; la referencia documental se muestra en frontend/src/components/MindMapModal/MindMapModal.tsx a nivel de nodo

## Orquestación de pantalla equivalente

- App del mock -> frontend/src/pages/ChatBot.tsx como orquestador real de layout, estado y handlers
