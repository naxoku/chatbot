import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";

// === CONFIGURACIÓN GLOBAL ===
const MAX_NODE_WIDTH = 320;
const MIN_NODE_WIDTH = 200;
const PADDING_X = 24;
const LINE_HEIGHT = 22;
const BASE_HEIGHT = 70;

// 📏 calcular ancho de texto
const measureTextWidth = (text, font = "14px Arial") => {
  if (!text) return 0;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  return ctx.measureText(text).width;
};

// 📏 calcular altura según cantidad de líneas necesarias
const measureNodeHeight = (title, subtitle = "") => {
  const titleWidth = measureTextWidth(title, "16px Arial");
  const subtitleWidth = measureTextWidth(subtitle, "13px Arial");

  const maxWidth = Math.max(titleWidth, subtitleWidth);
  const lineCount = Math.ceil(maxWidth / (MAX_NODE_WIDTH - PADDING_X));
  const extraLines = subtitle ? 1 : 0;

  return BASE_HEIGHT + lineCount * LINE_HEIGHT + extraLines * LINE_HEIGHT;
};

// === Layout con dagre ===
const getLayoutedElements = (nodes, edges, direction = "LR") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 150 });

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

    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";

    node.position = {
      x: nodeWithPosition.x,
      y: nodeWithPosition.y - height / 2,
    };
  });

  return { nodes, edges };
};

// 🎨 Colores por nivel de profundidad
const getNodeColors = (depth, _isDarkMode) => {
  const colorSchemes = {
    light: [
      {
        bg: "bg-gradient-to-br from-purple-500 to-indigo-600",
        text: "text-white",
        border: "border-purple-400",
        shadow: "shadow-purple-200",
      },
      {
        bg: "bg-gradient-to-br from-blue-500 to-cyan-600",
        text: "text-white",
        border: "border-blue-400",
        shadow: "shadow-blue-200",
      },
      {
        bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
        text: "text-white",
        border: "border-emerald-400",
        shadow: "shadow-emerald-200",
      },
      {
        bg: "bg-gradient-to-br from-amber-500 to-orange-600",
        text: "text-white",
        border: "border-amber-400",
        shadow: "shadow-amber-200",
      },
      {
        bg: "bg-gradient-to-br from-pink-500 to-rose-600",
        text: "text-white",
        border: "border-pink-400",
        shadow: "shadow-pink-200",
      },
    ],
    dark: [
      {
        bg: "bg-gradient-to-br from-purple-600 to-indigo-700",
        text: "text-white",
        border: "border-purple-500",
        shadow: "shadow-purple-900/50",
      },
      {
        bg: "bg-gradient-to-br from-blue-600 to-cyan-700",
        text: "text-white",
        border: "border-blue-500",
        shadow: "shadow-blue-900/50",
      },
      {
        bg: "bg-gradient-to-br from-emerald-600 to-teal-700",
        text: "text-white",
        border: "border-emerald-500",
        shadow: "shadow-emerald-900/50",
      },
      {
        bg: "bg-gradient-to-br from-amber-600 to-orange-700",
        text: "text-white",
        border: "border-amber-500",
        shadow: "shadow-amber-900/50",
      },
      {
        bg: "bg-gradient-to-br from-pink-600 to-rose-700",
        text: "text-white",
        border: "border-pink-500",
        shadow: "shadow-pink-900/50",
      },
    ],
  };

  const scheme = _isDarkMode ? colorSchemes.dark : colorSchemes.light;
  return scheme[depth % scheme.length];
};

// 🚀 Convertir datos jerárquicos a nodos/aristas
const convertToFlowElements = (data, isDarkMode = false) => {
  const nodes = [];
  const edges = [];
  let nodeId = 0;

  const processNode = (nodeData, parentId = null, depth = 0) => {
    const id = `node-${nodeId++}`;

    const nodeWidth = Math.min(
      Math.max(
        measureTextWidth(nodeData.name, "16px Arial") + PADDING_X + 60,
        MIN_NODE_WIDTH
      ),
      MAX_NODE_WIDTH
    );

    const nodeHeight = measureNodeHeight(nodeData.name, nodeData.subtitle);
    const colors = getNodeColors(depth, isDarkMode);

    nodes.push({
      id,
      type: "custom",
      position: { x: 0, y: 0 },
      data: {
        id,
        title: nodeData.name,
        subtitle: nodeData.subtitle,
        icon: nodeData.icon,
        hasChildren: nodeData.children && nodeData.children.length > 0,
        expanded: true,
        isDarkMode,
        depth,
        colors,
        onToggle: () => {},
      },
      style: { width: nodeWidth, height: nodeHeight },
    });

    if (parentId) {
      const edgeColor = isDarkMode
        ? `url(#gradient-${depth})`
        : `url(#gradient-${depth})`;

      edges.push({
        id: `edge-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: "smoothstep",
        style: {
          stroke: edgeColor,
          strokeWidth: 3,
        },
        animated: true,
        markerEnd: {
          type: "arrowclosed",
          color: isDarkMode ? "#60a5fa" : "#3b82f6",
        },
      });
    }

    if (nodeData.children) {
      nodeData.children.forEach((child) => processNode(child, id, depth + 1));
    }

    return id;
  };

  processNode(data);
  return getLayoutedElements(nodes, edges, "LR");
};

const CustomNode = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(data.expanded || false);
  const [isHovered, setIsHovered] = useState(false);
  const { isDarkMode, colors } = data;

  // Usar isDarkMode para ajustar los estilos
  const borderColor = isDarkMode
    ? "border-purple-500/50"
    : "border-purple-400/50";
  const shadowColor = isDarkMode
    ? "shadow-purple-900/30"
    : "shadow-purple-200/50";

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
        relative rounded-2xl shadow-xl border-2 p-5 cursor-pointer
        transition-all duration-300 ease-out
        ${colors.bg} ${borderColor} ${shadowColor}
        ${selected ? "scale-110 shadow-2xl ring-4 ring-white/30" : ""}
        ${isHovered ? "scale-105 shadow-2xl" : ""}
        max-w-[${MAX_NODE_WIDTH}px] whitespace-normal break-words
        backdrop-blur-sm
      `}
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Efecto de brillo en hover */}
      <div
        className={`
        absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300
        ${isHovered ? "opacity-20" : ""}
        bg-gradient-to-br from-white to-transparent pointer-events-none
      `}
      />

      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 bg-white border-2 border-current shadow-lg transition-transform hover:scale-125"
      />

      <div className="flex items-start gap-4 relative z-10">
        {/* Icono con fondo */}
        <div
          className={`
          flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
          bg-white/20 backdrop-blur-sm shadow-inner
          transition-transform duration-300
          ${isHovered ? "scale-110 rotate-6" : ""}
        `}
        >
          <span className="text-3xl filter drop-shadow-lg">
            {data.icon || "📌"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`
            font-bold text-base leading-tight mb-1
            ${colors.text}
            drop-shadow-sm
          `}
          >
            {data.title}
          </h3>
          {data.subtitle && (
            <p
              className={`
              text-sm mt-2 leading-relaxed
              ${colors.text} opacity-90
            `}
            >
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Indicador de expansión mejorado */}
        {data.hasChildren && (
          <div
            className={`
            flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
            bg-white/20 backdrop-blur-sm
            transition-all duration-300
            ${isExpanded ? "rotate-90" : ""}
            ${isHovered ? "bg-white/30" : ""}
          `}
          >
            <svg
              className="w-4 h-4 text-white drop-shadow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Badge de profundidad */}
      {data.depth > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700">{data.depth}</span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-white border-2 border-current shadow-lg transition-transform hover:scale-125"
      />
    </div>
  );
};

const MemoizedCustomNode = React.memo(CustomNode);
const nodeTypes = {
  custom: MemoizedCustomNode,
};

const EdgeGradients = ({ isDarkMode }) => (
  <svg style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
      <linearGradient id="gradient-0" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={isDarkMode ? "#9333ea" : "#a855f7"} />
        <stop offset="100%" stopColor={isDarkMode ? "#4f46e5" : "#6366f1"} />
      </linearGradient>
      <linearGradient id="gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={isDarkMode ? "#3b82f6" : "#60a5fa"} />
        <stop offset="100%" stopColor={isDarkMode ? "#06b6d4" : "#22d3ee"} />
      </linearGradient>
      <linearGradient id="gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={isDarkMode ? "#10b981" : "#34d399"} />
        <stop offset="100%" stopColor={isDarkMode ? "#14b8a6" : "#2dd4bf"} />
      </linearGradient>
      <linearGradient id="gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={isDarkMode ? "#f59e0b" : "#fbbf24"} />
        <stop offset="100%" stopColor={isDarkMode ? "#f97316" : "#fb923c"} />
      </linearGradient>
      <linearGradient id="gradient-4" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={isDarkMode ? "#ec4899" : "#f472b6"} />
        <stop offset="100%" stopColor={isDarkMode ? "#f43f5e" : "#fb7185"} />
      </linearGradient>
    </defs>
  </svg>
);

const ReactFlowMindMap = ({
  data,
  layout = "horizontal",
  isDarkMode = false,
}) => {
  const { nodes: initialNodes, edges: initialEdges } = convertToFlowElements(
    data,
    layout,
    isDarkMode
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleToggle = useCallback(
    (nodeId, expanded) => {
      setNodes((nds) => {
        const hideDescendants = (parentId, nodesList, edgesList, hide) => {
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
    [edges, setNodes, setEdges]
  );

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, onToggle: handleToggle, isDarkMode },
      }))
    );
  }, [handleToggle, setNodes, isDarkMode]);

  return (
    <div
      className={`w-full h-full ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      } rounded-lg relative overflow-hidden`}
    >
      {/* Patrón de fondo decorativo */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${
              isDarkMode ? "#fff" : "#000"
            } 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <EdgeGradients isDarkMode={isDarkMode} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="relative z-10"
        defaultEdgeOptions={{
          animated: true,
        }}
      >
        <Controls
          className={`${
            isDarkMode
              ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700"
              : "bg-white/90 backdrop-blur-sm border border-gray-200"
          } rounded-xl shadow-xl`}
        />
        <MiniMap
          className={`${
            isDarkMode
              ? "bg-gray-800/90 border-gray-700"
              : "bg-white/90 border-gray-200"
          } rounded-xl shadow-xl border backdrop-blur-sm`}
          nodeColor={(_node) => {
            // Usar _node para determinar colores según la profundidad
            return _node.data?.depth === 0
              ? isDarkMode
                ? "#9333ea"
                : "#a855f7"
              : isDarkMode
              ? "#60a5fa"
              : "#3b82f6";
          }}
          maskColor={isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.6)"}
        />
        <Background
          color={isDarkMode ? "#4b5563" : "#d1d5db"}
          gap={24}
          size={1.5}
          variant="dots"
        />
      </ReactFlow>
    </div>
  );
};

export { ReactFlowMindMap };
export default ReactFlowMindMap;
