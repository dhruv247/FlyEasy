/**
 * Global variables
 * @description
 * searchedFlights - a list of flights searched by the admin
 * travelClass - necessary because flight details are not stored to local storage when userType = "admin"
 */
let searchedFlights = [];
let travelClass;

/**
 * dynamically add event listeners to flight cards
 */
function attachEventListeners() {
    const editButtons = document.querySelectorAll(".editFlightBtn");
    editButtons.forEach(button => {
        button.addEventListener("click", async (e) => {
            if (confirm("Are you sure you want to edit this flight?")) {
                const flightId = e.target.dataset.flightId;
                try {
                    let flight = await getFlightsByFlightId(flightId);
                    localStorage.setItem("flightId", flight.flightId);
                    window.location.href = './editFlight/editFlight.html'
                } catch (error) {
                    console.error("Error editing flight:", error);
                    alert("Failed to edit flight. Please try again.");
                }
            }
        });
    });
}

/**
 * used to add flight cards to the DOM
 * @param {*} flights - list of flights
 */
function flightDOMStructure(flights) {

    const flightSection = document.getElementById("sampleFlights");
    flightSection.innerHTML = "";
    
    for (const flight of flights) {

        /**
         * Custom Time format
         * @description
         * 1. This is because duration like 2:03 are being printed as 2:3 which is confusing.
        */
        const duration = flight.duration;
        const durationArray = duration.split(":")
        let customDuration;
        if (durationArray[1] < 10) {
            customDuration = `${durationArray[0]}:0${durationArray[1]}`
        } else {
            customDuration = duration
        }

        // For displaying flight times changed underneath flight number
        const changed = flight.changed;
        const editResult = changed === "No Changes" ? '' : "Flight Times Changed";
        
        const newFlight = document.createElement("div");
        newFlight.className = "sampleFlight row border border-subtle rounded m-0 mb-3 py-2 align-items-center";
        newFlight.innerHTML = `
                    <div class="col-12 col-md-1">
                        <div class="d-flex flex-row flex-md-column justify-content-center align-items-center gap-2">
                            <p class="fw-bold">${flight.flightNo}</p>
                            <p class="fw-bold">${editResult}</p>
                        </div>
                    </div>
                    <div class="col-12 col-md-1">
                        <p>${flight.airline}</p>
                    </div>
                    <div class="col-12 col-md-2 d-flex justify-content-evenly align-items-center">
                        <div class="align-items-center">
                            <p>${flight.departurePlace}</p>
                            <p>${flight.departureTime}</p>
                            <p>${flight.departureDate}</p>
                        </div>
                        <p>-</p>
                        <div class="align-items-center">
                            <p>${flight.arrivalPlace}</p>
                            <p>${flight.arrivalTime}</p>
                            <p>${flight.arrivalDate}</p>
                        </div>
                    </div>
                    <div class="col-12 col-md-1">
                        <p>${customDuration}</p>
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
                    </div>
        `;
        flightSection.appendChild(newFlight);
    }
    attachEventListeners();
}

/**
 * load all flights from indexedDB
 * displays them on the DOM
 */
async function loadFlightsFromDB() {
    let flights = await getAllFlights();
    flightDOMStructure(flights)
}

/**
 * gets flight details from search form
 * @param {*} event - form submission event
 * @description
 * 1. Uses filter to return flights which contain even partial matches
 * 2. makes the sort button group available
 */
async function searchFlights(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const flightFrom = formData.get("flightFrom").toLowerCase();
    const flightTo = formData.get("flightTo").toLowerCase();
    const departureDate = formData.get("departureDate");
    const flightNo = formData.get("flightNo").toLowerCase();
    const remainingCapacity = Number(formData.get("remainingCapacity"));
    travelClass = formData.get("travelClass");
    const flights = await getAllFlights();
    // Filter flights based on search criteria
    searchedFlights = flights.filter(flight => {
        let matchesSearch = true;
        // Check departure place (partial match)
        if (flightFrom) {
            matchesSearch = matchesSearch && flight.departurePlace.toLowerCase().includes(flightFrom);
        }
        // Check arrival place (partial match)
        if (flightTo) {
            matchesSearch = matchesSearch && flight.arrivalPlace.toLowerCase().includes(flightTo);
        }
        // Check departure date (exact match)
        if (departureDate) {
            matchesSearch = matchesSearch && flight.departureDate === departureDate;
        }
        // Check flight number (partial match)
        if (flightNo) {
            matchesSearch = matchesSearch && flight.flightNo.toLowerCase().includes(flightNo);
        }
        // Check remaining capacity if both capacity and travel class are specified
        if (remainingCapacity && travelClass) {
            const availableSeats = travelClass === "1" ? 
                (flight.economyCapacity - flight.economyBookedCount) :
                (flight.businessCapacity - flight.businessBookedCount);
            matchesSearch = matchesSearch && availableSeats >= remainingCapacity;
        }
        return matchesSearch;
    });
    document.getElementById("sortType").classList.remove("d-none"); 
    flightDOMStructure(searchedFlights);
    document.getElementById("sortPrice").checked = false;
    document.getElementById("sortDuration").checked = false;
}

/**
 * gets the duration property of the flights object and converts it to minutes for sorting
 * @param {*} flight - flight object
 * @returns duration converted to minutes
 */
function durationToNumbers(flight) {
    const flightToNumber = flight.duration.split(":");
    const totalMinutes = ((Number(flightToNumber[0])) * 60) + Number(flightToNumber[1])
    return totalMinutes
}

/**
 * sorts the list of searched flights by time or duration
 */
function sortFlights() {
    const sortPrice = document.getElementById("sortPrice").checked;
    const sortDuration = document.getElementById("sortDuration").checked;

    if (sortPrice) {
        if (travelClass === "1") {
            searchedFlights.sort((flight1, flight2) => flight1.economyCurrentPrice - flight2.economyCurrentPrice);
            flightDOMStructure(searchedFlights);
        }
        if (travelClass === "2") {
            searchedFlights.sort((flight1, flight2) => flight1.businessCurrentPrice - flight2.businessCurrentPrice);
            flightDOMStructure(searchedFlights);
        }
    }

    if (sortDuration) {
        searchedFlights.sort((flight1, flight2) => {
            const flight1Duration = durationToNumbers(flight1);
            const flight2Duration = durationToNumbers(flight2);
            return flight1Duration - flight2Duration
        })
        flightDOMStructure(searchedFlights)
    }
}

/**
 * toggle location fields
 */
function toggleLocations() {
    const flightFrom = document.getElementById("flightFrom").value;
    const flightTo = document.getElementById("flightTo").value;
    document.getElementById("flightFrom").value = flightTo;
    document.getElementById("flightTo").value = flightFrom;
}

/**
 * Event listeners
 */
document.addEventListener("DOMContentLoaded", adminDashboardCheck); // Route protection
document.addEventListener("DOMContentLoaded", loadFlightsFromDB); // loads flights from DB on page load