// global variable to store searched flights
let searchedFlights = [];

/**
 * Saves flight search data to localStorage
 * @param {Event} event - Form submission event
 * @description
 * This function:
 * 1. Stores search parameters in localStorage:
 *    - Trip type (one way/round trip)
 *    - Flight details (from, to, dates)
 *    - Travel preferences (class, passengers)
 * 2. Keeps user in search results page
 */
function saveSearchData(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    saveFlightSearchData(formData);
}

/**
 * Loads search data from local storage to maintain search field input persistence
 * @description
 * 1. This Function uses trip type to decide which fields to show
 * 2. Loads data from local storage for the fields that are needed
 */
function loadSearchDetails() {
    const searchData = getFlightSearchData();
    if (searchData.tripType) {
        if (searchData.tripType === "oneWay") {
            document.getElementById("oneWay").checked = true;
            document.getElementById("returnDate").classList.add("d-none");
            document.getElementById("returnDate").removeAttribute("required");
        } else {
            document.getElementById("roundTrip").checked = true;
            document.getElementById("returnDate").classList.remove("d-none");
            document.getElementById("returnDate").setAttribute("required", "required");
        }
    }
    if (searchData.flightFrom) {
        document.getElementById("flightFrom").value = searchData.flightFrom;
    }
    if (searchData.flightTo) {
        document.getElementById("flightTo").value = searchData.flightTo;
    }
    if (searchData.departureDate) {
        document.getElementById("departureDate").value = searchData.departureDate;
    }
    if (searchData.returnDate) {
        document.getElementById("returnDate").value = searchData.returnDate;
        document.getElementById("returnDate").classList.remove("d-none");
        document.getElementById("returnDate").setAttribute("required", "required");
    }
    if (searchData.noOfTraveller) {
        document.getElementById("noOfTraveller").value = searchData.noOfTraveller;
    }
    if (searchData.travelClass) {
        document.getElementById("travelClass").value = searchData.travelClass;
    }
}

/**
 * Validates flight dates
 * @param {string} departureDate - Selected departure date
 * @param {string} returnDate - Selected return date (optional)
 * @returns {Object} - Validation result with status and message
 */
function validateDates(departureDate, returnDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const departureDateObj = new Date(departureDate);
    
    if (departureDateObj < today) {
        return {
            isValid: false,
            message: "Departure date must be in the future"
        };
    }
    
    if (returnDate) {
        const returnDateObj = new Date(returnDate);
        if (returnDateObj < departureDateObj) {
            return {
                isValid: false,
                message: "Return date cannot be before departure date"
            };
        }
    }
    
    return {
        isValid: true,
        message: ""
    };
}

/**
 * Searches Flights based on input fields
 * @param {*} event - form submission
 * @description
 * 1. Validates city inputs
 * 2. Saves fields to local storage
 * 3. Gets form fields
 * 4. Starts searching for flights stored indexedDB and keeps only flights with matches
 */
async function searchFlights(event) {
    event.preventDefault();
    
    // Get city values for validation
    const fromCity = document.getElementById("flightFrom").value;
    const toCity = document.getElementById("flightTo").value;
    
    // Validate cities are from the list
    if (!CITIES.includes(fromCity) || !CITIES.includes(toCity)) {
        const flightSection = document.getElementById("sampleFlights");
        flightSection.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Please select valid cities from the dropdown list
            </div>
        `;
        return;
    }
    
    // Validate cities are not the same
    if (fromCity === toCity) {
        const flightSection = document.getElementById("sampleFlights");
        flightSection.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Departure and arrival cities cannot be the same
            </div>
        `;
        return;
    }
    
    saveSearchData(event);
    
    // Reset sort buttons to unselected state
    document.getElementById("sortPrice").checked = false;
    document.getElementById("sortDuration").checked = false;
    
    // Get form data
    const form = event.target;
    const formData = new FormData(form);
    
    // Get all required fields
    const departureDate = formData.get("departureDate");
    const returnDate = formData.get("returnDate");
    
    // Validate dates
    const dateValidation = validateDates(departureDate, returnDate);
    if (!dateValidation.isValid) {
        const flightSection = document.getElementById("sampleFlights");
        flightSection.innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${dateValidation.message}
            </div>
        `;
        return;
    }
    
    const departurePlace = formData.get("flightFrom").toLowerCase().trim();
    const arrivalPlace = formData.get("flightTo").toLowerCase().trim();
    const numberOfPassengers = Number(formData.get("noOfTraveller"));
    const travelClass = formData.get("travelClass");
    const flights = await getAllFlights();
    searchedFlights = flights.filter(flight => {
        let matchesSearch = true;
        // departure place
        matchesSearch = matchesSearch && flight.departurePlace.toLowerCase().includes(departurePlace);
        // arrival place
        matchesSearch = matchesSearch && flight.arrivalPlace.toLowerCase().includes(arrivalPlace);
        // departure date
        matchesSearch = matchesSearch && flight.departureDate === departureDate;
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
                No flights found matching your search criteria.
            </div>
        `;
    } else {
        flightDOMStructure(searchedFlights);
    }
}

/**
 * Event listeners for search flight
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
                    storeDepartureFlightId(flightId);
                    window.location.href = "./roundTrip/roundTrip.html"
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
                        <p>${customDuration}</p>
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
 * Function to toggle return date input field on the basis of trip type (round / one way)
 */
function toggleTripType() {
    const roundTripType = document.getElementById("roundTrip").checked;
    const returnDateInput = document.getElementById("returnDate");
    if (roundTripType) {
        returnDateInput.classList.remove("d-none"); // Show return date input
        returnDateInput.setAttribute("required", "required"); // Make required
    } else {
        returnDateInput.classList.add("d-none"); // Hide return date input
        returnDateInput.removeAttribute("required"); // Remove required
    }
}

/**
 * Swap To and From Input Fields
 */
function swapLocations() {
    const flightFrom = document.getElementById("flightFrom").value;
    const flightTo = document.getElementById("flightTo").value;
    document.getElementById("flightFrom").value = flightTo;
    document.getElementById("flightTo").value = flightFrom;
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
 * Populates the datalist with cities from the centralized CITIES array
 */
function populateCityList() {
    const datalist = document.getElementById('cityList');
    CITIES.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        datalist.appendChild(option);
    });
}

/**
 * Event Triggers
 */
document.addEventListener("DOMContentLoaded", protectCustomerPage); // Only loads page is user type is customer
document.addEventListener("DOMContentLoaded", () => {
    // Load search form with saved values
    loadSearchDetails();
    // Populate city list
    populateCityList();
    // Automatically trigger form submission
    document.getElementById("flightSearchForm").requestSubmit();
});
document.addEventListener("DOMContentLoaded", loginDashboardButtonSwap);