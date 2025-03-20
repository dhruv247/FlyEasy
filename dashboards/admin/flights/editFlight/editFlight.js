/**
 * Loads flight details from indexedDB using flight Id from local Storage
 * Keeps all fields disabled except deprture time and arrival time
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
 * Updates flight details in related bookings and tickets
 * @param {Object} updatedFlight - The flight object with updated details
 * @description
 * 
 */
async function updateRelatedBookingsAndTickets(updatedFlight) {
    try {
        // 1. Get related bookings using functions from bookingsDB.js which uses flight ids
        const departureBookings = await getBookingsByDepartureFlightId(updatedFlight.flightId);
        const returnBookings = await getBookingsByReturnFlightId(updatedFlight.flightId);

        // 2. Update departure bookings
        for (const booking of departureBookings) {
            await updateBooking(booking.bookingId, {
                departureFlight: updatedFlight
            });
        }

        // 3. Update return bookings
        for (const booking of returnBookings) {
            await updateBooking(booking.bookingId, {
                returnFlight: updatedFlight
            });
        }

        // 4. Use custom functions in ticketsDB.js to get tickets directly using the flight ID
        const departureTickets = await getTicketsByDepartureFlightId(updatedFlight.flightId);
        const returnTickets = await getTicketsByReturnFlightId(updatedFlight.flightId);

        // 5. Update departure tickets
        for (const ticket of departureTickets) {
            await updateTicket(ticket.ticketId, {
                departureFlight: updatedFlight
            });
        }

        // 6. Update return tickets
        for (const ticket of returnTickets) {
            await updateTicket(ticket.ticketId, {
                returnFlight: updatedFlight
            });
        }

    } catch (error) {
        // We are using a different error throwing format here as this is a behind the scenes operation
        console.error("Error updating related bookings and tickets:", error);
    }
}

/**
 * Validates that arrival time is after departure time
 * @param {string} departureDate 
 * @param {string} departureTime 
 * @param {string} arrivalDate 
 * @param {string} arrivalTime 
 * @throws {Error} if arrival is not after departure
 */
function validateFlightTimes(departureDate, departureTime, arrivalDate, arrivalTime) {
    // create a combined departure date and time
    const departureDateTime = new Date(`${departureDate}T${departureTime}`);
    const arrivalDateTime = new Date(`${arrivalDate}T${arrivalTime}`);
    
    if (arrivalDateTime <= departureDateTime) {
        throw new Error("Arrival time must be after departure time");
    }

    // Calculate duration in hours
    const durationMs = arrivalDateTime - departureDateTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    
    // Validate reasonable flight duration (e.g., not more than 20 hours for flights and not less than 1 hour)
    if (hours > 20) {
        throw new Error("Flight duration seems unusually long. Please check the times.");
    }
    if (hours < 1) {
        throw new Error("Flight duration seems unusually short. Please check the times.")
    }
    
    return {
        durationMs,
        departureDateTime,
        arrivalDateTime
    };
}

/**
 * change flight times and duration and update flight using function in flightsDB.js
 * @param {*} event - form submission event
 */
async function changeFlightDetails(event) {
    try {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        // 1. get form data
        const departureDate = formData.get("departureDate");
        const arrivalDate = formData.get("arrivalDate");
        const newDepartureTime = formData.get("departureTime");
        const newArrivalTime = formData.get("arrivalTime");

        // 2. Validate times
        const { durationMs, departureDateTime, arrivalDateTime } = validateFlightTimes(
            departureDate,
            newDepartureTime,
            arrivalDate,
            newArrivalTime
        );

        // 3. Calculate hours and minutes for duration
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        const newDuration = `${hours}:${minutes}`;

        // 4. Update flight object
        const updates = {
            departureTime: newDepartureTime,
            arrivalTime: newArrivalTime,
            duration: newDuration,
            changed: "Flight Times Changed"
        };

        const flightId = localStorage.getItem("flightId");
        const updatedFlight = await updateFlight(flightId, updates);
        
        // 5. Update related tickets and bookings
        if (updatedFlight) {
            try {
                await updateRelatedBookingsAndTickets(updatedFlight);
                alert("Flight times changed successfully!")
                window.location.href = '../flights.html'
            } catch (updateError) {
                console.error("Error updating related records:", updateError);
                alert("Flight updated but there was an error updating related bookings and tickets. Please contact support.");
                window.location.href = '../flights.html'
            }
        } else {
            throw new Error("Flight times could not be changed! Please try again.")
        }
    } catch (error) {
        console.error("Error updating flight:", error);
        alert(error.message);
    }
}

/**
 * Event triggers
 */
document.addEventListener("DOMContentLoaded", loadEditFlightDetails);
document.addEventListener("DOMContentLoaded", adminDashboardCheck); // route protection