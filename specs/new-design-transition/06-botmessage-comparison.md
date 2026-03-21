# Comparativa de Componente: BotMessage

## Equivalencia

- Rediseño: BotMessage con cabecera de identidad, cuerpo textual editorial, bloque de artefacto y menú contextual inline.
- Actual: frontend/src/components/messages/BotMessage.tsx

## Estructura y maquetado

- Rediseño: mensaje sin burbuja pesada, con ritmo vertical, firma visual del asistente y acciones emergentes.
- Actual: mezcla de variantes (thinking, generating, generated, normal) en un único componente con burbuja más tradicional.

## Similitudes estructurales

- Ambos contemplan estado de generación de artefacto.
- Ambos incluyen acciones rápidas y acciones de utilidad.
- Ambos dejan espacio para referencias/artefactos bajo contenido.

## Diferencias estructurales

- Rediseño integra una cabecera de identidad del asistente más marcada.
- Rediseño concentra quick actions en patrón de menú contextual.
- Actual separa quick actions y message actions como bloques independientes.

## Decisión de transición

- Mantener lógica de estados existente.
- Introducir progresivamente estructura visual del rediseño (cabecera, ritmo tipográfico y agrupación de acciones).

## Estado de transición

- Iniciado en esta iteración: primera adaptación de layout general en variante normal.
