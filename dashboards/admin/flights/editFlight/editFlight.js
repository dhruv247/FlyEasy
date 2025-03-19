/**
 * Loads flight details using flight Id from local Storage
 */
async function loadEditFlightDetails() {
    try {
        let flightId = getFlightId();
        let flight = await getFlightsByFlightId(flightId);
        
        // Basic flight details - non-editable
        document.getElementById("flightNo").value = flight.flightNo;
        document.getElementById("flightNo").setAttribute("readonly", true);
        
        // For select elements, use disabled
        document.getElementById("planeName").value = flight.planeName;
        document.getElementById("planeName").setAttribute("disabled", true);
        
        document.getElementById("airline").value = flight.airline;
        document.getElementById("airline").setAttribute("disabled", true);
        
        // Departure details
        document.getElementById("departurePlace").value = flight.departurePlace;
        document.getElementById("departurePlace").setAttribute("disabled", true);
        
        document.getElementById("departureDate").value = flight.departureDate;
        document.getElementById("departureDate").setAttribute("readonly", true);
        
        // Departure time - editable
        document.getElementById("departureTime").value = flight.departureTime;
        
        // Arrival details
        document.getElementById("arrivalPlace").value = flight.arrivalPlace;
        document.getElementById("arrivalPlace").setAttribute("disabled", true);
        
        document.getElementById("arrivalDate").value = flight.arrivalDate;
        document.getElementById("arrivalDate").setAttribute("readonly", true);
        
        // Arrival time - editable
        document.getElementById("arrivalTime").value = flight.arrivalTime;
        
        // Capacity details - non-editable
        document.getElementById("economyCapacity").value = flight.economyCapacity;
        document.getElementById("economyCapacity").setAttribute("readonly", true);
        
        document.getElementById("businessCapacity").value = flight.businessCapacity;
        document.getElementById("businessCapacity").setAttribute("readonly", true);
        
        // Price details - non-editable
        document.getElementById("economyBasePrice").value = flight.economyBasePrice;
        document.getElementById("economyBasePrice").setAttribute("readonly", true);
        
        document.getElementById("businessBasePrice").value = flight.businessBasePrice;
        document.getElementById("businessBasePrice").setAttribute("readonly", true);

        // Change form attributes
        document.getElementById("addFlightForm").setAttribute("onsubmit", "changeFlightDetails(event)");
        document.querySelector("button[type='submit']").textContent = "Update Flight Times";
        
    } catch (error) {
        alert("Error! Could not load details!" + error.message)
    }
}

/**
 * change flight times and duration and update flight using function flightsDB.js
 * @param {*} event - form submission event
 */
async function changeFlightDetails(event) {
    try {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const departureDate = formData.get("departureDate");
        const arrivalDate = formData.get("arrivalDate")
        const newDepartureTime = formData.get("departureTime");
        const newArrivalTime = formData.get("arrivalTime");
        const newDepartureDateTime = new Date(`${departureDate}T${newDepartureTime}`);
        const newArrivalDateTime = new Date(`${arrivalDate}T${newArrivalTime}`);

        // Calculate duration in milliseconds
        const durationMs = newArrivalDateTime - newDepartureDateTime;

        // Convert to hours and minutes
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        // Format duration as "Xh Ym"
        const newDuration = `${hours}:${minutes}`;

        if (newArrivalDateTime <= newDepartureDateTime) {
            throw new Error("Arrival date and time must be after departure date and time!");
        } else {
            const updates = {
                departureTime: newDepartureTime,
                arrivalTime: newArrivalTime,
                duration: newDuration,
                changed: "Flight Times Changed"
            }
            const flightId = localStorage.getItem("flightId");
            const updatedFlight = await updateFlight(flightId, updates);
            if (updatedFlight) {
                alert("Flight times changed successfully!")
                window.location.href = '../flights.html'
            } else {
                throw new Error("Flight times could not be changed! Please try again.")
            }
        }
    }
    catch (error) {
        console.error("Error updating flight:", error);
        alert(error.message);
    }
}

/**
 * Event triggers
 */
document.addEventListener("DOMContentLoaded", loadEditFlightDetails);
document.addEventListener("DOMContentLoaded", adminDashboardCheck); // route protection