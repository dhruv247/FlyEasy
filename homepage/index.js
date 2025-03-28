/**
 * Saves flight search data to localStorage and redirects to searchFlights page
 * @param {Event} event - Form submission event
 * @description
 * This function:
 * 1. Validates departure and arrival city details
 * 2. Checks if user is logged in
 * 3. Stores trip type, flight details, travel preferences in localStorage
 * 4. Redirects to searchFlights page
 * @throws {Error} If user is not logged in, throws error
 */
function saveSearchData(event) {
    try {
        if (getLoginStatus()) {
            event.preventDefault();
            
            // Add city validation check
            const fromCity = document.getElementById("flightFrom").value;
            const toCity = document.getElementById("flightTo").value;
            
            if (!CITIES.includes(fromCity) || !CITIES.includes(toCity)) {
                alert("Please select valid cities from the dropdown list");
                return;
            }
            
            // Add same city validation
            if (fromCity === toCity) {
                alert("Departure and arrival cities cannot be the same");
                return;
            }
            
            // Add date validation check
            if (!validateDates()) {
                return;
            }
            
            const form = event.target;
            const formData = new FormData(form);
            saveFlightSearchData(formData);
            if (getUserType() === "customer") {
                window.location.href = "../searchFlights/searchFlights.html";
            } else {
                throw new Error("Admins cannot book flights! Please login with a customer ID.");
            }
        } else {
            throw new Error("Please log in before searching flights!");
        }
    } catch (error) {
        alert(error.message)
    }
}

/**
 * Loads search data from local storage to maintain search field input persistence
 * @description
 * 1. This Function uses trip type to decide which fields to show
 * 2. Loads data from local storage for the fields that are needed
 */
function loadSearchDetails() {
    const searchData = getFlightSearchData();
    // Load trip type
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
    // Load other flight details
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
 * changes login button to dashboard when user is logged in
 * Different Dashboard for customers and admins
 */
function loginDashboardButtonSwap() {
    const loggedInStatus = getLoginStatus();
    const userType = getUserType();
    const loginButton = document.getElementById("loginButton");
    const adminDashboardButton = document.getElementById("adminDashboardButton");
    const userDashboardButton = document.getElementById("userDashboardButton");
    if (loggedInStatus && userType === "admin") {
        loginButton.classList.add("d-none");
        adminDashboardButton.classList.remove("d-none");
    }
    if (loggedInStatus && userType === "customer") {
        loginButton.classList.add("d-none");
        userDashboardButton.classList.remove("d-none");
    }
}

/**
 * Validates dates to ensure they are in the future and return date is after departure
 * @returns {boolean} true if dates are valid, false otherwise
 */
function validateDates() {
    const departureDate = new Date(document.getElementById("departureDate").value);
    const returnDate = new Date(document.getElementById("returnDate").value);

    // Create a current date
    const today = new Date();
    // Reset time to start of day for simplicity
    today.setHours(0, 0, 0, 0);

    if (departureDate < today) {
        alert("Departure date must be in the future");
        return false;
    }

    if (document.getElementById("roundTrip").checked) {
        if (returnDate < today) {
            alert("Return date must be in the future");
            return false;
        }
        if (returnDate < departureDate) {
            alert("Return date must be after departure date");
            return false;
        }
    }
    return true;
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
document.addEventListener("DOMContentLoaded", () => {
    loadSearchDetails();
    loginDashboardButtonSwap();
    populateCityList();
});