// Global variable storing number of travellers
const noOfTraveller = getNoOfTraveller();

/**
 * Dynamically creates flyer detail input forms based on number of travellers
 */
function createFlyerForms() {
    const container = document.getElementById('flyerFormsContainer');

    for (let i = 1; i <= noOfTraveller; i++) {
        const flyerForm = `
            <h3 class="mt-5">Flyer ${i}</h3>
            <div class="flyerDetailsFields">
                <!-- Name Input -->
                <div class="row mb-3">
                    <div class="col-1 col-md-4"></div>
                    <div class="col-10 col-md-4">
                        <input type="text" class="form-control" name="nameInput${i}" id="nameInput${i}" placeholder="Full Name" required>
                    </div>
                    <div class="col-1 col-md-4"></div>
                </div>
                <!-- Email Input -->
                <div class="row mb-3">
                    <div class="col-1 col-md-4"></div>
                    <div class="col-10 col-md-4">
                        <input type="email" class="form-control" name="emailInput${i}" id="emailInput${i}" placeholder="Email" required>
                    </div>
                    <div class="col-1 col-md-4"></div>
                </div>
                <!-- Age Input -->
                <div class="row mb-3">
                    <div class="col-1 col-md-4"></div>
                    <div class="col-10 col-md-4">
                        <input type="number" name="ageInput${i}" id="ageInput${i}" class="form-control" placeholder="Age" required>
                    </div>
                    <div class="col-1 col-md-4"></div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', flyerForm);
    }
}

/**
 * This function is used to create bookins
 * @param {*} event - form submission event
 * @description
 * 1. Get's all the details to create a ticket
 *  a. Get's data stored from local storage
 *  b. Calculates ticket prices
 *  c. creates a ticket
 * 2. update's a flight's booked seats count and seat prices
 * 3. Create's a booking with the tickets
 * 4. redirects to the current user's booking dashboard
 */
async function createBooking(event) {

    try {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        // Ticket details
        const userId = getUserId();
        const departureFlightId = getDepartureFlightId();
        const returnFlightId = getReturnFlightId();
        // console.log(departureFlightId);
        // console.log(returnFlightId);
        const tripType = getTripType();
        const seatType = getTravelClass();

        // Calculate ticket price
        const departureFlight = await getFlightsByFlightId(departureFlightId);
        const returnFlight = await getFlightsByFlightId(returnFlightId);

        let ticketPrice;

        if (tripType == "oneWay") {
            if (seatType == "1") {
                ticketPrice = departureFlight.economyCurrentPrice
            } else {
                ticketPrice = departureFlight.businessCurrentPrice
            }
        } else {
            if (seatType == "1") {
                let departureTicketPrice = departureFlight.economyCurrentPrice;
                let returnTicketPrice = returnFlight.economyCurrentPrice;
                ticketPrice = (departureTicketPrice + returnTicketPrice)
            } else {
                let departureTicketPrice = departureFlight.businessCurrentPrice;
                let returnTicketPrice = returnFlight.businessCurrentPrice;
                ticketPrice = (departureTicketPrice + returnTicketPrice)
            }
        }
        // console.log(typeof(ticketPrice))

        let ticketIdArray = [];
        let totalBookingPrice = 0;

        for (let i = 1; i <= noOfTraveller; i++) {
            // Using query selector instead of form as multiple flyers are filling the form
            const flyerName = document.getElementById(`nameInput${i}`).value;
            const flyerEmail = document.getElementById(`emailInput${i}`).value;
            const flyerAge = parseInt(document.getElementById(`ageInput${i}`).value);

            // create ticket
            const ticket = await addTicketToDB(
                userId,
                departureFlightId,
                returnFlightId,
                flyerName,
                flyerEmail,
                flyerAge,
                tripType,
                seatType,
                ticketPrice
            );

            ticketIdArray.push(ticket.ticketId);
            totalBookingPrice += ticketPrice;
        }
        
        // Update seat counts and prices
        if (tripType == "oneWay") {
            const seatUpdates = {};
            if (seatType == "1") {
                const newEconomyCount = Number(departureFlight.economyBookedCount) + Number(noOfTraveller);
                seatUpdates.economyBookedCount = newEconomyCount;
                seatUpdates.economyCurrentPrice = Math.round(
                    ((newEconomyCount / Number(departureFlight.economyCapacity)) * Number(departureFlight.economyBasePrice)) + 
                    Number(departureFlight.economyBasePrice)
                );
            } else {
                const newBusinessCount = Number(departureFlight.businessBookedCount) + Number(noOfTraveller);
                seatUpdates.businessBookedCount = newBusinessCount;
                seatUpdates.businessCurrentPrice = Math.round(
                    ((newBusinessCount / Number(departureFlight.businessCapacity)) * Number(departureFlight.businessBasePrice)) + 
                    Number(departureFlight.businessBasePrice)
                );
            }
            await updateFlight(departureFlightId, seatUpdates);
        } else {
            // Handle return flight updates
            const departureUpdates = {};
            const returnUpdates = {};

            if (seatType == "1") {
                // Update economy seats and prices for both flights
                const newDepartureEconomyCount = Number(departureFlight.economyBookedCount) + Number(noOfTraveller);
                const newReturnEconomyCount = Number(returnFlight.economyBookedCount) + Number(noOfTraveller);
                
                departureUpdates.economyBookedCount = newDepartureEconomyCount;
                returnUpdates.economyBookedCount = newReturnEconomyCount;
                
                // Recalculate economy prices with rounding
                departureUpdates.economyCurrentPrice = Math.round(
                    ((newDepartureEconomyCount / Number(departureFlight.economyCapacity)) * Number(departureFlight.economyBasePrice)) + 
                    Number(departureFlight.economyBasePrice)
                );
                returnUpdates.economyCurrentPrice = Math.round(
                    ((newReturnEconomyCount / Number(returnFlight.economyCapacity)) * Number(returnFlight.economyBasePrice)) + 
                    Number(returnFlight.economyBasePrice)
                );
            } else {
                // Update business seats and prices for both flights
                const newDepartureBusinessCount = Number(departureFlight.businessBookedCount) + Number(noOfTraveller);
                const newReturnBusinessCount = Number(returnFlight.businessBookedCount) + Number(noOfTraveller);
                
                departureUpdates.businessBookedCount = newDepartureBusinessCount;
                returnUpdates.businessBookedCount = newReturnBusinessCount;
                
                // Recalculate business prices with rounding
                departureUpdates.businessCurrentPrice = Math.round(
                    ((newDepartureBusinessCount / Number(departureFlight.businessCapacity)) * Number(departureFlight.businessBasePrice)) + 
                    Number(departureFlight.businessBasePrice)
                );
                returnUpdates.businessCurrentPrice = Math.round(
                    ((newReturnBusinessCount / Number(returnFlight.businessCapacity)) * Number(returnFlight.businessBasePrice)) + 
                    Number(returnFlight.businessBasePrice)
                );
            }

            // Update both flights
            await updateFlight(departureFlightId, departureUpdates);
            await updateFlight(returnFlightId, returnUpdates);
        }

        // create booking
        const booking = await addBookingToDB(
            userId,
            departureFlightId,
            returnFlightId,
            ticketIdArray,
            tripType,
            totalBookingPrice,
            "confirmed"
        );

        clearCurrentFlightDetails();

        window.location.href = '/dashboards/user/bookings/bookings.html'

    } catch (error) {
        alert(error.message)
    }
}

/**
 * Event listeners
 */
document.addEventListener("DOMContentLoaded", protectCustomerPage);
document.addEventListener("DOMContentLoaded", createFlyerForms);