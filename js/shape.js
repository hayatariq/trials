document.addEventListener("DOMContentLoaded", function() {
    console.log("shape.js loaded");

let sightingsData = [];  // Array to hold the sightings data
let lineChart;  // Global chart variable
let selectedDecade = null;  // Variable to track the selected decade
let shapeFrequencies = {}; // Object to store shape frequencies
let pieChart;
let currentPopularity = 'most'; // Default to 'most'

const shapeOrder = ["light", "triangle", "circle", "disk", "fireball", "sphere", "cigar", "oval", 
    "changing", "chevron", "cone", "cross", "cube", "cylinder", "diamond", "egg", "flash", "formation", 
    "orb", "other", "rectangle", "star", "unknown"];

// Load and parse the CSV data
Papa.parse('data/NUFORCdata.csv', {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(results) {
        results.data.forEach(function(row) {
            const eventDate = row.EventDate;  
            const year = new Date(eventDate).getFullYear();  
            const shape = row.Shape;

            sightingsData.push({
                year: year,
                shape: shape,
            });

            if (!shapeFrequencies[shape]) {
                shapeFrequencies[shape] = 0;
            }
            shapeFrequencies[shape]++;
        });

        createLineChart();
        createPieChart();
        console.log("Loaded data count:", results.data.length);

    }
});

function createPieChart() {
    const width = 250, height = 250, radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const svg = d3.select("#pie-chart")
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().sort(null).value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius - 20);

    // Tooltip setup
    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "5px 10px")
        .style("border-radius", "5px")
        .style("visibility", "hidden")
        .style("font-size", "14px");

    function updatePieChart(decade) {
        let filteredData;

        if (decade === "1960") {
            filteredData = sightingsData.filter(d => d.year < 1970); // <-- FIXED: includes all before 1970
        } else if (decade !== "All") {
            const decadeStart = parseInt(decade);
            filteredData = sightingsData.filter(d => d.year >= decadeStart && d.year < decadeStart + 10);
        } else {
            filteredData = sightingsData;
        }
        
        let shapeCounts = {};
        filteredData.forEach(d => {
            const shape = d.shape ? d.shape.trim().toLowerCase() : "unknown";
            shapeCounts[shape] = (shapeCounts[shape] || 0) + 1;
        });

        const data = shapeOrder.map(shape => ({
            name: shape,
            value: shapeCounts[shape] || 0
        }));

        const slices = svg.selectAll("path").data(pie(data));

        slices.enter()
            .append("path")
            .attr("fill", d => color(d.data.name))
            .attr("d", arc)
            .each(function(d) { this._current = d; })
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .text(`${d.data.name}: ${d.data.value} sightings`);
                d3.select(this).attr("opacity", 0.7);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
                d3.select(this).attr("opacity", 1);
            });

        slices.transition().duration(500)
            .attrTween("d", function(d) {
                const i = d3.interpolate(this._current, d);
                this._current = i(1);
                return t => arc(i(t));
            });

        slices.exit().remove();
    }

    document.getElementById("decade-dropdown-shape").addEventListener("change", function() {
        updatePieChart(this.value);
    });

    updatePieChart("All");
}


function createLineChart() {
    const sightingsByYear = {};
    sightingsData.forEach(sighting => {
        const year = sighting.year;
        sightingsByYear[year] = (sightingsByYear[year] || 0) + 1;
    });

    const minYear = 1920; 
    const maxYear = 2025;
    const allYears = Array.from({length: maxYear - minYear + 1}, (_, i) => minYear + i);

    const ctx = document.getElementById('line-chart').getContext('2d');
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allYears,
            datasets: [{
                label: 'Number of Sightings',
                data: allYears.map(year => sightingsByYear[year] || 0),
                borderColor: '#FF5733',
                backgroundColor: 'rgba(255, 87, 51, 0.2)',
                fill: true,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 400,
                    ticks: {
                        stepSize: 50
                    }
                },
                x: {
                    ticks: {
                        callback: function(value) {
                            const year = this.getLabelForValue(value);
                            return year % 10 === 0 ? year : '';
                        }
                    }
                }
            }
        }
    });
    
    updateHovercrafts(currentPopularity);
}

function updateHovercrafts(popularity) {
    const sortedShapes = Object.entries(shapeFrequencies)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
    
    let selectedShapes = popularity === 'most' ? sortedShapes.slice(0, 3) : sortedShapes.slice(-3);
    
    selectedShapes.forEach((shape, index) => {
        const hovercraft = document.getElementById(`shape-${index + 1}`);
        const tooltip = hovercraft.querySelector('.tooltip');
        hovercraft.setAttribute('data-sightings', shapeFrequencies[shape]);
        tooltip.textContent = `${shape} - ${shapeFrequencies[shape]} Sightings`;

        // Toggle the shrink class based on popularity selection.
        if (popularity === 'least') {
            hovercraft.classList.add('shrink');
        } else {
            hovercraft.classList.remove('shrink');
        }
    });
}



function handleButtonSelection(buttonId, popularity) {
    currentPopularity = popularity; 
    document.querySelectorAll('.popularity-button').forEach(button => {
        button.classList.remove('selected');
        button.classList.add('unselected');
    });
    document.getElementById(buttonId).classList.add('selected');
    updateHovercrafts(popularity);
}

document.getElementById("most-popular").addEventListener("click", function() {
    handleButtonSelection("most-popular", 'most');
});

document.getElementById("least-popular").addEventListener("click", function() {
    handleButtonSelection("least-popular", 'least');
});

function filterByDecade() {
    const selectedDecade = document.getElementById("decade-dropdown-shape").value;
    let filteredData = sightingsData;

    if (selectedDecade === "1960") {
        // For the 1960s selection, include everything from before 1970:
        filteredData = sightingsData.filter(sighting => sighting.year < 1970);
    } else if (selectedDecade !== "All") {
        // For other decade selections, only include the specified decade
        const decadeStart = parseInt(selectedDecade);
        filteredData = sightingsData.filter(sighting => sighting.year >= decadeStart && sighting.year < decadeStart + 10);
    }

    updateLineChart(filteredData);
    
    // Recalculate shape frequencies based on filtered data
    shapeFrequencies = {};
    filteredData.forEach(sighting => {
        shapeFrequencies[sighting.shape] = (shapeFrequencies[sighting.shape] || 0) + 1;
    });

    updateHovercrafts(currentPopularity);
    
    // Update the pop culture text based on the selected decade
    updatePopCultureText(selectedDecade);
}


document.getElementById("decade-dropdown-shape").addEventListener("change", filterByDecade);

function updateLineChart(filteredData) {
    const sightingsByYear = {};
    filteredData.forEach(sighting => {
        sightingsByYear[sighting.year] = (sightingsByYear[sighting.year] || 0) + 1;
    });

    const minYear = 1914, maxYear = 2025;
    const allYears = Array.from({length: maxYear - minYear + 1}, (_, i) => minYear + i);
    
    lineChart.data = {
        labels: allYears,
        datasets: [{
            label: 'Number of Sightings',
            data: allYears.map(year => sightingsByYear[year] || null),
            borderColor: '#FF5733',
            backgroundColor: 'rgba(255, 87, 51, 0.2)',
            fill: true,
            tension: 0.4,
        }]
    };
    
    lineChart.update();
}

function updatePopCultureText(decade) {
    // Map each decade to some pop culture reference text.
    const popCultureReferences = {
      "All": "General pop culture references spanning all decades.",
      "1960": "The 1960s: Pop Culture",
      "1970": "The 1970s: Pop Culture",
      "1980": "The 1980s: Pop Culture",
      "1990": "The 1990s: Pop Culture",
      "2000": "The 2000s: Pop Culture",
      "2010": "The 2010s: Pop Culture",
      "2020": "The 2020s: Pop Culture"
    };
  
    // Get the pop culture text container element.
    const popCultureContainer = document.getElementById("pop-culture-text");
  
    // Update its content with the appropriate text.
    // If the decade is not found, default to the "All" text.
    const text = popCultureReferences[decade] || popCultureReferences["All"];
    popCultureContainer.innerHTML = `
      <h3>Pop Culture References</h3>
      <p>${text}</p>
    `;
}

});
