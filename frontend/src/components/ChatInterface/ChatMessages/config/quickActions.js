/**
 * Configuración de acciones rápidas para mensajes
 * Centraliza todas las opciones disponibles para usuarios
 */

export const quickActions = [
  {
    id: "resumen",
    text: "Resumir mensaje",
    icon: "fas fa-compress-alt",
    color: "blue",
    description: "Crear un resumen del contenido del mensaje",
  },
  {
    id: "explicar",
    text: "Explicar mejor",
    icon: "fas fa-graduation-cap",
    color: "green",
    description: "Solicitar una explicación más detallada",
  },
  {
    id: "ejemplo",
    text: "Dar ejemplo",
    icon: "fas fa-lightbulb",
    color: "yellow",
    description: "Pedir ejemplos prácticos relacionados",
  },
  {
    id: "mapa-mental",
    text: "Generar mapa mental",
    icon: "fas fa-project-diagram",
    color: "teal",
    description: "Crear un mapa mental del contenido del mensaje",
    generatesArtifact: true,
  },
];

/**
 * Configuración de etiquetas para parámetros de mensajes
 */
export const parameterLabels = {
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

/**
 * Configuración para iconos y colores de documentos
 */
export const documentConfig = {
  icons: {
    pdf: "fas fa-file-pdf",
    doc: "fas fa-file-word", 
    docx: "fas fa-file-word",
    txt: "fas fa-file-alt",
    url: "fas fa-link",
  },
  colors: {
    pdf: "text-red-500 bg-red-100",
    doc: "text-blue-500 bg-blue-100",
    docx: "text-blue-500 bg-blue-100",
    txt: "text-gray-500 bg-gray-100",
    url: "text-green-500 bg-green-100",
  }
};