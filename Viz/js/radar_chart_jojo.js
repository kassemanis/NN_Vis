class RadarChart {
  constructor(_config, _data) {
    this.data = _data;
  }

  updateVis() {
    const stand = this.data;
    d3.selectAll("svg.radar").remove();

    let containerSize = 300; // Set to the desired size (same as Scatterplot)
    let margin = 20; // Margin to provide some spacing

    let width = containerSize - 2 * margin;
    let height = containerSize - 2 * margin;

    let svg = d3
      .select("#radarChart")
      .append("svg")
      .attr("width", containerSize)
      .attr("height", containerSize)
      .classed("radar", true);

    let radialScale = d3.scaleLinear().domain([0, 10]).range([0, width / 2]);

    let ticks = [0, 1, 2, 3, 4, 5, 6, 10];

    svg
      .selectAll("circle")
      .data(ticks)
      .join((enter) =>
        enter
          .append("circle")
          .attr("cx", width / 2 + margin)
          .attr("cy", height / 2 + margin)
          .attr("fill", "none")
          .attr("stroke", "gray")
          .attr("r", (d) => radialScale(d))
      );

    svg
      .selectAll(".ticklabel")
      .data(ticks)
      .join((enter) =>
        enter
          .append("text")
          .attr("class", "ticklabel")
          .attr("x", width / 2 + margin + 5)
          .attr("y", (d) => height / 2 + margin - radialScale(d))
          .text((d) => d.toString())
      );

    function angleToCoordinate(angle, value) {
      let x = Math.cos(angle) * radialScale(value);
      let y = Math.sin(angle) * radialScale(value);
      return { x: width / 2 + margin + x, y: height / 2 + margin - y };
    }

    let featureData = features.map((f, i) => {
      let angle = Math.PI / 2 + (2 * Math.PI * i) / features.length;
      return {
        name: f,
        angle: angle,
        line_coord: angleToCoordinate(angle, 10),
        label_coord: angleToCoordinate(angle, 10.5),
      };
    });

    // draw axis line
    svg
      .selectAll("line")
      .data(featureData)
      .join((enter) =>
        enter
          .append("line")
          .attr("x1", width / 2 + margin)
          .attr("y1", height / 2 + margin)
          .attr("x2", (d) => d.line_coord.x)
          .attr("y2", (d) => d.line_coord.y)
          .attr("stroke", "black")
      );

    // draw axis label
    svg
      .selectAll(".axislabel")
      .data(featureData)
      .join((enter) =>
        enter
          .append("text")
          .attr("x", (d) => d.label_coord.x)
          .attr("y", (d) => d.label_coord.y)
          .text((d) => d.name)
      );

    let line = d3
      .line()
      .x((d) => d.x)
      .y((d) => d.y);
    let spiderColors = ["darkorange", "gray", "navy"];

    function getPathCoordinates(data_point) {
      let coordinates = [];
      for (var i = 0; i < features.length; i++) {
        let ft_name = features[i];
        let angle = Math.PI / 2 + (2 * Math.PI * i) / features.length;
        coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
      }
      return coordinates;
    }

    svg
      .selectAll("path")
      .data(formatted)
      .join((enter) =>
        enter
          .append("path")
          .datum((d) => getPathCoordinates(d))
          .attr("d", line)
          .attr("stroke-width", 3)
          .attr("stroke", (_, i) => spiderColors[i])
          .attr("fill", (_, i) => "blue")
          .attr("stroke-opacity", 1)
          .attr("opacity", 0.5)
      );
  }
}
