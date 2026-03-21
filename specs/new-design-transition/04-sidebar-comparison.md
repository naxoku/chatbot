# Comparativa de Componente: Sidebar

## Equivalencia

- Rediseño: Sidebar compacto con identidad UCT y toggle lateral.
- Actual: frontend/src/components/sidebar/Sidebar.tsx

## Estructura y maquetado

- Rediseño: cabecera de marca, navegación mínima, estructura preparada para app shell limpia.
- Actual: app shell completo con escritorio colapsable + móvil en Sheet, lista de conversaciones, tema y logout.

## Similitudes estructurales

- Ambos son columna lateral persistente.
- Ambos tienen foco en navegación de alto nivel.

## Diferencias estructurales

- Actual incorpora más funcionalidades de gestión conversacional que el mock.
- Rediseño plantea cabecera más editorial y minimalista.

## Decisión de transición

- Conservar funcionalidad completa actual.
- Migrar progresivamente al layout visual del rediseño en header, densidad y espaciado.

## Estado de transición

- Pendiente de implementación en siguiente fase.
