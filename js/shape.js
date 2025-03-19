window.onload = function() {
    // Define UFO shape symbols inside the existing SVG
    d3.select("#shape-grid")
        .append("defs")
        .html(`
            <symbol id="chevron" viewBox="0 0 100 100">
                <polyline points="10,90 50,10 90,90" stroke="white" stroke-width="8" fill="none" />
            </symbol>
            <symbol id="changing" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="20" fill="white">
                    <animate attributeName="r" values="20;30;20" dur="1.5s" repeatCount="indefinite" />
                </circle>
            </symbol>
            <symbol id="cigar" viewBox="0 0 100 100">
                <ellipse cx="50" cy="50" rx="45" ry="20" fill="white" />
            </symbol>
            <symbol id="circle" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="white" />
            </symbol>
            <symbol id="triangle" viewBox="0 0 100 100">
                <polygon points="50,10 90,90 10,90" fill="white" />
            </symbol>
            <symbol id="disk" viewBox="0 0 100 100">
                <ellipse cx="50" cy="50" rx="45" ry="25" fill="white" />
            </symbol>
            <symbol id="star" viewBox="0 0 100 100">
                <polygon points="50,10 60,40 90,40 65,60 75,90 50,70 25,90 35,60 10,40 40,40" fill="white" />
            </symbol>
        `);

    const ufoShapes = [
        { shape: "chevron", sightings: 120 },
        { shape: "changing", sightings: 90 },
        { shape: "cigar", sightings: 60 },
        { shape: "circle", sightings: 300 },
        { shape: "disk", sightings: 180 },
        { shape: "star", sightings: 75 },
        { shape: "triangle", sightings: 250 }
    ];

    // Select the SVG container for the UFO sky
    const skyContainer = d3.select("#shape-grid")
        .attr("width", 1000)
        .attr("height", 800)
        .style("background", "black");

    // Scale size based on sightings
    const sizeScale = d3.scaleLinear()
        .domain([d3.min(ufoShapes, d => d.sightings), d3.max(ufoShapes, d => d.sightings)])
        .range([40, 120]); // Min and max size

    // Define middle area constraints
    const centerX = 500; // Middle of the 1000px width
    const centerY = 400; // Middle of the 800px height
    const spreadX = 400; // How far UFOs can spread left/right
    const spreadY = 200; // How far UFOs can spread up/down

    // Function to generate non-overlapping positions near the center
    function randomPosition(existingPositions, size) {
        let x, y, isOverlapping;
        const padding = size / 2; // Ensure large shapes get more space

        do {
            x = centerX + (Math.random() * spreadX - spreadX / 2);
            y = centerY + (Math.random() * spreadY - spreadY / 2);
            isOverlapping = existingPositions.some(pos => 
                Math.abs(pos.x - x) < size + padding && Math.abs(pos.y - y) < size + padding
            );
        } while (isOverlapping);

        existingPositions.push({ x, y });
        return { x, y };
    }

    // Store positions to avoid overlap
    let positions = [];

    // Append UFO shapes at constrained positions
    const ufoElements = skyContainer.selectAll(".ufo-shape")
        .data(ufoShapes)
        .enter()
        .append("use")
        .attr("xlink:href", d => `#${d.shape}`)
        .attr("width", d => sizeScale(d.sightings))
        .attr("height", d => sizeScale(d.sightings))
        .each(function (d) {
            let size = sizeScale(d.sightings);
            let { x, y } = randomPosition(positions, size);
            d3.select(this).attr("x", x).attr("y", y);
        })
        .attr("class", "ufo-shape")
        .style("cursor", "pointer")
        .style("fill", "lightgray") // Ensure visibility
        .on("click", (event, d) => updateSidebar(d));

    // Sidebar update function
    function updateSidebar(data) {
        d3.select("#sidebar-content") // Target a specific div inside #sidebar
            .html(`
                <h3>${data.shape.charAt(0).toUpperCase() + data.shape.slice(1)} Shape</h3>
                <p><strong>Total Sightings:</strong> ${data.sightings}</p>
                <p><strong>Popular Decade:</strong> 1980s (example data)</p>
                <p><strong>Famous Sighting:</strong> Example UFO Case</p>
            `);
    }
};


