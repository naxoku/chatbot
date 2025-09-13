// js/d3MapRenderer.js - Archivo nuevo para renderizar mapas mentales con D3.js

function renderMindMap(jsonData, containerSelector) {
  // 1. Limpiar el contenedor por si las moscas
  d3.select(containerSelector).html("");

  // 2. Definir dimensiones del SVG
  const width = 960;
  const height = 600;
  const margin = { top: 50, right: 120, bottom: 50, left: 120 };

  let i = 0; // Para dar IDs a los nodos

  // 3. Crear el lienzo SVG
  const svg = d3
    .select(containerSelector)
    .append("svg")
    .attr("viewBox", [-margin.left, -margin.top, width, height])
    .attr("width", "100%")
    // .attr("height", "auto")
    .attr(
      "style",
      "max-width: 100%; height: auto; font: 12px sans-serif; background: #f9fafb; border-radius: 8px;"
    )
    .classed("dark:bg-gray-700", true);

  const g = svg.append("g");

  // 4. Preparar la data con la jerarquía de D3
  const root = d3.hierarchy(jsonData);
  root.x0 = height / 2; // Arreglo la posición inicial, ahora usa la altura
  root.y0 = 0;

  // Guardar una copia de los hijos para colapsar
  root.descendants().forEach((d) => {
    d._children = d.children; // Guarda los hijos
    // Si quieres que el mapa comience colapsado, descomenta la siguiente línea:
    // if (d.depth) d.children = null;
  });

  const dx = 20;
  const dy = width / (root.height + 1);
  const treeLayout = d3.tree().nodeSize([dx, dy]);

  update(root); // Iniciar el renderizado

  function update(source) {
    const duration = 250;
    const nodes = root.descendants().reverse();
    const links = root.links();

    // Calcular la nueva posición de los nodos
    treeLayout(root);

    // Centrar el árbol para que se vea bien
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
      .attr("viewBox", [-margin.left, x0 - margin.top, width, height])
      .tween(
        "resize",
        window.ResizeObserver ? null : () => () => svg.dispatch("toggle")
      );

    // Actualizar los nodos
    const node = g.selectAll("g.node").data(nodes, (d) => d.id || (d.id = ++i));

    // Entrar en los nodos nuevos
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

    // Fusionar y actualizar los nodos
    const nodeUpdate = node
      .merge(nodeEnter)
      .transition(transition)
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .attr("opacity", 1);

    // Salir de los nodos viejos
    const nodeExit = node
      .exit()
      .transition(transition)
      .remove()
      .attr("transform", (d) => `translate(${source.y},${source.x})`)
      .attr("opacity", 0);

    // Actualizar los enlaces
    const link = g.selectAll("path").data(links, (d) => d.target.id);

    // Entrar en los enlaces nuevos
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

    // Fusionar y actualizar los enlaces
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

    // Salir de los enlaces viejos
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

    // Guardar las posiciones para la siguiente transición
    root.eachBefore((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }
}
