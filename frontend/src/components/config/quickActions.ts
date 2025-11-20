/**
 * Configuración de acciones rápidas para mensajes
 * Centraliza todas las opciones disponibles para usuarios
 */
export interface QuickAction {
  id: string;
  text: string;
  icon: string;
  generatesArtifact?: boolean;
}

export const quickActions: QuickAction[] = [
  {
    id: "resumen",
    text: "Resumir mensaje",
    icon: "fas fa-compress-alt",
  },
  {
    id: "explicar",
    text: "Explicar mejor",
    icon: "fas fa-graduation-cap",
  },
  {
    id: "ejemplo",
    text: "Dar ejemplo",
    icon: "fas fa-lightbulb",
  },
  {
    id: "mapa-mental",
    text: "Generar mapa mental",
    icon: "fas fa-project-diagram",
    generatesArtifact: true,
  },
];

/**
 * Configuración de etiquetas para parámetros de mensajes
 */
export const parameterLabels: Record<string, { label: string; icon: string }> = {
  resumen: {
    label: "Resumir",
    icon: "fas fa-compress-alt",
  },
  detallado: {
    label: "Explicar mejor",
    icon: "fas fa-expand-alt",
  },
  ejemplo: {
    label: "Dar ejemplo",
    icon: "fas fa-lightbulb",
  },
  mapa_mental: {
    label: "Mapa Mental",
    icon: "fas fa-project-diagram",
  },
};