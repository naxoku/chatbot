# Especificación Canónica del Chat Asistente UCT

## 1. Propósito del documento

Este documento define la esencia del chat actual para que cualquier rediseño futuro conserve su comportamiento, su identidad conversacional y su utilidad real.

Objetivos:

- Preservar la experiencia funcional del bot aunque cambie el look and feel.
- Diferenciar claramente qué es obligatorio mantener y qué se puede rediseñar libremente.
- Servir como contrato de producto entre UX, frontend y backend.

---

## 2. Esencia del producto (lo que no se debe perder)

### 2.1 Identidad de uso

El chat no es solo una caja de texto con respuesta. Es un asistente documental y de razonamiento con cuatro pilares:

- Conversación persistente por hilos (historial por conversación).
- Contexto explícito por cita de mensajes.
- Contexto explícito por selección de documentos.
- Extensión de respuesta con artefactos (documentos relacionados y mapas mentales).

### 2.2 Percepción esperada por el usuario

El usuario debe sentir:

- Continuidad: cada conversación tiene memoria y estado propio.
- Claridad: sabe en todo momento qué está citando y qué documentos usa.
- Control: puede renombrar, eliminar, volver atrás y cambiar de conversación.
- Progresión: ve cuando el bot está pensando y cuando está completando una respuesta.
- Accionabilidad: puede transformar una respuesta en resumen, explicación, ejemplo o mapa mental.

### 2.3 Principios de interacción

- Evitar silencios: siempre mostrar estado cuando hay procesamiento.
- Evitar ambigüedad: toda acción contextual debe estar asociada al mensaje origen.
- Reducir fricción: acciones frecuentes visibles con un clic.
- Respetar contexto: no mezclar conversaciones ni perder documentos seleccionados.

---

## 3. Arquitectura de experiencia

## 3.1 Flujo macro de pantalla

1. Sidebar con conversaciones y acciones globales.
2. Encabezado con el título de la conversación activa.
3. Timeline de mensajes con variantes bot y usuario.
4. Caja de entrada con cita activa y documentos seleccionados.
5. Modales de apoyo: documentos, mapas mentales, confirmaciones y errores.

## 3.2 Orquestador principal

Componente raíz de experiencia:

- frontend/src/pages/ChatBot.tsx

Responsabilidades clave:

- Mantener el estado principal del chat.
- Conectar hooks de lógica de negocio.
- Componer layout y componentes visuales.
- Coordinar handlers de envío, acciones rápidas y navegación entre conversaciones.

Estado principal que controla:

- Sidebar abierto/cerrado.
- Modales de documentos y mapa mental.
- Lista de mensajes.
- Texto de entrada.
- Conversación activa.
- Mensaje citado.
- Conversaciones cargadas.
- Parámetros y documentos seleccionados.
- Diálogos de error y confirmación.

---

## 4. Contratos de datos (esencia semántica)

Fuente principal:

- frontend/src/services/backendService.ts

### 4.1 Entidad Message

Campos relevantes:

- id: identificador único.
- content: texto o markdown renderizable.
- sender: user o bot.
- timestamp: fecha de creación.
- quotedMessageId: id de mensaje citado.
- quotedMessageContent: snapshot de contenido citado.
- quotedMessageSender: remitente del citado.
- parameters / responseParameters: etiquetas de intención o transformación.
- documentLinks: documentos recomendados por el bot.
- artifact: bandera de artefacto generado.
- artifactData: payload del artefacto (especialmente mapa mental).
- feedbackRequested: habilita acciones de feedback en mensajes del bot.
- isContext: mensaje interno que no debe mostrar acciones.

### 4.2 Entidad Conversation

Campos relevantes:

- id / conversacionId: identidad de hilo.
- title: nombre visible.
- lastMessage: preview para sidebar.
- timestamp: última actividad.
- mapasAsociados / mapasMentales: estado de artefactos por conversación.

### 4.3 Respuesta streaming

StreamResponse:

- respuesta: texto final consolidado.
- documentosRecomendados: links sugeridos.
- conversacionId: id definitivo del hilo.

Implicación UX:

- El id de conversación puede nacer durante el envío.
- La UI debe soportar primer mensaje sin hilo previo.

---

## 5. Lógica de conversación y envío

Fuente principal:

- frontend/src/hooks/useChatLogic.ts

## 5.1 Reglas de envío

Validaciones previas:

- No enviar mensaje vacío.
- No enviar si bot está escribiendo.
- No duplicar envíos concurrentes.

Secuencia de envío:

1. Crear mensaje user en UI.
2. Limpiar input y cita activa.
3. Crear placeholder de bot vacío.
4. Abrir streaming SSE.
5. Actualizar contenido del placeholder por chunks.
6. Al completar, consolidar respuesta final y documentos.
7. Crear o actualizar conversación en listado lateral.

## 5.2 Estados que deben ser visibles

- isTyping true: bloquea envío y muestra spinner / estado de procesamiento.
- Placeholder de bot vacío: muestra animación de pensamiento.
- Error de streaming: placeholder se transforma en mensaje de error legible.

## 5.3 Feedback y post-procesamiento

- Mensajes del bot pueden solicitar feedback útil/no útil.
- Acción de mapa mental se dispara sobre el contenido del mensaje origen.
- El mapa mental generado se inserta como mensaje artefacto y se persiste en backend.

---

## 6. Componentes de interfaz y su rol

## 6.1 Layout y navegación

### Sidebar

Archivo:

- frontend/src/components/sidebar/Sidebar.tsx

Rol:

- Navegador de conversaciones y acciones globales.

Funciones:

- Crear nueva conversación.
- Abrir modal de documentos.
- Seleccionar conversación.
- Cambiar tema.
- Cerrar sesión.

Comportamiento responsive:

- Mobile: Sheet lateral con botón flotante de menú.
- Desktop: panel colapsable expandido/compacto.

Estilo/identidad actual:

- Jerarquía clara por zonas: header, acciones, lista, footer.
- Estado activo con contraste de fondo.
- Botones de acción principal y secundaria claramente diferenciados.

### ConversationItem

Archivo:

- frontend/src/components/sidebar/ConversationItem.tsx

Rol:

- Unidad interactiva de hilo conversacional.

Funciones:

- Seleccionar conversación.
- Renombrar inline.
- Eliminar desde menú contextual.

Microinteracciones:

- Menú de tres puntos aparece en hover (desktop) y visible en móvil.
- Reubica menú arriba/abajo según espacio de viewport.
- Enter guarda edición, Escape cancela.

### ChatHeader

Archivo:

- frontend/src/components/ChatHeader.tsx

Rol:

- Identificador visible del contexto actual.

Características:

- Muestra título activo o fallback.
- Usa truncado para evitar rotura de layout.

### EmptyChatState

Archivo:

- frontend/src/components/EmptyChatState.tsx

Rol:

- Pantalla de inicio del hilo vacío.

Características:

- Presenta capacidades del asistente.
- Incluye mensaje orientador inicial.

---

## 6.2 Caja de entrada y composición de prompt

### ChatInput

Archivo:

- frontend/src/components/ChatInput.tsx

Rol:

- Superficie principal de composición del mensaje.

Funciones críticas:

- Input multilinea con auto-resize.
- Enter envía, Ctrl/Cmd + Enter inserta salto.
- Render de mensaje citado con opción de limpiar.
- Render de documentos seleccionados como tags removibles.
- CTA para agregar documentos incluso sin selección previa.

Estados visuales:

- Disabled por bloqueo global o typing.
- Spinner en botón enviar cuando hay procesamiento.
- Botón enviar inactivo sin texto útil.

Reglas de usabilidad a conservar:

- Mostrar claramente si existe cita activa.
- Mostrar claramente qué documentos están anexados al contexto.
- No perder contenido del input por redibujos no intencionales.

---

## 6.3 Mensajes del bot y del usuario

### BotMessage

Archivo:

- frontend/src/components/messages/BotMessage.tsx

Rol:

- Render semántico completo de respuestas del asistente.

Subestados y variantes:

- Thinking: placeholder vacío con animación de puntos.
- Generating mind map: bloque especial destacado de progreso.
- Mind map generated: tarjeta clickeable para abrir visualización.
- Normal: contenido markdown + parámetros + artefactos + acciones.

Capas internas:

- Cita previa del mensaje origen (si existe).
- Parámetros aplicados a la respuesta.
- Markdown seguro.
- Documentos relacionados y artefactos.
- Acciones rápidas (responder, resumen, explicar, ejemplo, mapa mental).
- Acciones utilitarias (copiar, feedback).
- Timestamp.

### UserMessage

Archivo:

- frontend/src/components/messages/UserMessage.tsx

Rol:

- Render de mensaje emitido por el usuario.

Características:

- Burbuja visual diferenciada del bot.
- Soporte de cita previa.
- Render markdown para mantener consistencia de formato.
- Acciones contextuales y timestamp.

---

## 6.4 Render y acciones de mensaje

### MarkdownRenderer

Archivo:

- frontend/src/components/messages/MarkdownRenderer.tsx

Rol:

- Parsear y sanitizar markdown para prevenir XSS.

Stack:

- marked para parseo.
- DOMPurify para sanitización.

Regla obligatoria:

- Nunca renderizar markdown sin sanitización.

### MessageQuickActions

Archivo:

- frontend/src/components/messages/MessageQuickActions.tsx

Rol:

- Menú contextual con acciones de transformación sobre un mensaje.

Características clave:

- Usa portal en document.body para evitar clipping por overflow.
- Posicionamiento dinámico según viewport.
- Cierre por click externo.

Acciones disponibles actuales:

- Responder.
- Resumir mensaje.
- Explicar mejor.
- Dar ejemplo.
- Generar mapa mental.

### MessageActions

Archivo:

- frontend/src/components/messages/MessageActions.tsx

Rol:

- Acciones utilitarias por mensaje.

Funciones:

- Copiar contenido como texto plano.
- Feedback útil/no útil en mensajes del bot.
- Mostrar estado de feedback enviado.

Restricciones:

- Mensajes isContext no deben mostrar estas acciones.

### MessageParameters

Archivo:

- frontend/src/components/messages/MessageParameters.tsx

Rol:

- Mostrar badges de parámetros aplicados.

Características:

- Usa catálogo central de labels e iconos.
- Estilo cambia según si el mensaje es del usuario o del bot.

### MessageArtifacts

Archivo:

- frontend/src/components/messages/MessageArtifacts.tsx

Rol:

- Representar enriquecimientos no textuales de una respuesta.

Tipos visibles:

- Documentos relacionados.
- Mapa mental generado con CTA de apertura.

---

## 6.5 Modales vinculados al chat

### DocumentsModal

Archivo:

- frontend/src/components/DocumentsModal/DocumentsModal.tsx

Rol:

- Selector avanzado de documentos para inyectar contexto al prompt.

Funciones:

- Búsqueda con debounce.
- Filtro por categoría.
- Selección múltiple con checkbox.
- Preview en panel derecho.
- Descarga y apertura externa.
- Confirmación de selección.

Arquitectura interna:

- useDocuments para carga y estado.
- useDebouncedSearch para filtrado reactivo eficiente.
- documentService para llamadas y utilidades de filtrado/categorías.

### MindMapModal

Archivo:

- frontend/src/components/MindMapModal/MindMapModal.tsx

Rol:

- Visualizador de mapa mental generado por el asistente.

Funciones:

- Render gráfico con EChartsTree.
- Validación básica de payload antes de renderizar.
- Modal secundario de referencias al hacer click en nodo con referencia.

### ArtifactsModal

Archivo:

- frontend/src/components/ArtifactsModal/ArtifactsModal.tsx

Rol:

- Repositorio visual de artefactos de la conversación.

Estado actual:

- Implementado pero no integrado activamente en el flujo principal ChatBot.

Uso potencial futuro:

- Hub central de activos generados por la conversación.

---

## 7. Sistema visual actual (ADN de estilo)

## 7.1 Lenguaje visual

- Estética limpia, sobria y de productividad.
- Dominio de superficies tipo card y burbujas.
- Espaciado consistente con respiración vertical.
- Contraste funcional entre mensajes user y bot.

## 7.2 Tokens y utilidades de estilo

Se apoya en utilidades de diseño semánticas:

- bg-background, bg-card, bg-muted.
- text-foreground, text-muted-foreground.
- border-border.
- Variables de tema para light, dark y system.

Implicación para rediseño:

- Se puede alterar forma, tamaño, tipografía y ornamento,
  pero mantener semántica de color por rol de componente.

## 7.3 Microinteracciones importantes

- Animación de typing para respuesta en progreso.
- Transiciones suaves en hover y estados de botón.
- Apertura de menús con posicionamiento inteligente.
- Auto-scroll al fondo en mensajes nuevos.

## 7.4 Accesibilidad mínima observable

- Uso de aria-label en botones críticos (enviar, cerrar, etc.).
- Botones con tamaño táctil razonable.
- Fallbacks visuales para errores de carga.

---

## 8. Configuración de acciones y parámetros

Archivo:

- frontend/src/components/config/quickActions.ts

Define:

- Catálogo de acciones rápidas.
- Catálogo de etiquetas visuales para parámetros.

Regla de mantenimiento:

- Toda acción nueva debe existir aquí antes de distribuirse en UI.
- Toda etiqueta de parámetro debe tener mapeo visual centralizado.

---

## 9. Estados y errores que deben mantenerse

Estados críticos:

- Carga de conversaciones.
- Error al cargar mensajes de conversación.
- Error en envío/streaming.
- Confirmación de borrado de conversación.
- Error al renombrar/eliminar conversación.
- Error de carga de preview de documento.

Principio:

- Siempre ofrecer feedback visible y accionable.

---

## 10. Reglas para rediseñar sin romper esencia

## 10.1 Innegociables funcionales

- Mantener streaming progresivo de respuesta.
- Mantener sistema de cita de mensajes.
- Mantener selección de documentos en contexto de prompt.
- Mantener acciones rápidas por mensaje.
- Mantener generación y apertura de mapa mental.
- Mantener persistencia y navegación entre conversaciones.

## 10.2 Variables estilísticas libres

- Forma de burbujas (radio, bordes, sombras).
- Tipografía y escala visual.
- Paleta y contraste por tema.
- Estilo de iconografía.
- Densidad de layout.

## 10.3 Compatibilidad de interacción

Si cambias estructura visual, conservar:

- Atajos de teclado de input.
- Ubicación lógica de acciones primarias.
- Señales de estado de procesamiento.
- Legibilidad del contexto citado y documentos seleccionados.

---

## 11. Checklist de validación para futuras versiones

Antes de aprobar un nuevo estilo, verificar:

- Se puede iniciar conversación desde vacío.
- Se puede enviar mensaje y ver streaming incremental.
- Se puede citar un mensaje y enviar usando cita.
- Se pueden seleccionar documentos y enviarlos como contexto.
- Se pueden ejecutar acciones rápidas sobre un mensaje.
- Se puede generar y abrir mapa mental.
- Se puede copiar y dar feedback a mensajes del bot.
- Se puede renombrar y eliminar conversación sin inconsistencias.
- El cambio entre conversaciones mantiene mensajes correctos.
- El comportamiento mobile sigue siendo usable.

---

## 12. Oportunidades de evolución sin perder identidad

Líneas seguras de mejora futura:

- Mejorar jerarquía tipográfica y densidad visual del timeline.
- Convertir acciones rápidas en sistema extensible por capacidades.
- Integrar ArtifactsModal como panel lateral de activos.
- Unificar sistema de iconografía para documentos y artefactos.
- Instrumentar métricas de uso por tipo de acción rápida.

---

## 13. Mapa rápido de archivos clave

- frontend/src/pages/ChatBot.tsx
- frontend/src/hooks/useChatLogic.ts
- frontend/src/services/backendService.ts
- frontend/src/components/ChatInput.tsx
- frontend/src/components/ChatHeader.tsx
- frontend/src/components/EmptyChatState.tsx
- frontend/src/components/sidebar/Sidebar.tsx
- frontend/src/components/sidebar/ConversationItem.tsx
- frontend/src/components/messages/BotMessage.tsx
- frontend/src/components/messages/UserMessage.tsx
- frontend/src/components/messages/MarkdownRenderer.tsx
- frontend/src/components/messages/MessageActions.tsx
- frontend/src/components/messages/MessageQuickActions.tsx
- frontend/src/components/messages/MessageParameters.tsx
- frontend/src/components/messages/MessageArtifacts.tsx
- frontend/src/components/config/quickActions.ts
- frontend/src/components/DocumentsModal/DocumentsModal.tsx
- frontend/src/components/MindMapModal/MindMapModal.tsx
- frontend/src/components/ArtifactsModal/ArtifactsModal.tsx
- frontend/src/components/theme-provider.tsx
- frontend/src/components/mode-toggle.tsx

---

## 14. Resumen ejecutivo

La esencia del bot actual combina conversación persistente, contexto explícito y transformación accionable de respuestas. El rediseño puede cambiar la estética de forma profunda, siempre que conserve:

- continuidad por conversación,
- transparencia del contexto (citas y documentos),
- respuesta progresiva en streaming,
- acciones rápidas por mensaje,
- soporte de artefactos (documentos y mapas mentales).

Si estas cinco bases se mantienen, la identidad funcional del asistente se preserva aunque el estilo visual evolucione por completo.
