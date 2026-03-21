# Comparativa de Componente: UserMessage

## Equivalencia

- Rediseño: UserMessage tipo cápsula editorial con cita contextual y adjuntos visibles dentro de la burbuja.
- Actual: frontend/src/components/messages/UserMessage.tsx

## Estructura y maquetado

- Rediseño: burbuja más orgánica (radio grande y esquina distintiva), tiempo externo y foco en lectura.
- Actual: burbuja primaria estándar con cita y acciones compactas.

## Similitudes estructurales

- Ambos soportan mostrar cita previa.
- Ambos permiten render de contenido enriquecido.
- Ambos muestran timestamp y acciones por mensaje.

## Diferencias estructurales

- Rediseño coloca metadatos en capa superior y tiempo en capa exterior discreta.
- Actual mantiene estructura interna más rígida y técnica.

## Decisión de transición

- Reordenar bloques internos para acercar ritmo visual del rediseño.
- Mantener acciones actuales para no perder capacidad funcional.

## Estado de transición

- Iniciado en esta iteración: actualización parcial de maquetado y jerarquía.
