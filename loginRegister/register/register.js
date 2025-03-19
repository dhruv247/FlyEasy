/**
 * This function registers a new user
 * @param {*} event - form submission event
 * @description
 * 1. Checks if passwords match (confirm password)
 * 2. Checks if a duplicate email exists in the db
 * 3. Hashes the password before storing a new user in the db
 * 4. Redirects to login page after registering successfully
 */
async function saveRegistrationData(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const username = formData.get("usernameInput");
    const email = formData.get("emailInput");
    const password = formData.get("passwordInput");
    const confirmPassword = formData.get("confirmPasswordInput");
    const adminRegisterCodeInput = formData.get("adminRegisterCode");
    const adminRegisterCode = 'iAmAdmin';

    try {
        // Email validation
        if (!isValidEmail(email)) {
            throw new Error("Please enter a valid email address");
        }

        // Username validation
        if (!isValidUsername(username)) {
            throw new Error("Username must be 3-20 characters long and can only contain letters, numbers, and underscores");
        }

        // Password validation
        if (!isValidPassword(password)) {
            throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character");
        }

        // Password match validation
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
        }

        // Check for existing email
        const existingEmail = await getUserByEmail(email);
        if (existingEmail) {
            throw new Error("Email already in use");
        }

        // Check for existing username
        const existingUsername = await getUserByUsername(username);
        if (existingUsername) {
            throw new Error("Username already taken");
        }

        const hashedPassword = hashPassword(password);
        if (adminRegisterCodeInput === adminRegisterCode) {
            const newUser = await addUserToDB(
                username,
                email,
                hashedPassword,
                "admin"
            );
        } else {
            const newUser = await addUserToDB(
                username,
                email,
                hashedPassword,
                "customer"
            );
        }
        alert("Registration successful! Please login now.");
        window.location.href = "../login/login.html";
    } catch (error) {
        alert(error.message);
    }
}

/**
 * Event listener for loading page
 * Uses a function from auth.js to prevent users from visiting register page if they are logged in
 */
document.addEventListener("DOMContentLoaded", redirectIfLoggedIn);

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
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}