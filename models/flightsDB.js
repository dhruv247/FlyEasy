/**
 * Adds a flight to DB
 * @param {A} flightNo 
 * @param {*} planeName 
 * @param {*} airline 
 * @param {*} departurePlace 
 * @param {*} departureDate 
 * @param {*} departureTime 
 * @param {*} arrivalPlace 
 * @param {*} arrivalDate 
 * @param {*} arrivalTime
 * @param {*} duration
 * @param {*} economyCapacity 
 * @param {*} economyBookedCount 
 * @param {*} businessCapacity 
 * @param {*} businessBookedCount 
 * @param {*} economyBasePrice 
 * @param {*} businessBasePrice 
 * @param {*} economyCurrentPrice 
 * @param {*} businessCurrentPrice
 * @param {*} changed
 * @returns flight (resolve) / error (reject)
 */
const addFlightToDB = async (flightNo, planeName, airline, departurePlace, departureDate, departureTime, arrivalPlace, arrivalDate, arrivalTime, duration, economyCapacity, economyBookedCount, businessCapacity, businessBookedCount, economyBasePrice, businessBasePrice, economyCurrentPrice, businessCurrentPrice, changed) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const flight = {
            flightId: crypto.randomUUID(),
            flightNo,
            planeName,
            airline,
            departurePlace,
            departureDate,
            departureTime,
            arrivalPlace,
            arrivalDate,
            arrivalTime,
            duration,
            economyCapacity,
            economyBookedCount,
            businessCapacity,
            businessBookedCount,
            economyBasePrice,
            businessBasePrice,
            economyCurrentPrice,
            businessCurrentPrice,
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0],
            changed
        };
        const transaction = db.transaction("flights", "readwrite");
        const store = transaction.objectStore("flights");
        const request = store.add(flight);
        request.onsuccess = () => resolve(flight);
        request.onerror = () => reject(request.error);
    });
};

/**
 * gets all the flights from the DB
 * @returns flights (resolve) / error (reject)
 */
const getAllFlights = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("flights", "readonly");
        const store = transaction.objectStore("flights");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * gets flight from the DB by flight number
 * @param {*} flightNo 
 * @returns flight (resolve) / error (reject)
 */
const getFlightsByFlightNo = async (flightNo) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("flights", "readonly");
        const store = transaction.objectStore("flights");
        const index = store.index("flightNo");
        const request = index.get(flightNo);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * gets flight from the DB by flightId
 * @param {*} flightId
 * @returns flight (resolve) / error (reject)
 */
const getFlightsByFlightId = async (flightId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("flights", "readonly");
        const store = transaction.objectStore("flights");
        const request = store.get(flightId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * updates flight using flightid (unique key)
 * @param {*} flightId 
 * @param {*} updates 
 * @returns flight (resolve) / error (reject)
 */
const updateFlight = async (flightId, updates) => {
    const db = await openDB();
    return new Promise(async (resolve, reject) => {
        const transaction = db.transaction("flights", "readwrite");
        const store = transaction.objectStore("flights");
        const request = store.get(flightId);
        request.onsuccess = () => {
            const flight = request.result;
            if (!flight) {
                return reject("Flight not found");
            }
            Object.assign(flight, updates, { updatedAt: new Date().toISOString().split("T")[0] });
            const updateRequest = store.put(flight);
            updateRequest.onsuccess = () => resolve(flight);
            updateRequest.onerror = () => reject(updateRequest.error);
        };
        request.onerror = () => reject(request.error);
    });
};

/**
 * Deletes a flight using flightid
 * @param {*} flightId 
 * @returns flight (resolve) / error (reject)
 * @description
 * This function is now redundant as delete flights options has been removed
 * Only being kept for adding this feature in next iteration
 */
const deleteFlight = async (flightId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("flights", "readwrite");
        const store = transaction.objectStore("flights");
        const request = store.delete(flightId);
        request.onsuccess = () => resolve(`Flight ${flightId} deleted`);
        request.onerror = () => reject(request.error);
    });
};