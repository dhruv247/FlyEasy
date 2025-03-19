/**
 * loads booking when DOM content is loaded
 * @description
 * 1. Gets the user id from local storage
 * 2. uses that to get the user's bookings
 * 3. Calls separate function to do the actual DOM manipulation
 */
async function loadBookings() {
    const currentUserId = getUserId();
    try {
        const bookings = await getBookingsByUserId(currentUserId);
        if (bookings) {
            for (let booking of bookings) {
                if (booking.tripType == "oneWay") {
                    createOneWayBooking(booking)
                } else {
                    createRoundTripBooking(booking)
                }
            }
            // Attach event listeners to the booking's buttons
            attachEventListeners();
        } else {
            throw new Error("Cannot get booking!")
        }
    } catch (error) {
        alert(error.message)
    }
}

/**
 * Update's a booking's flight properties
 * @param {*} booking 
 * @description
 * 1. Changes the status of the booking from "confirmed" to "cancelled"
 * 2. updates the flight properties of the booking
 */
async function updateBookingFlightProperties(booking) {

    try {
        const departureFlightId = booking.departureFlight.flightId;
        const departureFlightObject = await getFlightsByFlightId(departureFlightId);

        if (departureFlightObject) {
            if (booking.returnFlight) {
                const returnFlightId = booking.returnFlight.flightId;
                const returnFlightObject = await getFlightsByFlightId(returnFlightId);
                if (returnFlightObject) {
                    const updates = {
                        status: "cancelled",
                        departureFlight: departureFlightObject,
                        returnFlight: returnFlightObject
                    }
                    const updatedBooking = await updateBooking(booking.bookingId, updates);
                    if (updatedBooking) {
                        alert("Successfully cancelled booking!")
                    } else {
                        throw new Error("Error cancelling booking!")
                    }
                } else {
                    throw new Error("Error getting return flight object!");
                }
            } else {
                const updates = {
                    status: "cancelled",
                    departureFlight: departureFlightObject
                }
                const updatedBooking = await updateBooking(booking.bookingId, updates);
                if (updatedBooking) {
                    alert("Successfully cancelled booking!")
                } else {
                    throw new Error("Error cancelling booking!")
                }
            }
        } else {
            throw new Error("Error getting departure flight object!")
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Update a flight objects properties
 * @param {*} noOfTraveller 
 * @param {*} travelClass 
 * @param {*} flightObject
 * @description
 * 1. Depending on travel class update the flight object's properties
 * 2. Update booked seat count by reducing it by the number of travellers
 * 3. update the current prices by using the new seat booked count
 */
async function updateFlightObjectProperties(noOfTraveller, travelClass, flightObject) {
    
    try {
        if (travelClass === "economy") {
            const newEconomyBookedCount = flightObject.economyBookedCount - noOfTraveller;
            const newEconomyCurrentPrice = Math.round(((newEconomyBookedCount/flightObject.economyCapacity)*flightObject.economyBasePrice)+flightObject.economyBasePrice)
            const updates = {
                economyBookedCount: newEconomyBookedCount,
                economyCurrentPrice: newEconomyCurrentPrice
            }
            const updatedFlight = await updateFlight(flightObject.flightId, updates)

            if (!updatedFlight) {
                throw new Error("Error Updating flight's properties")
            }

        } else {
            const newBusinessBookedCount = flightObject.businessBookedCount - noOfTraveller;
            const newBusinessCurrentPrice = Math.round(((newBusinessBookedCount/flightObject.businessCapacity)*flightObject.businessBasePrice)+flightObject.businessBasePrice);
            const updates = {
                businessBookedCount: newBusinessBookedCount,
                businessCurrentPrice: newBusinessCurrentPrice
            }
            const updatedFlight = await updateFlight(flightObject.flightId, updates)
            if (!updatedFlight) {
                throw new Error("Error Updating flight's properties")
            }
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Get's a booking object are argument and uses that to update a flight object's properties
 * @param {*} booking
 * @description
 * 1. Get's the number of travellers in the booking
 * 2. Get's the travel class of bookings
 * 3. Get's the departure and return flight ids from the bookings flight properties
 * 4. Get's the flight objects using those ids
 * 5. Updates the flight object properties using a function call (updateFlightObjectProperties)
 * 6. After the original flight object are updated, we update the bookings flight properties (using a function call - updateBookingFlightProperties)
 */
async function updateFlightObject(booking) {

    try {
        const noOfTraveller = booking.tickets.length;
        const travelClass = booking.tickets[0].seatType;
        // const bookingId = booking.bookingId;
        const departureFlightId = booking.departureFlight.flightId;
        const departureFlightObject = await getFlightsByFlightId(departureFlightId);

        if (departureFlightObject) {
            await updateFlightObjectProperties(noOfTraveller, travelClass, departureFlightObject);
        } else {
            throw new Error("Error getting departure flight object!")
        }

        if (booking.returnFlight) {
            const returnFlightId = booking.returnFlight.flightId;
            const returnFlightObject = await getFlightsByFlightId(returnFlightId);
            if (returnFlightObject) {
                await updateFlightObjectProperties(noOfTraveller, travelClass, returnFlightObject);
            } else {
                throw new Error("Error getting return flight object!")
            }
        }
        await updateBookingFlightProperties(booking)
    } catch (error) {
        alert(error.message)
    }
}

/**
 * dynamically add event listeners to bookings
 * @description
 * 1. Add ticket button event listeners
 * 2. Add cancel booking button event listeners
 */
function attachEventListeners() {
    /**
     * @description
     * 1. get's the booking id using the button
     * 2. stores bookingId to local storage
     * 3. Redirects to tickets.html (separate logic to display tickets for a booking)
     */
    const ticketButtons = document.querySelectorAll(".ticketBtn");
    ticketButtons.forEach(button => {
        button.addEventListener("click", async (e) => {
            const bookingId = e.target.dataset.bookingId;
            try {
                const booking = await getBookingByBookingId(bookingId);
                if (booking) {
                    localStorage.setItem("bookingId", booking.bookingId);
                    window.location.href = './tickets/tickets.html'
                } else {
                    throw new Error("Error getting booking containing the tickets!")
                }
            } catch (error) {
                alert(error.message);
            }
        });
    });

    /**
     * @description
     * 1. Get's the booking id using the cancel booking button
     * 2. get's the booking object using the booking id
     * 3. 
     */
    const cancelBookingButtons = document.querySelectorAll(".cancelBookingBtn");
    cancelBookingButtons.forEach(button => {
        button.addEventListener("click", async (e) => {
            if (confirm("Are you sure you want to cancel this booking?")) {
                const bookingId = e.target.dataset.bookingId;
                try {
                    button.disabled = true;
                    const booking = await getBookingByBookingId(bookingId);

                    if (booking) {
                        await updateFlightObject(booking);
                        // Update UI without page reload
                        const bookingElement = button.closest('.row');
                        bookingElement.classList.add('opacity-75');
                        // Replace only the cancel button with CANCELLED text
                        button.replaceWith(Object.assign(document.createElement('p'), {
                            className: 'text-danger fw-bold m-0',
                            textContent: 'CANCELLED'
                        }));
                    } else {
                        throw new Error("Error getting booking!")
                    }

                } catch (error) {
                    alert(error.message)
                    button.disabled = false;
                }
            }
        });
    });
}

/**
 * create's and addes one way booking cards to the DOM
 * @param {*} booking 
 */
function createOneWayBooking(booking) {

    // Get's the changed status for the flight (When flights are edited by admin)
    let changed;
    const flightDetailsChangedStatus = booking.departureFlight.changed;

    if (flightDetailsChangedStatus === "No Changes") {
        changed = ""
    } else {
        changed = flightDetailsChangedStatus;
    }

    // Get's the current booking's travel class
    let travelClass;
    const seatType = booking.tickets[0].seatType;

    if (seatType === "economy") {
        travelClass = "Economy"
    } else {
        travelClass = "Business"
    }

    // Code Options for the booking's status (confimed or cancelled)
    const bookingArea = document.getElementById('sampleBookings');
    let actionButtons;
    if (booking.status === "cancelled") {
        actionButtons = `
            <div class="col-12 col-md-2 d-flex gap-2 justify-content-center align-items-center">
                <button class="btn btn-outline-primary ticketBtn" data-booking-id="${booking.bookingId}">Tickets</button>
                <p class="text-danger fw-bold m-0">CANCELLED</p>
            </div>`;
    } else {
        actionButtons = `
            <div class="col-12 col-md-2 d-flex gap-2 justify-content-center align-items-center">
                <button class="btn btn-outline-primary ticketBtn" data-booking-id="${booking.bookingId}">Tickets</button>
                <button class="btn btn-outline-danger cancelBookingBtn" data-booking-id="${booking.bookingId}">Cancel</button>
            </div>`;
    }

    // HTML code for one way bookings
    const newBooking = document.createElement("div");
    newBooking.className = `border border-subtle rounded p-2 m-2 row ${booking.status === "cancelled" ? "opacity-75" : ""}`
    newBooking.innerHTML = `
                <div class="col-12 col-md-10 d-flex flex-column gap-2">
                    <div class="row border border-subtle rounded m-0 py-2 align-items-center">
                        <div class="col-12 col-md-2 d-flex flex-md-column justify-content-center gap-2 align-items-center">
                            <p class="fw-bold">${booking.departureFlight.flightNo}</p>
                            <p class="fw-bold">${changed}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>${booking.departureFlight.airline}</p>
                        </div>
                        <div class="col-12 col-md-4 d-flex justify-content-evenly align-items-center">
                            <div class="align-items-center">
                                <p>${booking.departureFlight.departurePlace}</p>
                                <p>${booking.departureFlight.departureTime}</p>
                                <p>${booking.departureFlight.departureDate}</p>
                            </div>
                            <p>-</p>
                            <div class="align-items-center">
                                <p>${booking.departureFlight.arrivalPlace}</p>
                                <p>${booking.departureFlight.arrivalTime}</p>
                                <p>${booking.departureFlight.arrivalDate}</p>
                            </div>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>${booking.departureFlight.duration}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>${booking.departureFlight.planeName}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>${travelClass}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>Tickets: ${booking.tickets.length}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>₹${booking.bookingPrice}</p>
                        </div>
                    </div>
                </div>
                ${actionButtons}
    `
    bookingArea.appendChild(newBooking);
}

/**
 * Function for adding round trip bookings to the DOM
 * @param {*} booking 
 */
function createRoundTripBooking(booking) {
    // Handle departure flight status
    let departureChanged;
    if (booking.departureFlight.changed === "No Changes") {
        departureChanged = "";
    } else {
        departureChanged = booking.departureFlight.changed;
    }

    // Handle return flight status
    let returnChanged;
    if (booking.returnFlight.changed === "No Changes") {
        returnChanged = "";
    } else {
        returnChanged = booking.returnFlight.changed;
    }

    // Handle travel class
    let travelClass;
    const seatType = booking.tickets[0].seatType;
    if (seatType === "economy") {
        travelClass = "Economy";
    } else {
        travelClass = "Business";
    }

    // Code options for the booking status (confirmed or cancelled)
    const bookingArea = document.getElementById('sampleBookings');
    let actionButtons;
    if (booking.status === "cancelled") {
        actionButtons = `
            <div class="col-12 col-md-2 d-flex gap-2 justify-content-center align-items-center">
                <button class="btn btn-outline-primary ticketBtn" data-booking-id="${booking.bookingId}">Tickets</button>
                <p class="text-danger fw-bold m-0">CANCELLED</p>
            </div>`;
    } else {
        actionButtons = `
            <div class="col-12 col-md-2 d-flex gap-2 justify-content-center align-items-center">
                <button class="btn btn-outline-primary ticketBtn" data-booking-id="${booking.bookingId}">Tickets</button>
                <button class="btn btn-outline-danger cancelBookingBtn" data-booking-id="${booking.bookingId}">Cancel</button>
            </div>`;
    }

    // HTML code for the round trip booking
    const newBooking = document.createElement("div");
    newBooking.className = `border border-subtle rounded p-2 m-2 row ${booking.status === "cancelled" ? "opacity-75" : ""}`
    newBooking.innerHTML = `
                <div class="col-12 col-md-10 d-flex flex-column gap-2">
                    <div class="row border border-subtle rounded m-0 py-2 align-items-center">
                        <div class="col-12 col-md-2 d-flex flex-md-column justify-content-center gap-2 align-items-center">
                            <p class="fw-bold">${booking.departureFlight.flightNo}</p>
                            <p class="fw-bold">${departureChanged}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>${booking.departureFlight.airline}</p>
                        </div>
                        <div class="col-12 col-md-4 d-flex justify-content-evenly align-items-center">
                            <div class="align-items-center">
                                <p>${booking.departureFlight.departurePlace}</p>
                                <p>${booking.departureFlight.departureTime}</p>
                                <p>${booking.departureFlight.departureDate}</p>
                            </div>
                            <p>-</p>
                            <div class="align-items-center">
                                <p>${booking.departureFlight.arrivalPlace}</p>
                                <p>${booking.departureFlight.arrivalTime}</p>
                                <p>${booking.departureFlight.arrivalDate}</p>
                            </div>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>${booking.departureFlight.duration}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>${booking.departureFlight.planeName}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>${travelClass}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>Tickets: ${booking.tickets.length}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>₹${booking.bookingPrice}</p>
                        </div>
                    </div>
                    <div class="row border border-subtle rounded m-0 py-2 align-items-center">
                        <div class="col-12 col-md-2 d-flex flex-md-column justify-content-center gap-2 align-items-center">
                            <p class="fw-bold">${booking.returnFlight.flightNo}</p>
                            <p class="fw-bold">${returnChanged}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>${booking.returnFlight.airline}</p>
                        </div>
                        <div class="col-12 col-md-4 d-flex justify-content-evenly align-items-center">
                            <div class="align-items-center">
                                <p>${booking.returnFlight.departurePlace}</p>
                                <p>${booking.returnFlight.departureTime}</p>
                                <p>${booking.returnFlight.departureDate}</p>
                            </div>
                            <p>-</p>
                            <div class="align-items-center">
                                <p>${booking.returnFlight.arrivalPlace}</p>
                                <p>${booking.returnFlight.arrivalTime}</p>
                                <p>${booking.returnFlight.arrivalDate}</p>
                            </div>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>${booking.returnFlight.duration}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>${booking.returnFlight.planeName}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>${travelClass}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>Tickets: ${booking.tickets.length}</p>
                        </div>
                        <div class="col-12 col-md-1">
                            <p>₹${booking.bookingPrice}</p>
                        </div>
                    </div>
                </div>
                ${actionButtons}
    `;
    bookingArea.appendChild(newBooking);
}

/**
 * Event Listeners
 */
document.addEventListener("DOMContentLoaded", loadBookings); // Loads bookings to DOM
document.addEventListener("DOMContentLoaded", protectCustomerPage); // Route Protection