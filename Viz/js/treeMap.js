// ... (previous code)

// Define your data for the tree map (replace with your actual data)
const treeMapData = [
    { name: "Part 1: Phantom Blood", parent: "", value: 100 },
    { name: "Part 2: Battle Tendency", parent: "", value: 120 },
    { name: "Part 3: Stardust Crusaders", parent: "", value: 140 },
    { name: "Part 4: Diamond is Unbreakable", parent: "", value: 160 },
    { name: "Part 5: Vento Aureo", parent: "", value: 180 },
    { name: "Part 6: Stone Ocean", parent: "", value: 200 },
    { name: "Part 7: Steel Ball Run", parent: "", value: 220 },
    { name: "Part 8: JoJolion", parent: "", value: 240 },
  ];
  
  // Function to render the tree map
  function renderTreeMap(data) {
    // Set up the dimensions and margins for the tree map
    const width = 800; // Specify the desired width
    const height = 600; // Specify the desired height
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  
    // Calculate the inner dimensions of the tree map
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
  
    // Create an SVG element for the tree map
    const svg = d3.select("#tree-map")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    // Create a group element for the tree map content
    const treeMap = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    // Create a hierarchical data structure for the tree map using d3.hierarchy
    const root = d3.stratify()
      .id((d) => d.name)
      .parentId((d) => d.parent)(data);
  
    // Create a treemap layout
    const treemapLayout = d3.treemap()
      .size([innerWidth, innerHeight])
      .padding(1);
  
    // Calculate the positions and sizes of the tree map nodes
    treemapLayout(root);
  
  // Create color scale based on your categories (parts)
  const colorScale = d3.scaleOrdinal()
    .domain(data.map((d) => d.name))
    .range(["#FDB813", "#0080C9", "#FF6F61", "#87CEEB", "#4CAF50", "#DA70AF", "#800080"]);

  // Create rectangles for the tree map nodes with fill based on categories
  const nodes = treeMap.selectAll("rect")
    .data(root.descendants())
    .enter()
    .append("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("fill", (d) => colorScale(d.data.name)); // Use the color scale

  
    // Add text labels to the tree map nodes
    treeMap.selectAll("text")
      .data(root.descendants())
      .enter()
      .append("text")
      .attr("x", (d) => (d.x0 + d.x1) / 2)
      .attr("y", (d) => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text((d) => d.data.name);
  
    // Create a tooltip div
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  
    // Add mouseover and mouseout event handlers to show/hide the tooltip
    nodes.on("mouseover", (event, d) => {
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html(`<strong>${d.data.name}</strong><br>Value: ${d.value}`)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
      .on("mouseout", (d) => {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  }
  
  // Call the renderTreeMap function with your data
  renderTreeMap(treeMapData);
  