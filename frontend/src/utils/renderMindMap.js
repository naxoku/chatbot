// utils/renderMindMap.js
import * as d3 from "d3";

export function renderMindMap(jsonData, containerId) {
  const container = d3.select(`#${containerId}`);
  container.html(""); // limpiar contenedor previo

  const width = 960;
  const height = 600;
  const margin = { top: 50, right: 120, bottom: 50, left: 120 };

  let i = 0;
  const svg = container
    .append("svg")
    .attr("viewBox", [-margin.left, -margin.top, width, height])
    .attr("width", "100%")
    .attr(
      "style",
      "max-width: 100%; height: auto; font: 12px sans-serif; background: #f9fafb; border-radius: 8px;"
    );

  const g = svg.append("g");

  const root = d3.hierarchy(jsonData);
  root.x0 = height / 2;
  root.y0 = 0;
  root.descendants().forEach((d) => {
    d._children = d.children;
  });

  const dx = 20;
  const dy = width / (root.height + 1);
  const treeLayout = d3.tree().nodeSize([dx, dy]);

  update(root);

  function update(source) {
    const duration = 250;
    const nodes = root.descendants().reverse();
    const links = root.links();

    treeLayout(root);

    let x0 = Infinity;
    let x1 = -x0;
    root.each((d) => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    const height = x1 - x0 + margin.top + margin.bottom;

    const transition = svg
      .transition()
      .duration(duration)
      .attr("viewBox", [-margin.left, x0 - margin.top, width, height]);

    const node = g.selectAll("g.node").data(nodes, (d) => d.id || (d.id = ++i));

    const nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${source.y0},${source.x0})`)
      .attr("opacity", 0)
      .on("click", (event, d) => {
        d.children = d.children ? null : d._children;
        update(d);
      });

    nodeEnter
      .append("circle")
      .attr("r", 6)
      .attr("fill", (d) => (d._children ? "#3e8ed0" : "#60a5fa"))
      .attr("stroke", "#555");

    nodeEnter
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d._children ? -8 : 8))
      .attr("text-anchor", (d) => (d._children ? "end" : "start"))
      .text((d) => d.data.name)
      .clone(true)
      .lower()
      .attr("stroke", "white");

    node
      .merge(nodeEnter)
      .transition(transition)
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .attr("opacity", 1);

    node
      .exit()
      .transition(transition)
      .remove()
      .attr("transform", (d) => `translate(${source.y},${source.x})`)
      .attr("opacity", 0);

    const link = g.selectAll("path").data(links, (d) => d.target.id);

    const linkEnter = link
      .enter()
      .append("path")
      .attr("d", (d) => {
        const o = { x: source.x0, y: source.y0 };
        return d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)({ source: o, target: o });
      });

    link
      .merge(linkEnter)
      .transition(transition)
      .attr(
        "d",
        d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)
      );

    link
      .exit()
      .transition(transition)
      .remove()
      .attr("d", (d) => {
        const o = { x: source.x, y: source.y };
        return d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)({ source: o, target: o });
      });

    root.eachBefore((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }
}
