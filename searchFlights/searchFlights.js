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
    event.preventDefault(); // Prevent default form submission

    const form = event.target; // Get the form element
    const formData = new FormData(form); // Create FormData object

    // Store trip type based on selected radio button
    const tripType = formData.get("tripType"); // "oneWay" or "roundTrip"
    localStorage.setItem("tripType", tripType);

    // Store return date only if it's not hidden
    if (tripType === "roundTrip" && !document.getElementById("returnDate").classList.contains("d-none")) {
        localStorage.setItem("returnDate", formData.get("returnDate"));
    } else {
        localStorage.removeItem("returnDate");
    }

    // Store other flight details
    localStorage.setItem("flightFrom", formData.get("flightFrom"));
    localStorage.setItem("flightTo", formData.get("flightTo"));
    localStorage.setItem("departureDate", formData.get("departureDate"));
    localStorage.setItem("travelClass", formData.get("travelClass"));
    localStorage.setItem("noOfTraveller", formData.get("noOfTraveller"));

    // Redirect to search flights page
    window.location.href = "../searchFlights/searchFlights.html";
}

/**
 * Loads search data from local storage to maintain search field input persistence
 * @description
 * 1. This Function uses trip type to decide which fields to show
 * 2. Loads data from local storage for the fields that are needed
 */
function loadSearchDetails() {
    if (localStorage.getItem("tripType")) {
        const tripType = localStorage.getItem("tripType");
        if (tripType === "oneWay") {
            document.getElementById("oneWay").checked = true;
            document.getElementById("returnDate").classList.add("d-none"); // Hide return date for one way
            document.getElementById("returnDate").removeAttribute("required"); // Ensure it's not required
        } else {
            document.getElementById("roundTrip").checked = true;
            document.getElementById("returnDate").classList.remove("d-none"); // Show return date for round trip
            document.getElementById("returnDate").setAttribute("required", "required"); // Make required
        }
    }
    if (localStorage.getItem("flightFrom")) {
        document.getElementById("flightFrom").value = localStorage.getItem("flightFrom");
    }
    if (localStorage.getItem("flightTo")) {
        document.getElementById("flightTo").value = localStorage.getItem("flightTo");
    }
    if (localStorage.getItem("departureDate")) {
        document.getElementById("departureDate").value = localStorage.getItem("departureDate");
    }
    if (localStorage.getItem("returnDate")) {
        document.getElementById("returnDate").value = localStorage.getItem("returnDate");
        document.getElementById("returnDate").classList.remove("d-none"); // Ensure return date is visible if set
        document.getElementById("returnDate").setAttribute("required", "required"); // Make required
    }
    if (localStorage.getItem("noOfTraveller")) {
        document.getElementById("noOfTraveller").value = localStorage.getItem("noOfTraveller");
    }
    if (localStorage.getItem("travelClass")) {
        document.getElementById("travelClass").value = localStorage.getItem("travelClass");
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
 * Event Lister for loading the page
 * @description
 * 1. Uses a function protectPage from auth.js
 * 2. Ensures that user is logged in and authorized to view the page
 */
document.addEventListener("DOMContentLoaded", protectPage);
/**
 * Loads search data to DOM on opening file
 */
document.addEventListener("DOMContentLoaded", loadSearchDetails);