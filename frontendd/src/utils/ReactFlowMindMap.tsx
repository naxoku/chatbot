import React, { useState, useCallback, useEffect } from "react";
import type { Node, Edge } from "reactflow";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import * as dagre from "dagre";

// === CONFIGURACIÓN GLOBAL ===
const MAX_NODE_WIDTH = 320;
const MIN_NODE_WIDTH = 200;
const PADDING_X = 24;
const LINE_HEIGHT = 22;
const BASE_HEIGHT = 70;

// Tipos para datos de nodos en ReactFlow
interface FlowNodeData {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  hasChildren: boolean;
  expanded: boolean;
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
interface MindMapNodeData {
  name: string;
  subtitle?: string;
  icon?: string;
  children?: (MindMapNodeData | unknown)[];
}

// Tipos para datos de mapa mental con estructura anidada
interface NestedMindMapNode {
  name: string;
  subtitle?: string;
  icon?: string;
  children?: (NestedMindMapNode | unknown)[];
}

interface NestedMindMapData {
  data?: NestedMindMapNode;
  name?: string;
  children?: (NestedMindMapNode | unknown)[];
  id?: number;
  type?: string;
  icon?: string;
  color?: string;
}

// Tipos para colores de nodos
interface NodeColors {
  bg: string;
  text: string;
  border: string;
  shadow: string;
}

// Calcular ancho de texto
const measureTextWidth = (text: string, font = "14px Arial"): number => {
  if (!text) return 0;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = font;
  return ctx.measureText(text).width;
};

// Calcular altura según cantidad de líneas necesarias
const measureNodeHeight = (title: string, subtitle = ""): number => {
  const titleWidth = measureTextWidth(title, "16px Arial");
  const subtitleWidth = measureTextWidth(subtitle, "13px Arial");

  const maxWidth = Math.max(titleWidth, subtitleWidth);
  const lineCount = Math.ceil(maxWidth / (MAX_NODE_WIDTH - PADDING_X));
  const extraLines = subtitle ? 1 : 0;

  return BASE_HEIGHT + lineCount * LINE_HEIGHT + extraLines * LINE_HEIGHT;
};

// === Layout con dagre ===
const getLayoutedElements = (
  nodes: Node<FlowNodeData>[],
  edges: Edge[],
  direction = "LR"
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction, nodesep: 40, ranksep: 80 });

  nodes.forEach((node) => {
    const height = node.style?.height || BASE_HEIGHT;
    dagreGraph.setNode(node.id, {
      width: node.style?.width || MIN_NODE_WIDTH,
      height,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const height = node.style?.height || BASE_HEIGHT;

    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // Asegurar que las coordenadas son números
    const x = Number(nodeWithPosition.x) || 0;
    const y = Number(nodeWithPosition.y) || 0;
    const numHeight = Number(height) || BASE_HEIGHT;

    node.position = {
      x,
      y: y - numHeight / 2,
    };
  });

  return { nodes, edges };
};

// Colores según profundidad
const getNodeColors = (depth: number): NodeColors => {
  const colorSchemes: NodeColors[] = [
    {
      bg: "bg-primary/10 border-primary/20 text-primary",
      text: "text-primary",
      border: "border-primary/20",
      shadow: "shadow-primary/10",
    },
    {
      bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
      shadow: "shadow-blue-200/50 dark:shadow-blue-900/20",
    },
    {
      bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-800",
      shadow: "shadow-emerald-200/50 dark:shadow-emerald-900/20",
    },
    {
      bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800",
      shadow: "shadow-amber-200/50 dark:shadow-amber-900/20",
    },
    {
      bg: "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300",
      text: "text-pink-700 dark:text-pink-300",
      border: "border-pink-200 dark:border-pink-800",
      shadow: "shadow-pink-200/50 dark:shadow-pink-900/20",
    },
  ];

  return colorSchemes[depth % colorSchemes.length];
};

const convertToFlowElements = (data: NestedMindMapData) => {
  console.log(
    "🔍 [MindMap] convertToFlowElements - Datos de entrada:",
    JSON.stringify(data, null, 2)
  );

  // Validación de datos de entrada
  if (!data) {
    console.error("❌ [MindMap] Error: No se recibieron datos");
    return { nodes: [], edges: [] };
  }

  // Extraer los datos reales del mapa mental
  // Los datos pueden estar anidados en data.data o directamente en data
  const actualData: NestedMindMapNode =
    data.data && data.data.children
      ? data.data
      : {
          name: data.name || "Mapa Mental",
          children: data.children || [],
        };
  console.log(
    "📋 [MindMap] Datos reales extraídos:",
    JSON.stringify(actualData, null, 2)
  );

  if (!actualData.name) {
    console.error("❌ [MindMap] Error: El nodo raíz no tiene 'name'");
    return { nodes: [], edges: [] };
  }

  // Validar que tenemos children válidos
  if (!actualData.children || !Array.isArray(actualData.children)) {
    console.error(
      "❌ [MindMap] Error: No se encontraron children válidos en",
      actualData
    );
    return { nodes: [], edges: [] };
  }

  const nodes: Node<FlowNodeData>[] = [];
  const edges: Edge[] = [];
  let nodeId = 0;

  const processNode = (
    nodeData: MindMapNodeData,
    parentId: string | null = null,
    depth = 0
  ): string => {
    console.log("🔄 [MindMap] processNode - Procesando:", {
      name: nodeData.name,
      subtitle: nodeData.subtitle,
      children: nodeData.children?.length || 0,
      parentId,
      depth,
    });

    if (!nodeData.name || typeof nodeData.name !== "string") {
      console.error("❌ [MindMap] Error: nodeData.name es inválido:", nodeData);
      return `node-${nodeId++}`; // Devolver un ID incluso si hay error
    }

    const id = `node-${nodeId++}`;
    console.log(`📝 [MindMap] Creando nodo ${id} para:`, nodeData.name);

    const nodeWidth = Math.min(
      Math.max(
        measureTextWidth(nodeData.name, "16px Arial") + PADDING_X + 60,
        MIN_NODE_WIDTH
      ),
      MAX_NODE_WIDTH
    );

    const nodeHeight = measureNodeHeight(nodeData.name, nodeData.subtitle);
    const colors = getNodeColors(depth);

    console.log(
      "🎨 [MindMap] Calculando colores para profundidad",
      depth,
      ":",
      colors
    );
    console.log("📏 [MindMap] Dimensiones del nodo:", {
      width: nodeWidth,
      height: nodeHeight,
    });

    const nodeDataItem: Node<FlowNodeData> = {
      id,
      type: "custom",
      position: { x: 0, y: 0 },
      data: {
        id,
        title: nodeData.name,
        subtitle: nodeData.subtitle,
        icon: nodeData.icon,
        hasChildren: !!(nodeData.children && nodeData.children.length > 0),
        expanded: true,
        depth,
        colors,
        onToggle: () => {}, // ✅ Handler placeholder - se actualizará dinámicamente
      },
      style: { width: nodeWidth, height: nodeHeight },
    };

    console.log(
      "📋 [MindMap] Nodo creado:",
      JSON.stringify(nodeDataItem, null, 2)
    );
    nodes.push(nodeDataItem);

    if (parentId) {
      console.log("🔗 [MindMap] Creando edge de", parentId, "a", id);
      const edge: Edge = {
        id: `edge-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: "bezier",
        style: {
          stroke: "#3b82f6",
          strokeWidth: 3,
          opacity: 0.8,
        },
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#3b82f6",
          width: 20,
          height: 20,
        },
      };
      console.log("📋 [MindMap] Edge creado:", JSON.stringify(edge, null, 2));
      edges.push(edge);
    }

    if (nodeData.children) {
      console.log(
        "🌳 [MindMap] Procesando children de",
        nodeData.name,
        ":",
        nodeData.children?.length || 0,
        "elementos"
      );
      nodeData.children.forEach(
        (child: NestedMindMapNode | unknown, index: number) => {
          console.log(`🔍 [MindMap] Verificando child ${index}:`, child);
          if (child && typeof child === "object" && "name" in child) {
            console.log(`✅ [MindMap] Child ${index} es válido, procesando...`);
            processNode(child as NestedMindMapNode, id, depth + 1);
          } else {
            console.warn(`⚠️ [MindMap] Child ${index} es inválido:`, child);
          }
        }
      );
    } else {
      console.log("📭 [MindMap] No hay children para procesar");
    }

    console.log("🏁 [MindMap] Fin de processNode para:", nodeData.name);
    return id;
  };

  console.log(
    "🚀 [MindMap] Iniciando conversión con datos reales. Nodos:",
    nodes.length,
    "Edges:",
    edges.length,
    "Children disponibles:",
    actualData.children?.length || 0
  );

  try {
    processNode(actualData);

    console.log(
      "📊 [MindMap] Después de processNode. Nodos:",
      nodes.length,
      "Edges:",
      edges.length
    );
    console.log("🔄 [MindMap] Aplicando layout...");

    const result = getLayoutedElements(nodes, edges, "LR");

    console.log(
      "✅ [MindMap] Conversión completada. Nodos finales:",
      result.nodes.length,
      "Edges finales:",
      result.edges.length
    );
    console.log(
      "🎯 [MindMap] Primeros 3 nodos:",
      result.nodes
        .slice(0, 3)
        .map((n) => ({ id: n.id, title: n.data.title, position: n.position }))
    );

    return result;
  } catch (error) {
    console.error("💥 [MindMap] Error durante la conversión:", error);
    return { nodes: [], edges: [] };
  }
};

const CustomNode = React.memo<{ data: FlowNodeData; selected?: boolean }>(
  ({ data, selected }) => {
    const [isExpanded, setIsExpanded] = useState(data.expanded || false);
    const { colors } = data;
    
    // Detectar si es móvil
    const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;

    const handleToggle = useCallback(() => {
      const newExpanded = !isExpanded;
      setIsExpanded(newExpanded);
      if (data.onToggle) {
        data.onToggle(data.id, newExpanded);
      }
    }, [isExpanded, data]);

    return (
      <div
        className={`
        relative rounded-lg shadow-md border-2 p-3 sm:p-4
        cursor-pointer select-none
        transition-all duration-200 ease-out
        ${colors.bg} ${colors.border} ${colors.shadow}
        ${selected ? "ring-2 ring-primary/50" : ""}
        ${!isMobile ? "hover:scale-105 hover:shadow-lg" : "active:scale-95"}
        max-w-[${MAX_NODE_WIDTH}px] whitespace-normal wrap-break-word
        backdrop-blur-sm
        ${isMobile ? "touch-manipulation" : ""}
      `}
        onClick={handleToggle}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-2 h-2 sm:w-3 sm:h-3 bg-background border-2 border-primary shadow-sm"
        />

        <div className="flex items-start gap-2 sm:gap-3 relative z-10">
          {/* Icono con fondo */}
          {data.icon && (
            <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-background/20 flex items-center justify-center">
              <span className="text-lg sm:text-xl">{data.icon}</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-xs sm:text-sm leading-tight mb-1 ${colors.text}`}
            >
              {data.title}
            </h3>
            {data.subtitle && (
              <p
                className={`text-xs leading-relaxed ${colors.text} opacity-80`}
              >
                {data.subtitle}
              </p>
            )}
          </div>

          {/* Indicador de expansión */}
          {data.hasChildren && (
            <div className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-background/20 flex items-center justify-center">
              <svg
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-current transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}
        </div>

        <Handle
          type="source"
          position={Position.Right}
          className="w-2 h-2 sm:w-3 sm:h-3 bg-background border-2 border-primary shadow-sm"
        />
      </div>
    );
  }
);

const nodeTypes = {
  custom: CustomNode,
};

// Props para ReactFlowMindMap
interface ReactFlowMindMapProps {
  data: NestedMindMapData;
}

const ReactFlowMindMap: React.FC<ReactFlowMindMapProps> = ({ data }) => {
  console.log("🎯 [MindMap] ReactFlowMindMap renderizado con datos:", data);

  // Detectar si es dispositivo móvil
  const isMobile = window.innerWidth < 768;

  const { nodes: initialNodes, edges: initialEdges } =
    convertToFlowElements(data);

  console.log(
    "📈 [MindMap] Resultado inicial - Nodos:",
    initialNodes.length,
    "Edges:",
    initialEdges.length
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleToggle = useCallback(
    (nodeId: string, expanded: boolean) => {
      console.log("🔄 [MindMap] handleToggle llamado:", { nodeId, expanded });
      setNodes((nds) => {
        const hideDescendants = (
          parentId: string,
          nodesList: Node<FlowNodeData>[],
          edgesList: Edge[],
          hide: boolean
        ): Node<FlowNodeData>[] => {
          const childEdges = edgesList.filter((e) => e.source === parentId);
          let updatedNodes = [...nodesList];

          childEdges.forEach((edge) => {
            updatedNodes = updatedNodes.map((n) =>
              n.id === edge.target ? { ...n, hidden: hide } : n
            );
            updatedNodes = hideDescendants(
              edge.target,
              updatedNodes,
              edgesList,
              hide
            );
          });

          return updatedNodes;
        };

        let newNodes = nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, expanded } }
            : node
        );

        if (!expanded) {
          newNodes = hideDescendants(nodeId, newNodes, edges, true);
        } else {
          newNodes = hideDescendants(nodeId, newNodes, edges, false);
        }

        return newNodes;
      });

      setEdges((eds) =>
        eds.map((edge) =>
          edge.source === nodeId ? { ...edge, hidden: !expanded } : edge
        )
      );
    },
    [setNodes, setEdges, edges]
  );

  useEffect(() => {
    console.log("🔧 [MindMap] Inicializando handlers una sola vez");
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, onToggle: handleToggle },
      }))
    );
  }, [handleToggle, setNodes]);

  return (
    <div className="w-full h-full min-h-[700px] bg-background rounded-lg relative overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition={isMobile ? "top-right" : "bottom-left"}
        className="bg-background"
        defaultEdgeOptions={{
          type: "bezier",
          animated: !isMobile, // Sin animaciones en móvil para mejor rendimiento
          style: {
            stroke: "#3b82f6",
            strokeWidth: isMobile ? 2 : 3,
            opacity: 0.8,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#3b82f6",
            width: isMobile ? 16 : 20,
            height: isMobile ? 16 : 20,
          },
        }}
        minZoom={isMobile ? 0.3 : 0.1}
        maxZoom={isMobile ? 1.5 : 2}
        panOnDrag={!isMobile ? true : true}
        zoomOnScroll={!isMobile ? true : false}
        zoomOnPinch={true}
      >
        {/* Solo mostrar controles en desktop */}
        {!isMobile && (
          <Controls className="bg-background/90 backdrop-blur-sm border rounded-lg shadow-md" />
        )}
        
        {/* Solo mostrar minimapa en desktop */}
        {!isMobile && (
          <MiniMap
            className="bg-background/90 border rounded-lg shadow-md"
            nodeColor={(_node) => {
              return _node.data?.depth === 0
                ? "hsl(var(--primary))"
                : "hsl(var(--primary))";
            }}
            maskColor="transparent"
          />
        )}
        
        <Background
          color="hsl(var(--muted-foreground))"
          gap={isMobile ? 16 : 20}
          size={isMobile ? 0.5 : 1}
          variant={BackgroundVariant.Dots}
        />
      </ReactFlow>
    </div>
  );
};

export type { MindMapNodeData };
export { ReactFlowMindMap };
export default ReactFlowMindMap;
