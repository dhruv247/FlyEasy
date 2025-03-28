/**
 * load tickets when dom is loaded
 * @description
 * 1. Gets the booking id from local storage
 * 2. uses that to get the booking object from indexedDB
 * 3. adds tickets to DOM using the booking's tickets property
 */
async function loadTickets() {
    const bookingId = getBookingId();
    const booking = await getBookingByBookingId(bookingId);
    addTicketsToDOM(booking);
}

/**
 * Adds tickets to DOM
 * @param {*} booking 
 * @description
 * 1. Uses a booking object as parameter
 * 2. Uses the object's tickets property to create ticket cards on the DOM
 */
function addTicketsToDOM(booking) {
    const ticketsDisplayArea = document.getElementById("ticketsDisplay");

    const tickets = booking.tickets;

    for (let ticket of tickets) {
        const newTicket = document.createElement("div")
        newTicket.className = "row";
        newTicket.innerHTML = `
                <div class="col-1 col-md-3"></div>
                <div class="col-10 col-md-6 d-flex flex-column flex-md-row justify-content-evenly border border-subtle rounded m-0 mb-3 py-3 align-items-center">
                    <p>${ticket.nameOfFlyer}</p>
                    <p>${ticket.emailOfFlyer}</p>
                    <p>${ticket.ageOfFlyer}</p>
                </div>
                <div class="col-1 col-md-3"></div>
        `
        ticketsDisplayArea.appendChild(newTicket);
    }
}

/**
 * Event Listeners
 */
document.addEventListener("DOMContentLoaded", loadTickets) // Loads tickets to when dom is loaded
document.addEventListener("DOMContentLoaded", protectCustomerPage) // Route Protection