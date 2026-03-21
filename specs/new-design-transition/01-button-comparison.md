# Comparativa de Componente: Button

## Equivalencia

- Rediseño: Button inline local
- Actual: frontend/src/components/ui/button.tsx

## Estructura y maquetado

- Rediseño: definición local con variantes default, outline, ghost, glass y tamaños default, sm, icon.
- Actual: wrapper shadcn con soporte asChild y sistema de variantes en archivo dedicado.

## Similitudes estructurales

- Ambos usan patrón de variante + tamaño.
- Ambos centralizan clases para no repetir en cada uso.

## Diferencias estructurales

- Rediseño integra variante glass dentro del mismo componente.
- Actual delega estilo a button-variants para mantener separación.
- Actual soporta composición con Slot (asChild), útil para links o triggers.

## Decisión de transición

- Mantener arquitectura actual (shadcn + variantes externas).
- Agregar variantes y tamaños del rediseño en button-variants sin reescribir el componente base.

## Estado de transición

- Pendiente de implementación en fase de refinamiento visual/interaction system.
