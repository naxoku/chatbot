/**
 * Utilidades para el manejo de artefactos de mensajes
 * Centraliza funciones para documentos, mapas mentales y otros artefactos
 */

export interface DocumentTypeInfo {
  icon: string;
  color: string;
}

/**
 * Obtiene el icono apropiado para un tipo de documento
 * @param url URL del documento
 * @returns Clase CSS del icono
 */
export const getDocumentIcon = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'fas fa-file-pdf';
    case 'doc':
    case 'docx':
      return 'fas fa-file-word';
    case 'txt':
      return 'fas fa-file-alt';
    case 'xls':
    case 'xlsx':
      return 'fas fa-file-excel';
    case 'ppt':
    case 'pptx':
      return 'fas fa-file-powerpoint';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return 'fas fa-file-image';
    case 'zip':
    case 'rar':
    case '7z':
      return 'fas fa-file-archive';
    default:
      return 'fas fa-link';
  }
};

/**
 * Obtiene el estilo de color apropiado para un tipo de documento
 * @param type Tipo de documento
 * @returns Clases CSS para el color de fondo y texto
 */
export const getDocumentColor = (type?: string): string => {
   switch (type) {
     case 'pdf':
       return 'text-destructive/80 bg-destructive/10';
     case 'doc':
     case 'docx':
       return 'text-primary/80 bg-primary/10';
     case 'txt':
       return 'text-muted/80 bg-muted/10';
     case 'xls':
     case 'xlsx':
       return 'text-accent/80 bg-accent/10';
     case 'png':
     case 'jpg':
     case 'jpeg':
     case 'gif':
       return 'text-accent/80 bg-accent/10';
     default:
       return 'text-primary/80 bg-primary/10';
   }
 };

/**
 * Determina si un artefacto es un mapa mental
 * @param artifact Artefacto a evaluar
 * @returns true si el artefacto es un mapa mental
 */
export const isMindMapArtifact = (artifact: boolean | unknown): boolean => {
  return typeof artifact === 'boolean' && artifact === true;
};

/**
 * Valida que un objeto tenga la estructura de un mapa mental
 * @param data Datos del artefacto
 * @returns true si es un mapa mental válido
 */
export const isValidMindMapData = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  const mindMapData = data as Record<string, unknown>;
  return (
    Array.isArray(mindMapData.nodes) &&
    Array.isArray(mindMapData.edges) &&
    mindMapData.nodes.length > 0
  );
};