// Tipos para ReactFlowMindMap
export interface NodeData {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  hasChildren: boolean;
  expanded: boolean;
  isDarkMode: boolean;
  depth: number;
  colors: {
    bg: string;
    text: string;
    border: string;
    shadow: string;
  };
  onToggle: (nodeId: string, expanded: boolean) => void;
}

// Tipos para datos jerárquicos de mapas mentales
export interface MindMapNodeData {
  name: string;
  subtitle?: string;
  icon?: string;
  children?: MindMapNodeData[];
}

// Props para componentes de mapa mental
export interface MindMapProps {
  data: MindMapNodeData;
  layout?: "horizontal" | "vertical";
  isDarkMode?: boolean;
}

// Configuración de colores
export interface ColorScheme {
  bg: string;
  text: string;
  border: string;
  shadow: string;
}

// Tipos adicionales para ReactFlow
export interface FlowNodeData {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  hasChildren: boolean;
  expanded: boolean;
  isDarkMode: boolean;
  depth: number;
  colors: ColorScheme;
  onToggle: (nodeId: string, expanded: boolean) => void;
}