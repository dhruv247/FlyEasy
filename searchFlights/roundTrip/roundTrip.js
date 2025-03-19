// global variable to store searched flights
let searchedFlights = [];

/**
 * Loads search data from local storage to maintain search field input persistence
 * @description
 * 1. This Function uses trip type to decide which fields to show
 * 2. Loads data from local storage for the fields that are needed
 */
function loadSearchDetails() {
    const searchData = getFlightSearchData();
    
    if (searchData.flightFrom) {
        const flightTo = document.getElementById("flightTo");
        flightTo.value = searchData.flightFrom;
        flightTo.setAttribute("readonly", "readonly");
    }
    if (searchData.flightTo) {
        const flightFrom = document.getElementById("flightFrom");
        flightFrom.value = searchData.flightTo;
        flightFrom.setAttribute("readonly", "readonly");
    }
    if (searchData.departureDate) {
        const departureDate = document.getElementById("departureDate");
        departureDate.value = searchData.departureDate;
        departureDate.setAttribute("readonly", "readonly");
        
        // Set minimum date for return date input
        const returnDate = document.getElementById("returnDate");
        returnDate.setAttribute("min", searchData.departureDate);
    }
    if (searchData.returnDate) {
        const returnDate = document.getElementById("returnDate");
        returnDate.value = searchData.returnDate;
        returnDate.classList.remove("d-none");
        returnDate.setAttribute("required", "required");
    }
    if (searchData.noOfTraveller) {
        const noOfTraveller = document.getElementById("noOfTraveller");
        noOfTraveller.value = searchData.noOfTraveller;
        noOfTraveller.disabled = true;
    }
    if (searchData.travelClass) {
        const travelClass = document.getElementById("travelClass");
        travelClass.value = searchData.travelClass;
        travelClass.disabled = true;
    }
}

/**
 * Searches Flights based on input fields
 * @param {*} event - form submission
 * @description
 * 1. Saves fields to local storage
 * 2. Gets form fields
 * 3. Starts searching for flights stored indexedDB and keeps only flights with matches
 */
async function searchFlights(event) {
    event.preventDefault();
    // Reset sort radio buttons
    document.getElementById("sortPrice").checked = false;
    document.getElementById("sortDuration").checked = false;
    
    // Get form data
    const form = event.target;
    const formData = new FormData(form);
    // Get all required fields
    const departurePlace = formData.get("flightFrom").toLowerCase().trim();
    const arrivalPlace = formData.get("flightTo").toLowerCase().trim();
    const returnDate = formData.get("returnDate");
    changeReturnDate(returnDate);
    const numberOfPassengers = Number(formData.get("noOfTraveller"));
    const travelClass = formData.get("travelClass"); // "1" for Economy, "2" for Business
    const flights = await getAllFlights();
    searchedFlights = flights.filter(flight => {
        let matchesSearch = true;
        // departure place
        matchesSearch = matchesSearch && flight.departurePlace.toLowerCase().includes(departurePlace);
        // arrival place
        matchesSearch = matchesSearch && flight.arrivalPlace.toLowerCase().includes(arrivalPlace);
        // return date
        matchesSearch = matchesSearch && flight.departureDate === returnDate;
        // travel class and number of passengers
        if (travelClass === "1") {
            // Economy class
            matchesSearch = matchesSearch && 
                (flight.economyCapacity - flight.economyBookedCount) >= numberOfPassengers;
        } else {
            // Business class
            matchesSearch = matchesSearch && 
                (flight.businessCapacity - flight.businessBookedCount) >= numberOfPassengers;
        }
        return matchesSearch;
    });
    // Display results or no results message
    if (searchedFlights.length === 0) {
        const flightSection = document.getElementById("sampleFlights");
        flightSection.innerHTML = `
            <div class="alert alert-info" role="alert">
                No flights found matching your search criteria. Please change your return date.
            </div>
        `;
    } else {
        flightDOMStructure(searchedFlights);
    }
}

/**
 * Event listeners for select flight
 */
function attachEventListeners() {
    const selectFlightButtons = document.querySelectorAll(".selectFlightBtn");
    selectFlightButtons.forEach(button => {
        button.addEventListener("click", async (e) => {
            const flightId = e.target.dataset.flightId;
            try {
                const tripType = getTripType();
                if (tripType === "oneWay") {
                    storeDepartureFlightId(flightId);
                    storeReturnFlightId("oneWay")
                    window.location.href = "./enterDetails/enterDetails.html"
                } else {
                    storeReturnFlightId(flightId)
                    window.location.href = "/searchFlights/enterDetails/enterDetails.html"
                }
            } catch (error) {
                alert(error.message);
            }
        })
    })
}

/**
 * uses a list of flights to create individual flight cards for the DOM
 * @param {} flights - list of flights
 */
function flightDOMStructure(flights) {
    const flightSection = document.getElementById("sampleFlights");
    flightSection.innerHTML = "";
    const searchData = getFlightSearchData();
    for (const flight of flights) {
        const currentTicketPrice = searchData.travelClass === "1" ? flight.economyCurrentPrice * Number(searchData.noOfTraveller) : flight.businessCurrentPrice * Number(searchData.noOfTraveller);
        const newFlight = document.createElement("div");
        newFlight.className = "row border border-subtle rounded m-0 mb-3 py-2 align-items-center";
        newFlight.innerHTML = `
                    <div class="col-12 col-md-1">
                        <p>${flight.flightNo}</p>
                    </div>
                    <div class="col-12 col-md-1">
                        <p>${flight.airline}</p>
                    </div>
                    <div class="col-12 col-md-1">
                        <p>${flight.planeName}</p>
                    </div>
                    <div class="col-12 col-md-3 d-flex justify-content-evenly align-items-center">
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
                    <div class="col-12 col-md-2">
                        <p>${flight.duration}</p>
                    </div>
                    <div class="col-12 col-md-2">
                        <p>₹ <span>${currentTicketPrice}</span></p>
                    </div>
                    <div class="col-12 col-md-2">
                        <button class="btn btn-outline-secondary selectFlightBtn" data-flight-id="${flight.flightId}">Select Flight</button>
                    </div>
                    
        `;
        flightSection.appendChild(newFlight);
    }
    attachEventListeners();
}

/**
 * swaps login button to dashboard button if user is logged in
 */
function loginDashboardButtonSwap() {
    const loggedInStatus = getLoginStatus();
    const userType = getUserType();
    const loginButton = document.getElementById("loginButton");
    const adminDashboardButton = document.getElementById("adminDashboardButton");
    const userDashboardButton = document.getElementById("userDashboardButton");
    
    if (loggedInStatus && userType === "admin") {
        loginButton.classList.add("d-none");
        adminDashboardButton.classList.remove("d-none")
    }
    if (loggedInStatus && userType === "customer") {
        loginButton.classList.add("d-none");
        userDashboardButton.classList.remove("d-none");
    }
}

/**
 * utility function used by sort Flights
 * @param {*} duration 
 * @returns flight duration in minutes
 */
function durationToMinutes(duration) {
    const [hours, minutes] = duration.split(':').map(Number);
    return (hours * 60) + minutes;
}

/**
 * sorts a list of flights stored in a global scope variable (searchedFlights)
 * @returns sorted list of searched flights
 * @description
 * 1. sorts searched flights either by price or duration
 * 2. displays the sorted flights on the DOM
 */
function sortFlights() {
    if (!searchedFlights || searchedFlights.length === 0) {
        return;
    }
    const sortPrice = document.getElementById("sortPrice").checked;
    const sortDuration = document.getElementById("sortDuration").checked;
    const searchData = getFlightSearchData();
    if (sortPrice) {
        searchedFlights.sort((flight1, flight2) => {
            if (searchData.travelClass === "1") {
                return flight1.economyCurrentPrice - flight2.economyCurrentPrice;
            } else {
                return flight1.businessCurrentPrice - flight2.businessCurrentPrice;
            }
        });
    }
    if (sortDuration) {
        searchedFlights.sort((flight1, flight2) => {
            const duration1 = durationToMinutes(flight1.duration);
            const duration2 = durationToMinutes(flight2.duration);
            return duration1 - duration2;
        });
    }
    flightDOMStructure(searchedFlights);
}

/**
 * Event Triggers
 */
document.addEventListener("DOMContentLoaded", protectCustomerPage); // Only loads page is user type is customer
document.addEventListener("DOMContentLoaded", () => {
    // Load search form with saved values
    loadSearchDetails();
    // Automatically trigger form submission
    document.getElementById("flightSearchForm").requestSubmit();
});
document.addEventListener("DOMContentLoaded", loginDashboardButtonSwap);