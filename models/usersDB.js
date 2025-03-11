/**
 * Adds a user to DB
 * @param {*} username 
 * @param {*} email 
 * @param {*} password 
 * @param {*} userType 
 * @returns 
 */
const addUserToDB = async (username, email, password, userType) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const user = {
            userId: crypto.randomUUID(),
            username,
            email,
            password,
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0],
            userType
        };
        const transaction = db.transaction("users", "readwrite");
        const store = transaction.objectStore("users");
        const request = store.add(user);
        request.onsuccess = () => resolve(user);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Gets all users from DB
 * @returns
 */
const getAllUsers = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("users", "readonly");
        const store = transaction.objectStore("users");
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Gets a user by email (custom index)
 * @param {*} email 
 * @returns 
 */
const getUserByEmail = async (email) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("users", "readonly");
        const store = transaction.objectStore("users");
        const index = store.index("email");
        const request = index.get(email);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Gets a user by userId
 * @param {*} userId 
 * @returns 
 */
const getUserByUserId = async (userId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("users", "readonly");
        const store = transaction.objectStore("users");
        const request = store.get(userId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * gets a user by username
 * @param {*} username 
 * @description This function is needed when registering users to prevent duplicate users
 * @returns 
 */
const getUserByUsername = async (username) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("users", "readonly");
        const store = transaction.objectStore("users");
        const index = store.index("username");
        const request = index.get(username);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Update user details
 * @param {*} userId 
 * @param {*} updates 
 * @returns 
 */
const updateUser = async (userId, updates) => {
    const db = await openDB();
    return new Promise(async (resolve, reject) => {
        const transaction = db.transaction("users", "readwrite");
        const store = transaction.objectStore("users");
        const request = store.get(userId);

        request.onsuccess = () => {
            const user = request.result;
            if (!user) return reject("User not found");

            // Update only provided fields
            Object.assign(user, updates, { updatedAt: new Date().toISOString().split("T")[0] });

            const updateRequest = store.put(user);
            updateRequest.onsuccess = () => resolve(user);
            updateRequest.onerror = () => reject(updateRequest.error);
        };

        request.onerror = () => reject(request.error);
    });
};

/**
 * Deletes user by userID (another function needed to delete by email)
 * @param {*} userId 
 * @returns 
 */
const deleteUser = async (userId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("users", "readwrite");
        const store = transaction.objectStore("users");
        const request = store.delete(userId);

        request.onsuccess = () => resolve(`User ${userId} deleted`);
        request.onerror = () => reject(request.error);
    });
};