let sightingsData = [];  // global
let lineChart;  
let selectedDecade = null;
let shapeFrequencies = {};
let currentPopularity = 'most';
let svg, pie, arc, color, shapeOrder, tooltip; // global pie chart variables

document.addEventListener("DOMContentLoaded", function() {
    console.log("shape.js loaded");

    shapeOrder = ["light", "triangle", "circle", "disk", "fireball", "sphere", "cigar", "oval", 
        "changing", "chevron", "cone", "cross", "cube", "cylinder", "diamond", "egg", "flash", 
        "formation", "orb", "other", "rectangle", "star", "unknown"];

    // Load CSV data
    Papa.parse('data/NUFORCdata.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            results.data.forEach(row => {
                const year = new Date(row.EventDate).getFullYear();
                sightingsData.push({
                    year: year,
                    shape: row.Shape,
                });
            });

            createLineChart();
            createPieChart();
            updatePieChart(sightingsData);
            updateHovercrafts(currentPopularity);
            console.log("Loaded data count:", sightingsData.length);
        }
    });

    // Event listener (just once!)
    const decadeDropdown = document.getElementById("decade-dropdown-shape");
    decadeDropdown.addEventListener("change", filterByDecade);
});

function createPieChart() {
    const width = 250, height = 250, radius = Math.min(width, height) / 2;
    color = d3.scaleOrdinal(d3.schemeCategory10);
    svg = d3.select("#pie-chart")
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    pie = d3.pie().sort(null).value(d => d.value);
    arc = d3.arc().innerRadius(0).outerRadius(radius - 20);

    tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.8)")
        .style("color", "white")
        .style("padding", "5px 10px")
        .style("border-radius", "5px")
        .style("visibility", "hidden")
        .style("font-size", "14px");
}

function updatePieChart(filteredData) {
    let shapeCounts = {};
    filteredData.forEach(d => {
        const shape = d.shape ? d.shape.trim().toLowerCase() : "unknown";
        shapeCounts[shape] = (shapeCounts[shape] || 0) + 1;
    });

    const data = shapeOrder.map(shape => ({
        name: shape,
        value: shapeCounts[shape] || 0
    }));

    const slices = svg.selectAll("path")
        .data(pie(data));

    slices.enter()
        .append("path")
        .attr("fill", d => color(d.data.name))
        .attr("d", arc)
        .each(function(d) { this._current = d; });

    slices.transition().duration(500)
        .attrTween("d", function(d) {
            const interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(1);
            return function(t) {
                return arc(interpolate(t));
            };
        });

    slices.exit().remove();
}


function filterByDecade() {
    const selectedDecade = document.getElementById("decade-dropdown-shape").value;
    let filteredData;

    if (selectedDecade === "1960") {
        filteredData = sightingsData.filter(d => d.year < 1970);
    } else if (selectedDecade !== "All") {
        const decadeStart = parseInt(selectedDecade);
        filteredData = sightingsData.filter(d => d.year >= decadeStart && d.year < decadeStart + 10);
    } else {
        filteredData = sightingsData;
    }

    // CRITICAL FIX: Recalculate shapeFrequencies here!
    shapeFrequencies = {};
    filteredData.forEach(sighting => {
        const shape = sighting.shape ? sighting.shape.trim().toLowerCase() : "unknown";
        shapeFrequencies[shape] = (shapeFrequencies[shape] || 0) + 1;
    });

    updateLineChart(filteredData);
    updatePieChart(filteredData);
    updateHovercrafts(currentPopularity);
    updatePopCultureText(selectedDecade);
}

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

        if (popularity === 'least') {
            hovercraft.classList.add('shrink');
        } else {
            hovercraft.classList.remove('shrink');
        }
    });
}

function createLineChart() {
    const ctx = document.getElementById('line-chart').getContext('2d');
    lineChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Sightings', data: [], borderColor: '#FF5733', backgroundColor: 'rgba(255,87,51,0.2)' }] },
        options: { responsive: true }
    });

    updateLineChart(sightingsData);
}

function updatePopCultureText(decade) {
    const popCultureReferences = {
        "All": "General references spanning all decades.",
        "1960": "The 1960s: Pop Culture",
        "1970": "The 1970s: Pop Culture",
        "1980": "The 1980s: Pop Culture",
        "1990": "The 1990s: Pop Culture",
        "2000": "The 2000s: Pop Culture",
        "2010": "The 2010s: Pop Culture",
        "2020": "The 2020s: Pop Culture"
    };
    document.getElementById("pop-culture-text").innerHTML = `<p>${popCultureReferences[decade]}</p>`;
}

