# Comparativa de Componente: ArtifactRenderer

## Equivalencia

- Rediseño: ArtifactRenderer único para estado generando + artefacto final.
- Actual: frontend/src/components/messages/MessageArtifacts.tsx + ramas especiales en frontend/src/components/messages/BotMessage.tsx + apertura en frontend/src/components/MindMapModal/MindMapModal.tsx

## Estructura y maquetado

- Rediseño: componente único con dos estados claramente separados.
- Actual: responsabilidad repartida entre render general de artefactos y estados específicos de mapa mental.

## Similitudes estructurales

- Ambos muestran estado de generación.
- Ambos presentan CTA para abrir mapa.
- Ambos reservan espacio visual específico para artefactos.

## Diferencias estructurales

- Actual divide el flujo en varias piezas, lo que complica consistencia visual.
- Rediseño unifica experiencia de artefacto.

## Decisión de transición

- En fase posterior, extraer estados de mapa mental a un renderer dedicado para simplificar BotMessage.
- Mantener comportamiento actual mientras se estabiliza layout.

## Estado de transición

- Planificado para segunda fase.
