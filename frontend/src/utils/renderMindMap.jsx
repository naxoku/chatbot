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
const MAX_NODE_WIDTH = 300; // ancho máximo px
const MIN_NODE_WIDTH = 180; // ancho mínimo px
const PADDING_X = 24; // padding horizontal
const LINE_HEIGHT = 20; // altura de línea px
const BASE_HEIGHT = 60; // altura mínima del nodo

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
  const titleWidth = measureTextWidth(title);
  const subtitleWidth = measureTextWidth(subtitle, "12px Arial");

  const maxWidth = Math.max(titleWidth, subtitleWidth);

  // cuántas líneas necesita
  const lineCount = Math.ceil(maxWidth / (MAX_NODE_WIDTH - PADDING_X));
  const extraLines = subtitle ? 1 : 0;

  return BASE_HEIGHT + lineCount * LINE_HEIGHT + extraLines * LINE_HEIGHT;
};

// === Layout con dagre ===
const getLayoutedElements = (nodes, edges, direction = "LR") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  // 📌 asignar ancho y alto dinámico
  nodes.forEach((node) => {
    const width = node.style?.width || MIN_NODE_WIDTH;
    const height = node.style?.height || BASE_HEIGHT;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = node.style?.width || MIN_NODE_WIDTH;
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

// 🚀 Convertir datos jerárquicos a nodos/aristas
const convertToFlowElements = (
  data,
  layout = "horizontal",
  isDarkMode = false
) => {
  const nodes = [];
  const edges = [];
  let nodeId = 0;

  const processNode = (nodeData, parentId = null) => {
    const id = `node-${nodeId++}`;

    // calcular ancho dinámico
    const nodeWidth = Math.min(
      Math.max(measureTextWidth(nodeData.name) + PADDING_X, MIN_NODE_WIDTH),
      MAX_NODE_WIDTH
    );

    // calcular altura dinámica
    const nodeHeight = measureNodeHeight(nodeData.name, nodeData.subtitle);

    nodes.push({
      id,
      type: "custom",
      position: { x: 0, y: 0 }, // dagre reposiciona
      data: {
        id,
        title: nodeData.name,
        subtitle: nodeData.subtitle,
        icon: nodeData.icon,
        hasChildren: nodeData.children && nodeData.children.length > 0,
        expanded: true,
        isDarkMode,
        onToggle: () => {},
      },
      style: { width: nodeWidth, height: nodeHeight },
    });

    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: "smoothstep",
        style: {
          stroke: isDarkMode ? "#60a5fa" : "#3b82f6",
          strokeWidth: 2,
        },
        animated: false,
      });
    }

    if (nodeData.children) {
      nodeData.children.forEach((child) => processNode(child, id));
    }

    return id;
  };

  processNode(data);
  return getLayoutedElements(nodes, edges, "LR");
};

const CustomNode = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(data.expanded || false);
  const { isDarkMode } = data;

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
    relative rounded-lg shadow-md border-2 p-4 cursor-pointer
    transition-all duration-200 hover:shadow-lg hover:scale-105
    max-w-[${MAX_NODE_WIDTH}px] whitespace-normal break-words
    ${
      selected
        ? isDarkMode
          ? "border-blue-400 shadow-blue-900/50 bg-gray-700"
          : "border-blue-500 shadow-blue-200 bg-blue-50"
        : isDarkMode
        ? "border-gray-600 bg-gray-800 hover:bg-gray-700"
        : "border-gray-200 bg-white hover:bg-gray-50"
    }
    ${
      isExpanded
        ? isDarkMode
          ? "bg-blue-900/30"
          : "bg-blue-50"
        : isDarkMode
        ? "bg-gray-800"
        : "bg-white"
    }
  `}
      onClick={handleToggle}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 ${isDarkMode ? "bg-blue-400" : "bg-blue-500"}`}
      />

      <div className="flex items-center gap-3">
        <div className="text-2xl">{data.icon}</div>
        <div className="flex-1">
          <h3
            className={`font-semibold text-sm ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {data.title}
          </h3>
          {data.subtitle && (
            <p
              className={`text-xs mt-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {data.subtitle}
            </p>
          )}
        </div>
        {data.hasChildren && (
          <div
            className={`transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            } ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            ▶
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 ${isDarkMode ? "bg-blue-400" : "bg-blue-500"}`}
      />
    </div>
  );
};

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

  const nodeTypes = { custom: CustomNode };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // 🔄 Manejar colapso/expansión de nodos
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
            // recursivo: colapsar también los nietos
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

        // si colapsamos, ocultamos todos los hijos y nietos
        if (!expanded) {
          newNodes = hideDescendants(nodeId, newNodes, edges, true);
        } else {
          // si expandimos, mostramos hijos directos
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

  // Inyectar `onToggle` en todos los nodos
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
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } rounded-lg`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className={isDarkMode ? "bg-gray-900" : "bg-gray-50"}
      >
        <Controls
          className={isDarkMode ? "bg-gray-800 text-white" : "bg-white"}
        />
        <MiniMap
          className={isDarkMode ? "bg-gray-800" : "bg-white"}
          nodeColor={isDarkMode ? "#60a5fa" : "#3b82f6"}
          maskColor={isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"}
        />
        <Background color={isDarkMode ? "#374151" : "#e5e7eb"} gap={20} />
      </ReactFlow>
    </div>
  );
};

// Compatibilidad con tu API actual
export function renderMindMap(jsonData, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const reactContainer = document.createElement("div");
  container.innerHTML = "";
  container.appendChild(reactContainer);

  import("react-dom/client").then(({ createRoot }) => {
    const root = createRoot(reactContainer);
    root.render(React.createElement(ReactFlowMindMap, { data: jsonData }));
  });
}

export { ReactFlowMindMap };
export default ReactFlowMindMap;
