// Variables to control name of DB and version control for db updates
const DB_NAME = "Fly Easy";
const DB_VERSION = 1;
/**
 * This function handles indexedDB initialization
 * @description
 * 1. This function opens the DB
 * 2. Handles the DB version, creation (success/failure)
 * 3. Creates object stores
 * 4. Creates indices for the object stores
 * 5. Uses promises for async operations with indexedDB
 * @returns a promise that resolves and return an indexedDB object
 */
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Creates a flights store if it doesn't exist
            if (!db.objectStoreNames.contains("flights")) {
                const flightStore = db.createObjectStore("flights", { keyPath: "flightId" });
                flightStore.createIndex("flightNo", "flightNo", { unique: true });
            }
            // Create users store if it doesn't exist
            if (!db.objectStoreNames.contains("users")) {
                const userStore = db.createObjectStore("users", { keyPath: "userId" });
                // Create indexes for quick lookups
                userStore.createIndex("email", "email", { unique: true });
                userStore.createIndex("username", "username", { unique: true });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};