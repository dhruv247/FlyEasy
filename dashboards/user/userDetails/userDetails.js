/**
 * loads user details to change user details form
 * @description
 * 1. gets user id from local storage
 * 2. uses user id to get the user object from indexedDB
 */
async function loadUserDetails() {
    try {
        const userId = getUserId();
        const user = await getUserByUserId(userId);
        document.getElementById("emailInput").value = user.email;
        document.getElementById("usernameInput").value = user.username;
    } catch (error) {
        alert(error.message);
    }
}

/**
 * Validates email format
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates username requirements
 * @param {string} username 
 * @returns {boolean}
 */
function isValidUsername(username) {
    // Username should be 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

/**
 * Validates password strength
 * @param {string} password 
 * @returns {boolean}
 */
function isValidPassword(password) {
    // At least 8 characters, 1 Uppercase, 1 lowercase, 1 Nmber, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

/**
 * This function is used to validate all login details
 * @param {*} event - form submission event
 */
async function validateInputs(email, username, oldPassword, newPassword, confirmPassword) {
    // Email validation
    if (!isValidEmail(email)) {
        throw new Error("Please enter a valid email address");
    }

    // Username validation
    if (!isValidUsername(username)) {
        throw new Error("Username must be 3-20 characters long and can only contain letters, numbers, and underscores");
    }

    // Password validation (if changing password)
    if (oldPassword) {
        if (!isValidPassword(newPassword)) {
            throw new Error("New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character");
        }
        if (newPassword !== confirmPassword) {
            throw new Error("Passwords don't match");
        }
    }
}

/**
 * Updates user property in tickets and bookings
 * @param {*} userId 
 * @param {*} userProperty 
 */
async function updateUserReferences(userId, userProperty) {
    try {
        if (!userProperty) {
            throw new Error("Error getting the updated user!");
        }

        const updates = {
            user: {
                userId: userProperty.userId,
                username: userProperty.username,
                email: userProperty.email
            }
        };

        const userTickets = await getTicketsByUserId(userId);
        const userBookings = await getBookingsByUserId(userId);

        // Update tickets
        for (const ticket of userTickets) {
            try {
                await updateTicket(ticket.ticketId, updates);
            } catch (err) {
                console.error(`Failed to update ticket ${ticket.ticketId}:`, err);
            }
        }

        // Update bookings
        for (const booking of userBookings) {
            try {
                await updateBooking(booking.bookingId, updates);
            } catch (err) {
                console.error(`Failed to update booking ${booking.bookingId}:`, err);
            }
        }
    } catch (error) {
        console.error("Error updating user references:", error);
        throw error;
    }
}

/**
 * change the details for user
 * @param {*} event 
 * @description
 * Uses the validInput function validate all fields
 * Then updates the tickets and bookings for the user (change user property in them)
 */
async function changeUserDetails(event) {
    try {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        // 1. gets the form data
        const email = formData.get("emailInput").trim();
        const username = formData.get("usernameInput").trim();
        const oldPassword = formData.get("oldPasswordInput");
        const newPassword = formData.get("newPasswordInput");
        const confirmPassword = formData.get("confirmPasswordInput");

        // 2. Gets user
        const userId = getUserId();
        const user = await getUserByUserId(userId);

        // Validate inputs
        await validateInputs(email, username, oldPassword, newPassword, confirmPassword);

        // Prepare updates object
        const updates = { email, username };
        
        // Checks old password
        if (oldPassword) {
            if (hashPassword(oldPassword) !== user.password) {
                throw new Error("Incorrect current password");
            }
            if (oldPassword === newPassword) {
                throw new Error("New password must be different from current password");
            }
            updates.password = hashPassword(newPassword);
        }

        // Update user
        const updatedUserDetails = await updateUser(userId, updates);
        
        if (!updatedUserDetails) {
            throw new Error("Failed to update user details");
        }

        // Update bookings and tickets
        await updateUserReferences(userId, updatedUserDetails);

        alert("Details changed successfully!");
        window.location.href = '../userDashboard.html';
    } catch (error) {
        alert(error.message);
    }
}

/**
 * Event listeners
 */
document.addEventListener("DOMContentLoaded", loadUserDetails); // Load's current user's details into form 
document.addEventListener("DOMContentLoaded", protectCustomerPage); // Route protection