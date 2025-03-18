/**
 * Adds a booking to DB
 * @param {*} userId 
 * @param {*} tickets 
 * @param {*} tripType 
 * @param {*} bookingPrice 
 * @param {*} status 
 * @returns booking (resolve) / error (reject)
 */
const addBookingToDB = async (userId, departureFlightId, returnFlightId, tickets, tripType, bookingPrice, status) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const booking = {
            bookingId: crypto.randomUUID(),
            user: userId,
            departureFlight: departureFlightId,
            returnFlight: returnFlightId,
            tickets,
            tripType,
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0],
            bookingPrice,
            status
        };
        const transaction = db.transaction("bookings", "readwrite");
        const store = transaction.objectStore("bookings");
        const request = store.add(booking);
        request.onsuccess = () => resolve(booking);
        request.onerror = () => reject(request.error);
    })
}

/**
 * gets all the bookings from the DB
 * @returns booking (resolve) / error (reject)
 */
const getAllBookings = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("bookings", "readonly");
        const store = transaction.objectStore("bookings");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * gets all bookings from the DB by userId
 * @param {*} userId
 * @returns array of bookings (resolve) / error (reject)
 */
const getBookingsByUserId = async (userId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("bookings", "readonly");
        const store = transaction.objectStore("bookings");
        // Use the user index (matching the field name in addBookingToDB)
        const index = store.index("userId");
        // Get all bookings matching the userId
        const request = index.getAll(userId);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};