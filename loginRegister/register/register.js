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
    const adminRegisterCodeInput = formData.get("adminRegisterCode") // Entered by the user
    const adminRegisterCode = 'iAmAdmin' // Stored code for creating admins
    try {
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
        }
        const existingEmail = await getUserByEmail(email);
        if (existingEmail) {
            throw new Error("Email already in use");
        }
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