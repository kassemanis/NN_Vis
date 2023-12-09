class Piechart {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth ||100,
      containerHeight: _config.containerHeight || 300,
      margin: _config.margin || { top: 0, right: 0, bottom: 1, left: 0 },
      tooltipPadding: _config.tooltipPadding || 15,
    };

    this.data = _data;
    this.legendData = Object.keys(colors); // Legend data
    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    vis.radius = Math.min(vis.width, vis.height);

    vis.color = d3.scaleOrdinal().range(Object.values(colors));

    vis.arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(vis.radius);

    vis.pie = d3.pie().value((d) => d.count);

    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)
      .append("g")
      .attr(
        "transform",
        `translate(${vis.width / 2},${vis.height / 2 + vis.config.margin.top})`
      );

    // Initialize the legend
    vis.initLegend();
  }

  initLegend() {
    const vis = this;

    // Create a legend container
    const legendContainer = d3.select("#legend");

    // Create legend items with colored squares and labels
    const legendItems = legendContainer
      .selectAll(".legend-item")
      .data(vis.legendData)
      .enter()
      .append("div")
      .attr("class", "legend-item")
      .on("click", function (event, d) {
        // Toggle the active/inactive status of the story part
        const isActive = partFilter.includes(d);
        if (isActive) {
          partFilter = partFilter.filter((f) => f !== d);
        } else {
          partFilter.push(d);
        }
        filterData();

        // Toggle the "active" class on the legend item
        d3.select(this).classed("active", !isActive);
      });

    // Add colored squares to the legend items
    legendItems
      .append("div")
      .attr("class", "legend-square")
      .style("background-color", (d) => colors[d]);

    // Add labels to the legend items
    legendItems
      .append("div")
      .attr("class", "legend-label")
      .text((d) => d);
  }

  updateVis() {
    let vis = this;

    const aggregatedDataMap = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d["Story"]
    );

    vis.aggregatedData = Array.from(aggregatedDataMap, ([key, count]) => ({
      key,
      count,
    }));

    vis.aggregatedData = vis.aggregatedData.sort(
      (a, b) => storyParts.indexOf(a.key) - storyParts.indexOf(b.key)
    );

    vis.arcGroup = vis.svg
      .selectAll(".arc")
      .data(vis.pie(vis.aggregatedData))
      .enter()
      .append("g")
      .attr("class", "arc");

    vis.arcGroup
      .append("path")
      .attr("d", vis.arc)
      .attr("fill", (d) => vis.color(d.data.key))
      .on("mouseover", (event, d) => {
        d3.select("#barchartTooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px")
          .html(`
            <div class="tooltip-title">${"Number of Stands"}</div>
            <div class="Part details">
              <div>
                <h1>${d.data.count}</h1>
              </div>
            </div>
          `);
      })
      .on("mouseleave", () => {
        d3.select("#barchartTooltip").style("display", "none");
      })
      .on("click", function (event, d) {
        const isActive = partFilter.includes(d.data.key);
        if (isActive) {
          partFilter = partFilter.filter((f) => f !== d.data.key);
        } else {
          partFilter.push(d.data.key);
        }
        filterData();
        d3.select(this).classed("active", !isActive);
      });

    vis.svg
      .selectAll(".arc-text")
      .data(vis.pie(vis.aggregatedData))
      .enter()
      .append("text")
      .attr("class", "arc-text")
      .attr("transform", (d) => `translate(${vis.arc.centroid(d)})`)
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text((d) => d.data.key)
      .attr("width", '100%')   // Set width to 100%
      .attr("height", '100%')  // Set height to 100%
      .attr("viewBox", `0 0 ${vis.width} ${vis.height}`)  // Add viewBox for responsiveness

    vis.svg.selectAll(".arc").exit().remove();
    vis.svg.selectAll(".arc-text").remove();

    // Call the createLegend method to create/update the legend
    vis.createLegend();
  }
}
