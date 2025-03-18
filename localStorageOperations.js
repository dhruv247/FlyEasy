/**
 * Gets login status
 * @returns {boolean} True if user is logged in, false otherwise
 */
function getLoginStatus() {
    return localStorage.getItem("loginStatus") === "true";
}

/**
 * Gets user type
 * @returns {string} User type "customer" or 'admin'
 */
function getUserType() {
    return localStorage.getItem("userType");
}

/**
 * Gets user ID from localStorage
 * @returns {string} User ID
 */
function getUserId() {
    return localStorage.getItem("userId");
}

/**
 * gets travel class
 * @returns travel class as 1 or 2
 */
function getTravelClass() {
    return localStorage.getItem("travelClass")
}

/**
 * gets number of travellers
 * @returns 
 */
function getNoOfTraveller() {
    return localStorage.getItem("noOfTraveller");
}

/**
 * Sets user login data
 * @param {Object} user - User object containing userId and userType
 */
function setUserLoginData(user) {
    localStorage.setItem("loginStatus", true);
    localStorage.setItem("userId", user.userId);
    localStorage.setItem("userType", user.userType);
}

/**
 * Gets flight ID from localStorage
 * @returns {string} User ID
 */
function getFlightId() {
    return localStorage.getItem("flightId");
}

/**
 * Saves flight search data (used in index.html and searchFlight.html)
 * @param {FormData} formData Form data containing flight search parameters
 */
function saveFlightSearchData(formData) {
    // Trip Type
    const tripType = formData.get("tripType");
    localStorage.setItem("tripType", tripType);
    // return date only if round trip
    if (tripType === "roundTrip" && !document.getElementById("returnDate").classList.contains("d-none")) {
        localStorage.setItem("returnDate", formData.get("returnDate"));
    } else {
        localStorage.removeItem("returnDate");
    }
    // other flight details
    localStorage.setItem("flightFrom", formData.get("flightFrom"));
    localStorage.setItem("flightTo", formData.get("flightTo"));
    localStorage.setItem("departureDate", formData.get("departureDate"));
    localStorage.setItem("travelClass", formData.get("travelClass"));
    localStorage.setItem("noOfTraveller", formData.get("noOfTraveller"));
}

/**
 * changes the return date from roundTrip.html
 * @param {*} returnDate 
 */
function changeReturnDate(returnDate) {
    localStorage.setItem("returnDate", returnDate)
}

/**
 * Loads flight search data
 * @returns {Object} Object of all flight search data
 */
function getFlightSearchData() {
    return {
        tripType: localStorage.getItem("tripType"),
        flightFrom: localStorage.getItem("flightFrom"),
        flightTo: localStorage.getItem("flightTo"),
        departureDate: localStorage.getItem("departureDate"),
        returnDate: localStorage.getItem("returnDate"),
        noOfTraveller: localStorage.getItem("noOfTraveller"),
        travelClass: localStorage.getItem("travelClass")
    };
}

/**
 * stores the departure flight id in local storage
 * @param {*} flightId 
 */
function storeDepartureFlightId(flightId) {
    localStorage.setItem("departureFlightId", flightId);
}

/**
 * stores the return flight id in local storage
 * @param {*} flightId 
 */
function storeReturnFlightId(flightId) {
    localStorage.setItem("returnFlightId", flightId);
}

/**
 * gets the departure flight Id
 * @returns flightId
 */
function getDepartureFlightId() {
    return localStorage.getItem("departureFlightId");
}

/**
 * gets the return flight Id
 * @returns flightId
 */
function getReturnFlightId() {
    return localStorage.getItem("returnFlightId");
}

/**
 * gets the trip type from local storage
 * @returns tripType
 */
function getTripType() {
    return localStorage.getItem("tripType");
}

function clearCurrentFlightDetails() {
    localStorage.removeItem("departureDate");
    localStorage.removeItem("departureFlightId");
    localStorage.removeItem("flightFrom");
    localStorage.removeItem("flightTo");
    localStorage.removeItem("noOfTraveller");
    localStorage.removeItem("returnFlightId");
    localStorage.removeItem("travelClass");
    localStorage.removeItem("tripType");
}

/**
 * clears local storage
 */
function clearLocalStorage() {
    localStorage.clear();
}