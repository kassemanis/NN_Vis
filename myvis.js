const data = /* Your hyperparameter data */;

const width = 800;
const height = 400;

const svg = d3.select("#visualization-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Example: Create a line chart
const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.iteration)])
    .range([0, width]);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.learningRate)])
    .range([height, 0]);

const line = d3.line()
    .x(d => xScale(d.iteration))
    .y(d => yScale(d.learningRate));

svg.append("path")
    .datum(data)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "steelblue");


// Example: Add tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("cx", d => xScale(d.iteration))
    .attr("cy", d => yScale(d.learningRate))
    .attr("r", 5)
    .on("mouseover", d => {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`Iteration: ${d.iteration}<br>Learning Rate: ${d.learningRate}`)
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", d => {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

