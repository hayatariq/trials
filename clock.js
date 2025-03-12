const width = 300, height = 300, radius = 120;
const svg = d3.select("#clock")
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

// clock face
svg.append("circle")
    .attr("r", radius)
    .attr("fill", "white")
    .attr("stroke", "black");

// hour labels
for (let i = 1; i <= 12; i++) {
    let angle = i * 30 * (Math.PI / 180);
    let x = Math.sin(angle) * (radius - 15);
    let y = -Math.cos(angle) * (radius - 15);
    svg.append("text")
        .attr("x", x)
        .attr("y", y + 5)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-size", "16px")
        .text(i);
}

// clock hand
const hand = svg.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", -radius + 20)
    .attr("stroke", "red")
    .attr("stroke-width", 3)
    .attr("transform", "rotate(0)");

let isPlaying = false;
let currentHour = 0;
let timeoutId;

document.getElementById("play").addEventListener("click", function() {
    if (!isPlaying) {
        isPlaying = true;
        this.textContent = "Pause";
        animateClock();
    } else {
        isPlaying = false;
        this.textContent = "Play";
        clearTimeout(timeoutId);
    }
});

document.getElementById("reset").addEventListener("click", function() {
    isPlaying = false;
    clearTimeout(timeoutId);
    currentHour = 0;
    document.getElementById("play").textContent = "Play";
    document.getElementById("time-display").textContent = "12 AM";
    hand.transition().duration(500).attr("transform", "rotate(0)");
});

function animateClock() {
    if (!isPlaying) return;

    let rotation = currentHour * 30;

    hand.transition()
        .duration(1000)
        .attr("transform", `rotate(${rotation})`)
        .on("end", () => {
            document.getElementById("time-display").textContent =
                `${(currentHour % 12 === 0 ? 12 : currentHour % 12)} ${currentHour < 12 ? "AM" : "PM"}`;

            currentHour = (currentHour + 1) % 24;
            timeoutId = setTimeout(animateClock, 1000);
        });
}