/**
 * Function to add a flight to the db
 * @param {*} event - form submission event
 * @description
 * 1. gets the data add flight form
 * 2. use addFlightToDB function from flightDB.js to add a flight to db
 * 3. reset (clear form after adding flight)
 */
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
    const duration = `${hours}:${minutes}`;
    const economyCapacity = Number(formData.get('economyCapacity'));
    let economyBookedCount = 0;
    const businessCapacity = Number(formData.get('businessCapacity'));
    let businessBookedCount = 0;
    const economyBasePrice = Number(formData.get('economyBasePrice'));
    const businessBasePrice = Number(formData.get('businessBasePrice'));
    let economyCurrentPrice = (((economyBookedCount/economyCapacity)*economyBasePrice)+economyBasePrice);
    let businessCurrentPrice = (((businessBookedCount/businessCapacity) * businessBasePrice) + businessBasePrice);
    const changed = "No Changes";

    try {
        // Get current date and set time to start of day for comparison
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Check if departure date is in the past
        const departureDateOnly = new Date(departureDate);
        departureDateOnly.setHours(0, 0, 0, 0);
        
        if (departureDateOnly < currentDate) {
            throw new Error("Departure date cannot be in the past!");
        }

        // If departure is today, check if departure time is in the past
        if (departureDateOnly.getTime() === currentDate.getTime()) {
            const currentTime = new Date();
            const [hours, minutes] = departureTime.split(':');
            const departureTimeObj = new Date();
            departureTimeObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            if (departureTimeObj < currentTime) {
                throw new Error("Departure time cannot be in the past!");
            }
        }

        // Validate flight number format (digit + capital letter + space + 4 digits)
        if (!/^\d[A-Z]\s\d{4}$/.test(flightNo)) {
            throw new Error("Invalid flight number format. Should be like '6E 2000' (digit + capital letter + space + 4 digits)");
        }

        // Validate capacity constraints
        if (economyCapacity <= 0 || businessCapacity <= 0) {
            throw new Error("Capacity must be greater than 0 for both classes.");
        }

        // Validate economy capacity range
        if (economyCapacity < 50 || economyCapacity > 250) {
            throw new Error("Economy capacity must be between 50 and 250 seats.");
        }

        // Validate business capacity range
        if (businessCapacity < 5 || businessCapacity > 25) {
            throw new Error("Business capacity must be between 5 and 25 seats.");
        }

        // Validate pricing constraints
        if (economyBasePrice <= 0 || businessBasePrice <= 0) {
            throw new Error("Base prices must be greater than 0.");
        }

        // Validate economy price range
        if (economyBasePrice < 3000 || economyBasePrice > 30000) {
            throw new Error("Economy base price must be between ₹3,000 and ₹30,000.");
        }

        // Validate business price range
        if (businessBasePrice < 15000 || businessBasePrice > 150000) {
            throw new Error("Business base price must be between ₹15,000 and ₹1,50,000.");
        }

        // Business class should be more expensive than economy
        if (businessBasePrice <= economyBasePrice) {
            throw new Error("Business class price must be higher than economy class price.");
        }

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
            businessCurrentPrice,
            changed
        );
        
        alert("Flight added successfully");
        // Redirect after successful addition
        window.location.href = "/dashboards/admin/flights/flights.html";
    } catch (error) {
        alert(error.message);
    }
}

/**
 * route protection
 */
document.addEventListener("DOMContentLoaded", adminDashboardCheck);