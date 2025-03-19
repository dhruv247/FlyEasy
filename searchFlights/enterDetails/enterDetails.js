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
                        <input type="email" class="form-control" name="emailInput${i}" id="emailInput${i}" 
                            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                            title="Please enter a valid email address"
                            placeholder="Email" required>
                    </div>
                    <div class="col-1 col-md-4"></div>
                </div>
                <!-- Age Input -->
                <div class="row mb-3">
                    <div class="col-1 col-md-4"></div>
                    <div class="col-10 col-md-4">
                        <input type="number" name="ageInput${i}" id="ageInput${i}" class="form-control" 
                            min="1" max="120" step="1"
                            title="Age must be between 1 and 120 years"
                            placeholder="Age" required>
                    </div>
                    <div class="col-1 col-md-4"></div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', flyerForm);
    }
}

/**
 * This function is used to create tickets and then use those tickets to create bookings
 * @param {*} event - form submission event
 * @description
 * 1. Get's all initial data
 *  a. Get's data stored from local storage
 *  b. Get's user data from indexedDB
 *  c. Get's flight data from indexedDB
 * 2. update's a flight's booked seats count and seat prices
 * 3. Calculate ticket prices using the updated flights (seat count and current prices)
 * 4. Create tickets (using no of travellers)
 * 5. combine tickets to create a booking
 * 6. redirects to the current user's booking dashboard
 */
async function createBooking(event) {
    try {
        event.preventDefault();

        // Add validation before processing
        for (let i = 1; i <= noOfTraveller; i++) {
            const age = parseInt(document.getElementById(`ageInput${i}`).value);
            const email = document.getElementById(`emailInput${i}`).value;
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (age < 1 || age > 120 || !Number.isInteger(age)) {
                throw new Error(`Invalid age for Flyer ${i}. Age must be between 1 and 120 years.`);
            }

            if (!emailRegex.test(email)) {
                throw new Error(`Invalid email format for Flyer ${i}.`);
            }
        }

        // 1. Get all initial data
        const userId = getUserId();
        const userObject = await getUserByUserId(userId);
        const user = {
            userId: userObject.userId,
            username: userObject.username,
            email: userObject.email
        };

        const tripType = getTripType();
        const seatType = getTravelClass();
        const departureFlightId = getDepartureFlightId();
        let departureFlight = await getFlightsByFlightId(departureFlightId);
        
        let returnFlight = null;
        let returnFlightId = null;
        if (tripType !== "oneWay") {
            returnFlightId = getReturnFlightId();
            returnFlight = await getFlightsByFlightId(returnFlightId);
        }

        // 2. Update flight seat counts and prices first
        if (tripType === "oneWay") {
            const seatUpdates = {};
            if (seatType === "1") {
                const newEconomyCount = Number(departureFlight.economyBookedCount) + Number(noOfTraveller);
                seatUpdates.economyBookedCount = newEconomyCount;
                seatUpdates.economyCurrentPrice = Math.round(
                    ((newEconomyCount / Number(departureFlight.economyCapacity)) * Number(departureFlight.economyBasePrice)) + 
                    Number(departureFlight.economyBasePrice)
                );
                departureFlight.economyBookedCount = newEconomyCount;
                departureFlight.economyCurrentPrice = seatUpdates.economyCurrentPrice;
            } else {
                const newBusinessCount = Number(departureFlight.businessBookedCount) + Number(noOfTraveller);
                seatUpdates.businessBookedCount = newBusinessCount;
                seatUpdates.businessCurrentPrice = Math.round(
                    ((newBusinessCount / Number(departureFlight.businessCapacity)) * Number(departureFlight.businessBasePrice)) + 
                    Number(departureFlight.businessBasePrice)
                );
                departureFlight.businessBookedCount = newBusinessCount;
                departureFlight.businessCurrentPrice = seatUpdates.businessCurrentPrice;
            }
            await updateFlight(departureFlightId, seatUpdates);
        } else {
            const departureUpdates = {};
            const returnUpdates = {};

            if (seatType === "1") {
                departureUpdates.economyBookedCount = Number(departureFlight.economyBookedCount) + Number(noOfTraveller);
                returnUpdates.economyBookedCount = Number(returnFlight.economyBookedCount) + Number(noOfTraveller);
                
                departureUpdates.economyCurrentPrice = Math.round(
                    ((departureUpdates.economyBookedCount / Number(departureFlight.economyCapacity)) * Number(departureFlight.economyBasePrice)) + 
                    Number(departureFlight.economyBasePrice)
                );
                returnUpdates.economyCurrentPrice = Math.round(
                    ((returnUpdates.economyBookedCount / Number(returnFlight.economyCapacity)) * Number(returnFlight.economyBasePrice)) + 
                    Number(returnFlight.economyBasePrice)
                );

                departureFlight.economyBookedCount = departureUpdates.economyBookedCount;
                departureFlight.economyCurrentPrice = departureUpdates.economyCurrentPrice;
                returnFlight.economyBookedCount = returnUpdates.economyBookedCount;
                returnFlight.economyCurrentPrice = returnUpdates.economyCurrentPrice;
            } else {
                departureUpdates.businessBookedCount = Number(departureFlight.businessBookedCount) + Number(noOfTraveller);
                returnUpdates.businessBookedCount = Number(returnFlight.businessBookedCount) + Number(noOfTraveller);
                
                departureUpdates.businessCurrentPrice = Math.round(
                    ((departureUpdates.businessBookedCount / Number(departureFlight.businessCapacity)) * Number(departureFlight.businessBasePrice)) + 
                    Number(departureFlight.businessBasePrice)
                );
                returnUpdates.businessCurrentPrice = Math.round(
                    ((returnUpdates.businessBookedCount / Number(returnFlight.businessCapacity)) * Number(returnFlight.businessBasePrice)) + 
                    Number(returnFlight.businessBasePrice)
                );

                departureFlight.businessBookedCount = departureUpdates.businessBookedCount;
                departureFlight.businessCurrentPrice = departureUpdates.businessCurrentPrice;
                returnFlight.businessBookedCount = returnUpdates.businessBookedCount;
                returnFlight.businessCurrentPrice = returnUpdates.businessCurrentPrice;
            }

            await updateFlight(departureFlightId, departureUpdates);
            await updateFlight(returnFlightId, returnUpdates);
        }

        // 3. Calculate ticket price using updated prices
        let ticketPrice;
        if (tripType === "oneWay") {
            ticketPrice = seatType === "1" ? 
                Number(departureFlight.economyCurrentPrice) : 
                Number(departureFlight.businessCurrentPrice);
        } else {
            const departurePrice = seatType === "1" ? 
                Number(departureFlight.economyCurrentPrice) : 
                Number(departureFlight.businessCurrentPrice);
            const returnPrice = seatType === "1" ? 
                Number(returnFlight.economyCurrentPrice) : 
                Number(returnFlight.businessCurrentPrice);
            ticketPrice = departurePrice + returnPrice;
        }

        // 4. Create tickets with updated flight data
        let tickets = [];
        let totalBookingPrice = 0;

        for (let i = 1; i <= noOfTraveller; i++) {
            const flyerName = document.getElementById(`nameInput${i}`).value;
            const flyerEmail = document.getElementById(`emailInput${i}`).value;
            const flyerAge = parseInt(document.getElementById(`ageInput${i}`).value);

            const ticket = await addTicketToDB(
                user,
                departureFlight,
                returnFlight,
                flyerName,
                flyerEmail,
                flyerAge,
                tripType,
                seatType === "1" ? "economy" : "business",
                ticketPrice
            );

            tickets.push({
                ticketId: ticket.ticketId,
                nameOfFlyer: flyerName,
                ageOfFlyer: flyerAge,
                emailOfFlyer: flyerEmail,
                tripType,
                seatType: seatType === "1" ? "economy" : "business",
                ticketPrice
            });

            totalBookingPrice += ticketPrice;
        }

        // 5. Create booking with updated flight data
        const booking = await addBookingToDB(
            user,
            departureFlight,
            returnFlight,
            tickets,
            tripType,
            totalBookingPrice,
            "confirmed"
        );

        clearCurrentFlightDetails();
        window.location.href = '/dashboards/user/bookings/bookings.html'

    } catch (error) {
        alert(error.message);
        console.error(error.message)
    }
}

/**
 * Event listeners
 */
document.addEventListener("DOMContentLoaded", protectCustomerPage);
document.addEventListener("DOMContentLoaded", createFlyerForms);