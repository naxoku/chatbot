import * as d3 from "d3";

export default function renderMindMap(data, selector) {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = ""; // limpiar contenido previo

  const width = container.clientWidth;
  const height = container.clientHeight;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Ejemplo simple: dibuja nodos como círculos
  data.nodes?.forEach((node, i) => {
    svg
      .append("circle")
      .attr("cx", Math.random() * width)
      .attr("cy", Math.random() * height)
      .attr("r", 20)
      .attr("fill", "purple");

    svg
      .append("text")
      .attr("x", Math.random() * width)
      .attr("y", Math.random() * height)
      .attr("fill", "white")
      .attr("font-size", 12)
      .text(node.label);
  });
}
