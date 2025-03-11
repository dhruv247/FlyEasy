async function loadFlightsFromDB() {
    let flights = await getAllFlights();
    let flightSection = document.getElementById("sampleFlights");
    for (let flight of flights) {
        let newFlight = document.createElement("div");
        newFlight.className = "row border border-subtle rounded m-0 mb-3 py-2 align-items-center";
        newFlight.innerHTML = `
                    <div class="col-12 col-md-1">
                        <p>${flight.flightNo}</p>
                    </div>
                    <div class="col-12 col-md-1">
                        <p>${flight.airline}</p>
                    </div>
                    <div class="col-12 col-md-2 d-flex justify-content-evenly align-items-center">
                        <div class="align-items-center">
                            <p>${flight.departureTime}</p>
                            <p>${flight.departureDate}</p>
                        </div>
                        <p>-</p>
                        <div class="align-items-center">
                            <p>${flight.arrivalTime}</p>
                            <p>${flight.arrivalDate}</p>
                        </div>
                    </div>
                    <div class="col-12 col-md-1">
                        <p>${flight.duration}</p>
                    </div>
                    <div class="col-12 col-md-1">
                        <p>${flight.planeName}</p>
                    </div>
                    <div class="col-12 col-md-2">
                        <p>Seats Left:</p>
                        <div class="d-flex gap-2 justify-content-center">
                            <p>Economy: <span>${flight.economyCapacity-flight.economyBookedCount}</span></p>

                            <p>Business: <span>${flight.businessCapacity-flight.businessBookedCount}</span></p>
                        </div>
                    </div>
                    <div class="col-12 col-md-2">
                        <p>Ticket Prices:</p>
                        <div class="d-flex gap-1 justify-content-center">
                            <p>Economy: <span>${flight.economyCurrentPrice}</span></p>

                            <p>Business: <span>${flight.businessCurrentPrice}</span></p>
                        </div>
                    </div>
                    <div class="col-12 col-md-2 d-flex gap-2 justify-content-center">
                        <button class="btn btn-outline-primary editFlightBtn" data-flight-id="${flight.flightId}">Edit</button>
                        <button class="btn btn-outline-danger deleteFlightBtn" data-flight-id="${flight.flightId}">Delete</button>
                    </div>
        `;
        flightSection.appendChild(newFlight);
    }

    
    const deleteButtons = document.querySelectorAll(".deleteFlightBtn");
    deleteButtons.forEach(button => {
        button.addEventListener("click", async (e) => {
            if (confirm("Are you sure you want to delete this flight?")) {
                const flightId = e.target.dataset.flightId;
                try {
                    await deleteFlight(flightId);
                    const flightRow = e.target.closest(".row");
                    if (flightRow) {
                        flightRow.remove();
                    }
                } catch (error) {
                    console.error("Error deleting flight:", error);
                    alert("Failed to delete flight. Please try again.");
                }
            }
        });
    });

    // Edit Flight Button to be implemented at last
    // const editButtons = document.querySelectorAll(".editFlightBtn");
    // editButtons.forEach(button => {
    //     button.addEventListener("click", async (e) => {
    //         if (confirm("Are you sure you want to edit this flight's details?")) {
    //             const flightId = e.target.dataset.flightId;
    //             try {

    //             }
    //         }
    //     })
    // })
}

function logout() {
    localStorage.clear();
    window.location.href = '/homepage/index.html';
}

document.addEventListener("DOMContentLoaded", adminDashboardCheck);
document.addEventListener("DOMContentLoaded", loadFlightsFromDB);
