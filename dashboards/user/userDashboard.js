/**
 * Logout function
 * @description
 * 1. clears local storage
 * 2. redirects to homepage
 */
function logout() {
    clearLocalStorage();
    window.location.href = '/homepage/index.html';
}

/**
 * Event listeners
 */
document.addEventListener("DOMContentLoaded", protectCustomerPage); // Route protection