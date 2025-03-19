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