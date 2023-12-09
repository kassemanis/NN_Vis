const calculateStat = (statValue) => {
  if (!statValue) {
    return 0;
  }
  if (statValue === "none" || statValue === "unknown") {
    return 1;
  }
  if (statValue === "infinite") {
    return 10;
  }
  const tmp = statValue.charCodeAt(0) - 65;
  return 6 - tmp;
};

document.getElementById("select-stand-popup").style.display = "none";
const features = ["PWR", "SPD", "RNG", "STA", "PRC", "DEV"];

const storyParts = [
  "Part 3: Stardust Crusaders",
  "Part 4: Diamond is Unbreakable",
  "Part 5: Vento Aureo",
  "Part 6: Stone Ocean",
  "Part 7: Steel Ball Run",
  "Part 8: JoJolion",
  "Light Novel: Purple Haze Feedback",
  "Featured",
];

const colors = {
  "Part 3: Stardust Crusaders": "#FDB813",  // Yellow
  "Part 4: Diamond is Unbreakable": "#0080C9",  // Blue
  "Part 5: Vento Aureo": "#FF6F61",  // Red
  "Part 6: Stone Ocean": "#87CEEB",  // Sky Blue
  "Part 7: Steel Ball Run": "#4CAF50",  // Green
  "Part 8: JoJolion": "#DA70AF",  // Pink
  "Light Novel: Purple Haze Feedback": "#800080",  // Purple
  Featured: "#FFD700",  // Gold
};



let scatterplot, barchart, data, selectedStand;
let partFilter = [];
let everyStand = undefined;

const selectFromList = (standName) => {
  let selected = undefined;
  everyStand.map((x) => {
    if (x.Stand === standName) {
      selected = x;
    }
  });
  document.getElementById("select-stand-popup").style.display = "none";

  showStand(selected);
};

const selectStand = (stand) => {
  let equalStands = [];
  everyStand.map((x) => {
    if (x["PRC"] === stand["PRC"] && x["PWR"] === stand["PWR"]) {
      equalStands.push(x);
    }
  });
  if (equalStands.length > 1) {
    let html = "";
    equalStands.map((x) => {
      html += `<div id="${x.Stand}" class="popup-element"> ${x.Stand} </div>`;
    });
    document.getElementById("select-stand-popup").innerHTML = html;
    equalStands.map((x) => {
      document.getElementById(x.Stand).onclick = () => selectFromList(x.Stand);
    });
    document.getElementById("select-stand-popup").style.display = "block";
  } else {
    showStand(stand);
  }
};

const showStand = (stand) => {
  d3.selectAll("svg.radar").remove();
  selectedStand = stand;
  document.getElementById("stand-chart").innerHTML = stand.Stand;
  const formatted = [
    {
      PWR: +calculateStat(stand["PWR"]),
      SPD: +calculateStat(stand["SPD"]),
      DEV: +calculateStat(stand["DEV"]),
      RNG: +calculateStat(stand["RNG"]),
      STA: +calculateStat(stand["STA"]),
      PRC: +calculateStat(stand["PRC"]),
    },
  ];

let width = 300;
let height = 300;
let svg = d3
  .select("#radarChart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .classed("radar", true);

// Adjust the range to fit within the smaller size
let radialScale = d3.scaleLinear().domain([0, 10]).range([0, Math.min(width / 2, height / 2)]);

let ticks = [0, 1, 2, 3, 4, 5, 6, 10];

svg
  .selectAll("circle")
  .data(ticks)
  .join((enter) =>
    enter
      .append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
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
      .attr("x", width / 2 + 5)
      .attr("y", (d) => height / 2 - radialScale(d))
      .text((d) => d.toString())
  );

function angleToCoordinate(angle, value) {
  let x = Math.cos(angle) * radialScale(value);
  let y = Math.sin(angle) * radialScale(value);
  return { x: width / 2 + x, y: height / 2 - y };
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

// draw axis line
svg
.selectAll("line")
.data(featureData)
.join((enter) =>
  enter
    .append("line")
    .attr("x1", width / 2)
    .attr("y1", height / 2)
    .attr("x2", (d) => d.line_coord.x)
    .attr("y2", (d) => d.line_coord.y)
    .attr("stroke", "black")
);


  let line = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y);

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
        .attr("fill", () => {
          return colors[selectedStand.Story];
        })
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.7)
    );

  document.getElementById(
    "stand-bg"
  ).style.backgroundImage = `url(${selectedStand.Image})`;
};

// Add this function to create the legend
function createLegend() {
  const legendContainer = document.getElementById("legend");
  const legendItems = Object.keys(colors);

  legendItems.forEach((item) => {
    const legendItem = document.createElement("div");
    legendItem.className = "legend-item";
    legendItem.innerHTML = `
      <div class="legend-color" style="background-color: ${colors[item]}"></div>
      <div class="legend-label">${item}</div>
    `;

    // Add a click event listener to toggle the active/inactive status
    legendItem.addEventListener("click", () => {
      const isActive = partFilter.includes(item);
      if (isActive) {
        partFilter = partFilter.filter((f) => f !== item);
      } else {
        partFilter.push(item);
      }
      filterData();
      legendItem.classList.toggle("active", !isActive);
    });

    legendContainer.appendChild(legendItem);
  });
}

// Add this code to call the createLegend function after data is loaded
d3.csv("data/jojo.csv")
  .then((_data) => {
    // Initialize chart
    console.log(_data);
    everyStand = _data;
    console.log(everyStand);
    data = _data;
    scatterplot = new Scatterplot({ parentElement: "#scatterplot" }, data);

    // Show chart
    scatterplot.updateVis();

    barchart = new Piechart({ parentElement: "#barchart" }, data);
    barchart.updateVis();

    // Call createLegend to create the legend
    createLegend();
  })
  .catch((error) => console.error(error));

function filterData() {
  if (partFilter.length == 0) {
    scatterplot.data = data;
  } else {
    scatterplot.data = data.filter((d) => partFilter.includes(d.Story));
  }
  scatterplot.updateVis();
}
