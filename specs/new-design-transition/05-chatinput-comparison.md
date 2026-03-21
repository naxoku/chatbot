# Comparativa de Componente: ChatInput

## Equivalencia

- Rediseño: ChatInput con contenedor sticky, cita contextual destacada, adjuntos y CTA de paperclip.
- Actual: frontend/src/components/ChatInput.tsx

## Estructura y maquetado

- Rediseño: caja elevada tipo composer, con bloque de cita y bloque de adjuntos dentro de la misma superficie.
- Actual: estructura similar (cita + documentos + input + enviar), pero con menos jerarquía visual y menor separación en capas.

## Similitudes estructurales

- Ambos soportan cita activa y limpieza de cita.
- Ambos soportan lista de documentos seleccionados con eliminación individual.
- Ambos usan textarea con auto-resize y botón de envío.

## Diferencias estructurales

- Rediseño usa composición sticky y superposición de fondo para priorizar el composer.
- Rediseño prioriza icono de adjuntar en el rail del input.
- Actual usa badge de añadir documentos en estado vacío.

## Decisión de transición

- Migrar layout del composer: contenedor más unificado, mayor jerarquía de bloques y botón de adjuntar persistente.
- Mantener API actual de props para compatibilidad con ChatBot.

## Estado de transición

- Iniciado en esta iteración: ajustes de maquetado estructural.
