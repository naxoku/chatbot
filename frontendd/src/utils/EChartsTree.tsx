import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";

interface DocumentReference {
  document: string;
  section: string;
  page: string;
  quote: string;
}

interface MindMapNodeData {
  name: string;
  subtitle?: string;
  icon?: string;
  children?: MindMapNodeData[];
  reference?: DocumentReference;
  value?: number;
}

interface NestedMindMapNode {
  name: string;
  subtitle?: string;
  icon?: string;
  children?: (NestedMindMapNode | unknown)[];
  reference?: DocumentReference;
  value?: number;
}

interface NestedMindMapData {
  data?: NestedMindMapNode;
  name?: string;
  children?: (NestedMindMapNode | unknown)[];
  id?: number;
  type?: string;
  icon?: string;
  color?: string;
  reference?: DocumentReference;
}

interface EChartsTreeProps {
  data: NestedMindMapData;
  onNodeClick?: (nodeData: MindMapNodeData) => void;
}

/**
 * Trunca texto largo con elipsis
 */
const truncateText = (text: string, maxLength: number = 35): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

const normalizeData = (data: NestedMindMapData): MindMapNodeData => {
  const actualData: NestedMindMapNode =
    data.data && data.data.children
      ? { ...data.data, reference: data.reference || data.data.reference }
      : {
          name: data.name || "Mapa Mental",
          children: data.children || [],
          reference: data.reference,
        };

  const normalizeNode = (
    node: NestedMindMapNode | unknown
  ): MindMapNodeData | null => {
    if (!node || typeof node !== "object") return null;
    const typedNode = node as NestedMindMapNode;
    if (!typedNode.name || typeof typedNode.name !== "string") return null;

    const fullName = typedNode.name;
    const fullSubtitle = typedNode.subtitle;

    const normalizedNode: MindMapNodeData = {
      name: truncateText(fullName, 40),
      subtitle: fullSubtitle ? truncateText(fullSubtitle, 50) : undefined,
      icon: typedNode.icon,
      reference: typedNode.reference,
      value: typedNode.value,
      // Guarda los textos completos
      fullName,
      fullSubtitle,
    };

    if (typedNode.children && Array.isArray(typedNode.children)) {
      const normalizedChildren = typedNode.children
        .map((child) => normalizeNode(child))
        .filter((child): child is MindMapNodeData => child !== null);

      if (normalizedChildren.length > 0) {
        normalizedNode.children = normalizedChildren;
      }
    }

    return normalizedNode;
  };

  const result = normalizeNode(actualData);
  if (!result) {
    return { name: "Error al cargar mapa mental" };
  }

  return result;
};

export const EChartsTree: React.FC<EChartsTreeProps> = ({
  data,
  onNodeClick,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    const chartInstance = chartInstanceRef.current;
    const normalizedData = normalizeData(data);

    const rootStyles = getComputedStyle(document.documentElement);
    const isDarkMode =
      rootStyles.getPropertyValue("color-scheme").trim() === "dark" ||
      document.documentElement.classList.contains("dark");

    const colors = {
      lineColor: isDarkMode ? "#60A5FA" : "#3B82F6",
      nodeColor: isDarkMode ? "#1E293B" : "#FFFFFF",
      nodeBorderColor: "#3B82F6",
      labelColor: isDarkMode ? "#F1F5F9" : "#0F172A",
      subtitleColor: isDarkMode ? "#94A3B8" : "#64748B",
      shadow: isDarkMode
        ? "rgba(59, 130, 246, 0.25)"
        : "rgba(59, 130, 246, 0.15)",
      tooltipBg: isDarkMode
        ? "rgba(15, 23, 42, 0.95)"
        : "rgba(255, 255, 255, 0.98)",
      quoteBg: isDarkMode
        ? "rgba(251, 191, 36, 0.1)"
        : "rgba(254, 243, 199, 0.4)",
      background: isDarkMode ? "#0F172A" : "#F8FAFC",
    };

    const option: EChartsOption = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",
        backgroundColor: colors.tooltipBg,
        borderColor: colors.nodeBorderColor,
        borderWidth: 1,
        borderRadius: 6,
        padding: [10, 14],
        textStyle: {
          color: colors.labelColor,
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          const d = params.data as MindMapNodeData & {
            fullName?: string;
            fullSubtitle?: string;
          };

          const name = d.fullName ?? d.name;
          const subtitle = d.fullSubtitle ?? d.subtitle;

          if (d.reference) {
            return `
            <div style="max-width: 280px; font-family: 'Inter', sans-serif;">
              <div style="font-weight: 600; margin-bottom: 6px; font-size: 12px;">
                ${d.icon ?? "📄"} ${name}
              </div>
              <div style="font-size: 10px; color: ${
                colors.subtitleColor
              }; margin-bottom: 6px;">
                ${d.reference.document}
              </div>
              <div style="font-size: 10px; color: ${
                colors.subtitleColor
              }; margin-bottom: 6px;">
                📍 ${d.reference.section} · 📖 p.${d.reference.page}
              </div>
              <div style="margin-top: 6px; padding: 6px; background: ${
                colors.quoteBg
              };
                border-radius: 4px; font-size: 10px; font-style: italic;">
                "${d.reference.quote}"
              </div>
              <div style="margin-top: 6px; font-size: 9px; color: ${
                colors.nodeBorderColor
              };
                text-align: center;">
                💡 Click para detalles
              </div>
            </div>
            `;
          }

          return `<strong>${d.icon ?? ""} ${name}</strong>${
            subtitle
              ? `<br/><span style="font-size: 11px; color: ${colors.subtitleColor}">${subtitle}</span>`
              : ""
          }`;
        },
      },
      series: [
        {
          type: "tree",
          data: [normalizedData],
          layout: "orthogonal",
          orient: "LR",
          top: "5%",
          left: "2%",
          bottom: "5%",
          right: "18%",
          edgeShape: "curve", // 🔥 Conexiones curvas (más suaves)
          symbolSize: 7,
          roam: true,
          lineStyle: {
            width: 1.5,
            color: colors.lineColor,
          },
          itemStyle: {
            color: colors.nodeColor,
            borderColor: colors.nodeBorderColor,
            borderWidth: 1.5,
            shadowBlur: 4,
            shadowColor: colors.shadow,
          },
          emphasis: {
            focus: "ancestor",
            itemStyle: {
              borderWidth: 2,
              shadowBlur: 8,
            },
          },
          label: {
            show: true,
            position: "right",
            align: "left",
            verticalAlign: "middle",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: 10.5,
            color: colors.labelColor,
            backgroundColor: colors.nodeColor,
            borderColor: colors.nodeBorderColor,
            borderWidth: 1,
            borderRadius: 5,
            padding: [5, 9],
            shadowBlur: 3,
            shadowColor: colors.shadow,
            lineHeight: 16,
            width: 180,
            overflow: "truncate", // 🔥 truncar texto, no cortar líneas
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) => {
              const d = params.data as MindMapNodeData;
              const name = truncateText(d.name, 40);
              const subtitle = d.subtitle ? truncateText(d.subtitle, 45) : "";
              let label = d.icon ? `${d.icon} ${name}` : name;
              if (subtitle) label += ` — ${subtitle}`;
              return label;
            },
          },
          leaves: {
            label: {
              position: "right",
              align: "left",
              verticalAlign: "middle",
              backgroundColor: colors.nodeColor,
              borderColor: colors.nodeBorderColor,
              borderWidth: 1,
              borderRadius: 5,
              padding: [5, 8],
              color: colors.labelColor,
              fontSize: 10,
              shadowBlur: 3,
              shadowColor: colors.shadow,
              width: 160,
              overflow: "truncate",
            },
          },
          expandAndCollapse: true,
          animationDuration: 300,
          animationDurationUpdate: 400,
          initialTreeDepth: 3,
        },
      ],
    };

    chartInstance.setOption(option, true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartInstance.on("click", function (params: any) {
      if (params.data.reference && onNodeClick) {
        onNodeClick(params.data);
      }
    });

    const handleResize = () => {
      chartInstance.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.off("click");
    };
  }, [data, onNodeClick]);

  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={chartRef}
      className="w-full h-full min-h-[700px] bg-slate-50 dark:bg-slate-950"
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export type { MindMapNodeData, NestedMindMapData };
export default EChartsTree;
