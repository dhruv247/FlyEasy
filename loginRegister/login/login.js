/**
 * Function to login an existing users
 * @param {*} event - Form submission event
 * @description
 * 1. checks if the user exists
 * 2. checks entered password is the same as password stored in db (hashed)
 * 3. Sets loginStatus and userId as "true" in localStorage for maintaining state
 * 4. Redirects to Home Page (Only Page accessible without logging in)
 */
async function login(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    let email = formData.get("emailInput");
    let password = formData.get("passwordInput");
    let hashedPassword = hashPassword(password);
    try {
        const user = await getUserByEmail(email);
        if (user) {
            if (user.password === hashedPassword) {
                localStorage.setItem("loginStatus", true);
                localStorage.setItem("userId", user.userId);
                localStorage.setItem("userType", user.userType);
                alert("Logged in successfully!")
                window.location.href = "../../homepage/index.html";
            } else {
                throw new Error("Incorrect password!");
            }
        } else {
            throw new Error("User does not exist! Please register.");
        }
    } catch (error) {
        alert(error.message);
    }
}

/**
 * Event listener for page loading, calls a function from auth.js to prevent users from accessing login page if already logged in
 */
document.addEventListener("DOMContentLoaded", redirectIfLoggedIn); 