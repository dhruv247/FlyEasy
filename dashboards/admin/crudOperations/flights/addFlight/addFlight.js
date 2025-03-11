/**
 * Function to add a flight to the db
 * @param {*} event - form submission event
 * @description
 * 1. gets the data add flight form
 * 2. use addFlightToDB function from flightDB.js to add a flight to db
 * 3. reset (clear form after adding flight)
 */

// Add admin check when page loads
document.addEventListener("DOMContentLoaded", adminDashboardCheck);

async function addFlight(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const flightNo = formData.get('flightNo');
    const planeName = formData.get('planeName');
    const airline = formData.get('airline');
    const departurePlace = formData.get('departurePlace');
    const departureDate = formData.get('departureDate');
    const departureTime = formData.get('departureTime');
    const departureDateTime = new Date(`${departureDate}T${departureTime}`);
    const arrivalPlace = formData.get('arrivalPlace');
    const arrivalDate = formData.get('arrivalDate');
    const arrivalTime = formData.get('arrivalTime');
    const arrivalDateTime = new Date(`${arrivalDate}T${arrivalTime}`);

    // Calculate duration in milliseconds
    const durationMs = arrivalDateTime - departureDateTime;

    // Convert to hours and minutes
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    // Format duration as "Xh Ym"
    const duration = `${hours}h ${minutes}m`;

    const economyCapacity = Number(formData.get('economyCapacity'));
    let economyBookedCount = 0;
    const businessCapacity = Number(formData.get('businessCapacity'));
    let businessBookedCount = 0;
    const economyBasePrice = Number(formData.get('economyBasePrice'));
    const businessBasePrice = Number(formData.get('businessBasePrice'));
    let economyCurrentPrice = (((economyBookedCount/100)*economyBasePrice)+economyBasePrice);
    let businessCurrentPrice = (((businessBookedCount/100) * businessBasePrice) + businessBasePrice);

    try {
        const existingFlight = await getFlightsByFlightNo(flightNo);
        if (existingFlight) {
            throw new Error(`Flight number ${flightNo} already exists. Please use a different flight number.`);
        }

        if (departurePlace === arrivalPlace) {
            throw new Error("Departure and Arrival city cannot be same!")
        }

        // Check if arrival is before departure
        if (arrivalDateTime <= departureDateTime) {
            throw new Error("Arrival date and time must be after departure date and time!");
        }

        const flight = await addFlightToDB(
            flightNo,
            planeName,
            airline,
            departurePlace,
            departureDate,
            departureTime,
            arrivalPlace,
            arrivalDate,
            arrivalTime,
            duration,
            economyCapacity,
            economyBookedCount,
            businessCapacity,
            businessBookedCount,
            economyBasePrice,
            businessBasePrice,
            economyCurrentPrice,
            businessCurrentPrice
        );
        
        alert("Flight added successfully");
        // Redirect after successful addition
        window.location.href = "/dashboards/admin/crudOperations/flights/flights.html";
    } catch (error) {
        alert(error.message);
    }
}