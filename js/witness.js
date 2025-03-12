document.addEventListener("DOMContentLoaded", function () {
    const data = {
        "solo": { "single": 5, "smallGroup": 12, "fleet": 3 },
        "smallGroup": { "single": 10, "smallGroup": 20, "fleet": 8 },
        "crowd": { "single": 3, "smallGroup": 7, "fleet": 2 }
    };

    let selectedWitness = "none";
    let selectedShip = "none";

    function updateVisualization() {
        let percentage = "Select witnesses and/or ships to see data.";

        if (selectedWitness !== "none" && selectedShip !== "none") {
            percentage = `Sightings: ${data[selectedWitness][selectedShip] || 0}%`;
        } else if (selectedWitness !== "none") {
            let total = 0;
            Object.values(data[selectedWitness]).forEach(value => total += value);
            percentage = `Sightings with ${selectedWitness}: ${total}%`;
        } else if (selectedShip !== "none") {
            let total = 0;
            Object.keys(data).forEach(witness => total += data[witness][selectedShip] || 0);
            percentage = `Sightings with ${selectedShip} ships: ${total}%`;
        }

        document.getElementById("percentage-output").textContent = percentage;
    }

    function updateLandingPad() {
        const landingPad = document.getElementById("landing-pad");
        landingPad.innerHTML = ""; // Clear previous stickmen
    
        let positions = []; // Array to store positions
    
        // Define manual positions in pixels for each group
        if (selectedWitness === "solo") {
            positions = [{ left: "60px", bottom: "10px" }];
        } 
        else if (selectedWitness === "smallGroup") {
            positions = [
                { left: "40px", bottom: "15px" },
                { left: "80px", bottom: "15px" },
                { left: "60px", bottom: "10px" }
            ];
        } 
        else if (selectedWitness === "crowd") {
            positions = [
                { left: "110px", bottom: "15px" },
                { left: "10px", bottom: "15px" },
                { left: "30px", bottom: "20px" },
                { left: "50px", bottom: "20px" },
                { left: "70px", bottom: "20px" },
                { left: "100px", bottom: "15px" },
                { left: "20px", bottom: "10px" },
                { left: "40px", bottom: "15px" },
                { left: "80px", bottom: "15px" },
                { left: "60px", bottom: "10px" }
            ];
        }
    
        // Create and position stickmen
        positions.forEach(pos => {
            const stickman = document.createElement("img");
            stickman.src = "img/stickman6.png";
            stickman.classList.add("stickman");
    
            // Apply manual pixel-based positioning
            stickman.style.position = "absolute";
            stickman.style.left = pos.left;
            stickman.style.bottom = pos.bottom;
    
            landingPad.appendChild(stickman);
        });
    }
    
    
    function updateUfoSpace() {
        const ufoSpace = document.getElementById("ufo-space");
        ufoSpace.innerHTML = ""; // Clear previous UFOs
    
        let positions = []; // Array to store UFO positions
    
        // Define manual positions in pixels for each ship group
        if (selectedShip === "single") {
            positions = [{ left: "100px", top: "10px" }];
        } 
        else if (selectedShip === "smallGroup") {
            positions = [
                { left: "50px", top: "20px" },
                { left: "120px", top: "10px" },
                { left: "190px", top: "20px" }
            ];
        } 
        else if (selectedShip === "fleet") {
            positions = [
                { left: "20px", top: "-100px" },
                { left: "80px", top: "-90px" },
                { left: "140px", top: "-80px" },
                { left: "200px", top: "-70px" },
                { left: "30px", top: "-60px" },
                { left: "100px", top: "-50px" },
                { left: "170px", top: "-40px" },
                { left: "230px", top: "-30px" }
            ];
        }
    
        // Create and position UFOs
        positions.forEach(pos => {
            const ufo = document.createElement("img");
            ufo.src = "img/ufo1.png";
            ufo.classList.add("ufo");
    
            // Apply manual pixel-based positioning
            ufo.style.position = "absolute";
            ufo.style.left = pos.left;
            ufo.style.top = pos.top;
    
            ufoSpace.appendChild(ufo);
        });
    }
    
    

    document.querySelectorAll(".witness-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            selectedWitness = this.dataset.value;
            document.querySelectorAll(".witness-btn").forEach(b => b.classList.remove("selected"));
            this.classList.add("selected");
            updateVisualization();
            updateLandingPad();
        });
    });

    document.querySelectorAll(".ship-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            selectedShip = this.dataset.value;
            document.querySelectorAll(".ship-btn").forEach(b => b.classList.remove("selected"));
            this.classList.add("selected");
            updateVisualization();
            updateUfoSpace();
        });
    });
    

    updateVisualization();
});