console.log("Script loaded");

// Dimensions for the heatmap and stacked bar chart
const margin = { top: 50, right: 30, bottom: 30, left: 50 };
const width = 1000 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Get the card elements by their IDs
const heatmapCardElement = document.getElementById('heatmap_viz');
const stackedBarChartCardElement = document.getElementById('stacked_bar_chart');

// Create SVG container for the heatmap
const svgHeatmap = d3.select(heatmapCardElement)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create SVG container for the stacked bar chart
const svgStackedBarChart = d3.select(stackedBarChartCardElement)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Define the color scale for the stacked bar chart
const colorScale = d3.scaleOrdinal(d3.schemeCategory10.slice(0, 5));

// Define the color scale for the heatmap
const colorScaleHeatmap = d3.scaleSequential(d3.interpolateBlues).domain([1, 5]);

// Function to convert CSV to desired data format

// Function to convert CSV to the desired data format
function convertCSVToData(csv) {
    const parsed = Papa.parse(csv, { header: true });
    const data = parsed.data.map(item => {
        const formattedItem = { story: item.Story, image: item.Image };
        delete item.Stand;
        delete item.Story;
        delete item.Image;
        Object.keys(item).forEach(attr => {
            formattedItem[attr] = convertAttributeToNumber(item[attr]);
        });
        return formattedItem;
    });
    return data;
}

// Helper function to convert attribute to number based on your mapping
function convertAttributeToNumber(attribute) {
    const mapping = { 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5 };
    return mapping[attribute] || 0;
}

// Load data from CSV
d3.csv("data/jojo.csv").then(function (rawData) {
    // Convert CSV data to desired format
    const data = convertCSVToData(Papa.unparse(rawData));

    // Extract column names (attributes) from the data
    const attributes = Object.keys(data[0]).filter(d => d !== "story" && d !== "image");
    const storyParts = [
        "Part 3",
        "Part 4",
        "Part 5",
        "Part 6",
        "Part 7",
        "Part 8"
      ];

    // Create heatmap cells
    const cells = svgHeatmap.selectAll(".cell-group")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "cell-group")
        .attr("transform", (d, i) => `translate(0,${i * (height / data.length)})`);

    cells.selectAll(".cell")
        .data(d => attributes.map(attr => ({ story: d.story, attribute: attr, value: d[attr], image: d.image })))
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", (d, i) => i * (width / attributes.length))
        .attr("width", width / attributes.length)
        .attr("height", height / data.length)
        .style("fill", d => colorScaleHeatmap(d.value))
        .on("mouseover", function (event, d) {
            d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
            svgHeatmap.append("svg:image")
                .attr("xlink:href", d.image)
                .attr("x", width + margin.left)
                .attr("y", margin.top)
                .attr("width", 50)
                .attr("height", 50);
        })
        .on("mouseout", function () {
            d3.select(this).attr("stroke", "none");
            svgHeatmap.selectAll("svg:image").remove();
        });

    // Add labels to the heatmap
    const labels = svgHeatmap.selectAll(".y-labels")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "y-labels")
        .attr("x", -margin.left)
        .attr("y", (d, i) => i * (height / data.length) + (height / data.length) / 2)
        .attr("text-anchor", "end")
        .text(d => d.story);

    const xLabels = svgHeatmap.selectAll(".x-labels")
        .data(attributes)
        .enter()
        .append("text")
        .attr("class", "x-labels")
        .attr("x", (d, i) => i * (width / attributes.length) + (width / attributes.length) / 2)
        .attr("y", height + 20)
        .attr("text-anchor", "middle")
        .text(d => d);

    // Create stacked bars for the bar chart
    const stackedBars = svgStackedBarChart.selectAll(".stacked-bar")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "stacked-bar")
        .attr("transform", (d, i) => `translate(0,${i * (height / data.length)})`);

    stackedBars.selectAll(".bar-segment")
        .data(d => attributes.map(attr => ({ attribute: attr, value: d[attr] })))
        .enter()
        .append("rect")
        .attr("class", "bar-segment")
        .attr("x", (d, i) => i * (width / attributes.length))
        .attr("width", width / attributes.length)
        .attr("y", d => height - d.value * (height / 5))
        .attr("height", d => d.value * (height / 5))
        .style("fill", (d, i) => colorScale(i + 1));

    // Add labels to the bar chart
    const labelsBarChart = svgStackedBarChart.selectAll(".y-labels")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "y-labels")
        .attr("x", -margin.left)
        .attr("y", (d, i) => i * (height / data.length) + (height / data.length) / 2)
        .attr("text-anchor", "end")
        .text(d => d.story);

    const xLabelsBarChart = svgStackedBarChart.selectAll(".x-labels")
        .data(storyParts)
        .enter()
        .append("text")
        .attr("class", "x-labels")
        .attr("x", (d, i) => i * (width / storyParts.length) + (width / storyParts.length) / 2)
        .attr("y", height + 20)
        .attr("text-anchor", "middle")
        .text(d => d);

    // Add legend for heatmap
    // Add legend for heatmap
    const legend_hmap = svgHeatmap.selectAll(".legend_hmap")
        .data(colorScaleHeatmap.ticks(5))
        .enter()
        .append("g")
        .attr("class", "legend_hmap")
        .attr("transform", (d, i) => `translate(${i * 80},${-margin.top})`); // Adjust the spacing here

    legend_hmap.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => colorScaleHeatmap(d));

    legend_hmap.append("text")
        .attr("x", 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d.toFixed(2));


    // Add legend for bar chart
    const legendBarChart = svgStackedBarChart.selectAll(".legend")
        .data(colorScale.domain())
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${i * 20},${-margin.top})`);

    legendBarChart.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => colorScale(d));

    legendBarChart.append("text")
        .attr("x", 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d);

}).catch(function (error) {
    console.log("Error loading the data:", error);
});
