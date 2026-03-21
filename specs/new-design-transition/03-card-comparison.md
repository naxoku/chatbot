# Comparativa de Componente: Card

## Equivalencia

- Rediseño: Card simplificado local.
- Actual: frontend/src/components/ui/card.tsx

## Estructura y maquetado

- Rediseño: contenedor único con radio grande, borde y sombra; se usa para bloques de evidencia y artefactos.
- Actual: suite completa de card (Card, CardHeader, CardContent, CardFooter), más flexible para layouts complejos.

## Similitudes estructurales

- Ambos exponen una superficie contenedora reusable.
- Ambos son base natural para paneles de información.

## Diferencias estructurales

- Rediseño prioriza simplicidad (una sola pieza).
- Actual prioriza descomposición en subslots.

## Decisión de transición

- Reutilizar Card actual y ajustar clases de uso por componente.
- Evitar reemplazo del API para no romper otras pantallas.

## Estado de transición

- Pendiente de ajustes por uso en mensajes y referencias.
