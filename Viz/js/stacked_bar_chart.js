console.log("hello world");

// Dimensions for the stacked bar chart
const marginStackedBarChart = { top: 50, right: 30, bottom: 30, left: 50 };
const widthStackedBarChart = 600 - marginStackedBarChart.left - marginStackedBarChart.right;
const heightStackedBarChart = 300 - marginStackedBarChart.top - marginStackedBarChart.bottom;

// Get the card element by its ID
const sbarCardElement = document.getElementById('stacked_bar_chart');

// Create SVG container for the stacked bar chart
const svgStackedBarChart = d3.select(sbarCardElement)
    .append("svg")
    .attr("width", widthStackedBarChart + marginStackedBarChart.left + marginStackedBarChart.right)
    .attr("height", heightStackedBarChart + marginStackedBarChart.top + marginStackedBarChart.bottom)
    .append("g")
    .attr("transform", `translate(${marginStackedBarChart.left},${marginStackedBarChart.top})`);

// Define the color scale as a sequential color scale

// Function to convert CSV to desired data format
function convertCSVToData(csv) {
    const parsed = Papa.parse(csv, { header: true });
    const data = parsed.data.map(item => {
        const formattedItem = { story: item.Story, image: item.Image };
        delete item.Story; // Remove story from the attributes
        delete item.Image; // Remove image from the attributes
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
    return mapping[attribute] || 0; // Default to 0 if not in the mapping
}

const stackedBarChartData = convertCSVToData(data);

// Extract column names (attributes) from the data
const attributesStackedBarChart = Object.keys(stackedBarChartData[0]).filter(d => d !== "story");

// Create stacked bars for the bar chart
const stackedBarsStackedBarChart = svgStackedBarChart.selectAll(".stacked-bar")
    .data(stackedBarChartData)
    .enter()
    .append("g")
    .attr("class", "stacked-bar")
    .attr("transform", (d, i) => `translate(0,${i * (heightStackedBarChart / stackedBarChartData.length)})`);

stackedBarsStackedBarChart.selectAll(".bar-segment")
    .data(d => attributesStackedBarChart.map(attr => ({ attribute: attr, value: d[attr] })))
    .enter()
    .append("rect")
    .attr("class", "bar-segment")
    .attr("x", (d, i) => i * (widthStackedBarChart / attributesStackedBarChart.length))
    .attr("width", widthStackedBarChart / attributesStackedBarChart.length)
    .attr("y", d => heightStackedBarChart - d.value * (heightStackedBarChart / 5)) // Adjusted for the mapping 1 to 5
    .attr("height", d => d.value * (heightStackedBarChart / 5))
    .style("fill", (d, i) => colorScale(i + 1));

// Add labels to the bar chart
const labelsStackedBarChart = svgStackedBarChart.selectAll(".y-labels")
    .data(stackedBarChartData)
    .enter()
    .append("text")
    .attr("class", "y-labels")
    .attr("x", -marginStackedBarChart.left)
    .attr("y", (d, i) => i * (heightStackedBarChart / stackedBarChartData.length) + (heightStackedBarChart / stackedBarChartData.length) / 2)
    .attr("text-anchor", "end")
    .text(d => d.story);

const xLabelsStackedBarChart = svgStackedBarChart.selectAll(".x-labels")
    .data(attributesStackedBarChart)
    .enter()
    .append("text")
    .attr("class", "x-labels")
    .attr("x", (d, i) => i * (widthStackedBarChart / attributesStackedBarChart.length) + (widthStackedBarChart / attributesStackedBarChart.length) / 2)
    .attr("y", heightStackedBarChart + 20)
    .attr("text-anchor", "middle")
    .text(d => d);

// Add legend for bar chart
const legendStackedBarChart = svgStackedBarChart.selectAll(".legend")
    .data(colorScale.ticks(5).slice(1))
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(${i * 20},${-marginStackedBarChart.top})`);

legendStackedBarChart.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", d => colorScale(d));

legendStackedBarChart.append("text")
    .attr("x", 25)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(d => d);
