/**
 * Adds a booking to DB
 * @param {*} userId 
 * @param {*} tickets 
 * @param {*} tripType 
 * @param {*} bookingPrice 
 * @param {*} status 
 * @returns booking (resolve) / error (reject)
 */
const addBookingToDB = async (user, departureFlight, returnFlight, tickets, tripType, bookingPrice, status) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const booking = {
            bookingId: crypto.randomUUID(),
            user,
            departureFlight,
            returnFlight,
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
 * @returns booking objects array (resolve) / error (reject)
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
 * @returns array of booking objects (resolve) / error (reject)
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

/**
 * Gets a single booking from the DB by bookingId
 * @param {string} bookingId
 * @returns {Promise} array of booking objects (resolve) / error (reject)
 */
const getBookingByBookingId = async (bookingId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("bookings", "readonly");
        const store = transaction.objectStore("bookings");
        const request = store.get(bookingId);
        
        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result);
            } else {
                reject(new Error("Booking not found"));
            }
        };
        request.onerror = () => reject(request.error);
    });
};

/**
 * Updates booking using bookingId (unique key)
 * @param {*} bookingId 
 * @param {*} updates 
 * @returns booking (resolve) / error (reject)
 */
const updateBooking = async (bookingId, updates) => {
    const db = await openDB();
    return new Promise(async (resolve, reject) => {
        const transaction = db.transaction("bookings", "readwrite");
        const store = transaction.objectStore("bookings");
        const request = store.get(bookingId);
        request.onsuccess = () => {
            const booking = request.result;
            if (!booking) return reject("Booking not found");
            Object.assign(booking, updates, { updatedAt: new Date().toISOString().split("T")[0] });
            const updateRequest = store.put(booking);
            updateRequest.onsuccess = () => resolve(booking);
            updateRequest.onerror = () => reject(updateRequest.error);
        };
        request.onerror = () => reject(request.error);
    });
};