# Comparativa de Componente: Badge

## Equivalencia

- Rediseño: Badge local con variantes default, outline, glass.
- Actual: frontend/src/components/ui/badge.tsx

## Estructura y maquetado

- Rediseño: badge rectangular suave, pensado para tags de documentos y chips de contexto.
- Actual: badge con variante cva estándar, radio más tipo pill y variantes default/secondary/destructive/outline.

## Similitudes estructurales

- Ambos modelan un chip compacto para metadata de mensaje.
- Ambos están preparados para reuso transversal.

## Diferencias estructurales

- Rediseño introduce glass y densidad visual más alta para adjuntos.
- Actual está más orientado a etiquetas semánticas genéricas.

## Decisión de transición

- Añadir variante glass al badge actual.
- Mantener compatibilidad con variantes existentes para no romper componentes actuales.

## Estado de transición

- Pendiente de implementación en fase de sistema UI.
