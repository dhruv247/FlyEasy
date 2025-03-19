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
 * Updates flight details in related bookings and tickets
 * @param {Object} updatedFlight - The flight object with updated details
 */
async function updateRelatedBookingsAndTickets(updatedFlight) {
    try {
        // Update bookings
        const allBookings = await getAllBookings();
        const relatedBookings = allBookings.filter(booking => 
            (booking.departureFlight?.flightId === updatedFlight.flightId) || 
            (booking.returnFlight?.flightId === updatedFlight.flightId)
        );

        // Update each related booking
        for (const booking of relatedBookings) {
            const updates = {};
            if (booking.departureFlight?.flightId === updatedFlight.flightId) {
                updates.departureFlight = updatedFlight;
            }
            if (booking.returnFlight?.flightId === updatedFlight.flightId) {
                updates.returnFlight = updatedFlight;
            }
            await updateBooking(booking.bookingId, updates);
        }

        // Get tickets directly using the flight ID
        const departureTickets = await getTicketsByDepartureFlightId(updatedFlight.flightId);
        const returnTickets = await getTicketsByReturnFlightId(updatedFlight.flightId);

        // Update departure tickets
        for (const ticket of departureTickets) {
            await updateTicket(ticket.ticketId, {
                departureFlight: updatedFlight
            });
        }

        // Update return tickets
        for (const ticket of returnTickets) {
            await updateTicket(ticket.ticketId, {
                returnFlight: updatedFlight
            });
        }

        console.log(`Updated ${departureTickets.length} departure tickets and ${returnTickets.length} return tickets`);
    } catch (error) {
        console.error("Error updating related bookings and tickets:", error);
        throw error;
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
    const departureDateTime = new Date(`${departureDate}T${departureTime}`);
    const arrivalDateTime = new Date(`${arrivalDate}T${arrivalTime}`);
    
    if (arrivalDateTime <= departureDateTime) {
        throw new Error("Arrival time must be after departure time");
    }

    // Calculate duration in hours
    const durationMs = arrivalDateTime - departureDateTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    
    // Validate reasonable flight duration (e.g., not more than 20 hours for domestic flights)
    if (hours > 20) {
        throw new Error("Flight duration seems unusually long. Please check the times.");
    }
    
    return {
        durationMs,
        departureDateTime,
        arrivalDateTime
    };
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
        const arrivalDate = formData.get("arrivalDate");
        const newDepartureTime = formData.get("departureTime");
        const newArrivalTime = formData.get("arrivalTime");

        // Validate times and get duration
        const { durationMs, departureDateTime, arrivalDateTime } = validateFlightTimes(
            departureDate,
            newDepartureTime,
            arrivalDate,
            newArrivalTime
        );

        // Calculate hours and minutes for duration
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        // Format duration as "Xh Ym"
        const newDuration = `${hours}:${minutes}`;

        const updates = {
            departureTime: newDepartureTime,
            arrivalTime: newArrivalTime,
            duration: newDuration,
            changed: "Flight Times Changed"
        };

        const flightId = localStorage.getItem("flightId");
        const updatedFlight = await updateFlight(flightId, updates);
        
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