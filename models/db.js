// Variables to control name of DB and version control for DB updates
const DbName = "FlyEasy";
const DbVersion = 1;

/**
 * This function handles indexedDB initialization
 * @description
 * 1. This function opens the DB
 * 2. Handles the DB version, creation (success/failure)
 * 3. Creates object stores
 * 4. Creates indices for the object stores
 * 5. Uses promises for async operations with indexedDB
 * @returns a promise that resolves to an indexedDB object on success
 */
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DbName, DbVersion);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // User Object Store
            if (!db.objectStoreNames.contains("users")) {
                const userStore = db.createObjectStore("users", { keyPath: "userId" });
                userStore.createIndex("email", "email", { unique: true });
                userStore.createIndex("username", "username", { unique: true });
            }

            // Flight Object Store
            if (!db.objectStoreNames.contains("flights")) {
                const flightStore = db.createObjectStore("flights", { keyPath: "flightId" });
                flightStore.createIndex("flightNo", "flightNo", { unique: true });
            }

            // Tickets Object Store
            if (!db.objectStoreNames.contains("tickets")) {
                const ticketStore = db.createObjectStore("tickets", { keyPath: "ticketId" });
                ticketStore.createIndex("userId", "user.userId", { unique: false });
                ticketStore.createIndex("departureFlightId", "departureFlight.flightId", { unique: false });
                ticketStore.createIndex("returnFlightId", "returnFlight.flightId", { unique: false });
            }

            // Bookings Object Store
            if (!db.objectStoreNames.contains("bookings")) {
                const bookingStore = db.createObjectStore("bookings", { keyPath: "bookingId" });
                bookingStore.createIndex("userId", "user.userId", { unique: false });
                bookingStore.createIndex("departureFlightId", "departureFlight.flightId", { unique: false });
                bookingStore.createIndex("returnFlightId", "returnFlight.flightId", { unique: false });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};