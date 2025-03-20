/**
 * Adds a ticket to DB
 * @param {*} user
 * @param {*} departureFlight 
 * @param {*} returnFlight 
 * @param {*} nameOfFlyer 
 * @param {*} ageOfFlyer 
 * @param {*} emailOfFlyer 
 * @param {*} tripType 
 * @param {*} seatType 
 * @param {*} ticketPrice 
 * @returns ticket (resolve) / error (reject)
 */
const addTicketToDB = async (user, departureFlight, returnFlight, nameOfFlyer, emailOfFlyer, ageOfFlyer, tripType, seatType, ticketPrice) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const ticket = {
            ticketId: crypto.randomUUID(),
            user,
            departureFlight,
            returnFlight,
            nameOfFlyer,
            emailOfFlyer,
            ageOfFlyer,
            tripType,
            seatType,
            ticketPrice
        };
        const transaction = db.transaction("tickets", "readwrite");
        const store = transaction.objectStore("tickets");
        const request = store.add(ticket);
        request.onsuccess = () => resolve(ticket);
        request.onerror = () => reject(request.error);
    })
}

/**
 * Gets all tickets from the DB by userId
 * @param {*} userId
 * @returns array of ticket objects (resolve) / error (reject)
 */
const getTicketsByUserId = async (userId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("tickets", "readonly");
        const store = transaction.objectStore("tickets");
        const request = store.getAll();
        
        request.onsuccess = () => {
            // Filter tickets where user.userId matches
            const tickets = request.result.filter(ticket => ticket.user.userId === userId);
            resolve(tickets);
        };
        request.onerror = () => reject(request.error);
    });
};

/**
 * Gets all tickets for a specific departure flight
 * @param {string} flightId 
 * @returns array of ticket objects (resolve) / error (reject)
 */
const getTicketsByDepartureFlightId = async (flightId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("tickets", "readonly");
        const store = transaction.objectStore("tickets");
        const index = store.index("departureFlightId");
        const request = index.getAll(flightId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Gets all tickets for a specific return flight
 * @param {string} flightId 
 * @returns array of ticket objects (resolve) / error (reject)
 */
const getTicketsByReturnFlightId = async (flightId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("tickets", "readonly");
        const store = transaction.objectStore("tickets");
        const index = store.index("returnFlightId");
        const request = index.getAll(flightId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Updates ticket using ticketId (unique key)
 * @param {*} ticketId 
 * @param {*} updates 
 * @returns ticket (resolve) / error (reject)
 */
const updateTicket = async (ticketId, updates) => {
    const db = await openDB();
    return new Promise(async (resolve, reject) => {
        const transaction = db.transaction("tickets", "readwrite");
        const store = transaction.objectStore("tickets");
        const request = store.get(ticketId);
        request.onsuccess = () => {
            const ticket = request.result;
            if (!ticket) {
                return reject("Ticket not found");
            }
            Object.assign(ticket, updates);
            const updateRequest = store.put(ticket);
            updateRequest.onsuccess = () => resolve(ticket);
            updateRequest.onerror = () => reject(updateRequest.error);
        };
        request.onerror = () => reject(request.error);
    });
};