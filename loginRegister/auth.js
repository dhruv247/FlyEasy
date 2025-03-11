/**
 * checks if a user is logged in (using local storage)
 * @returns true/false
 */
function isLoggedIn() {
    return localStorage.getItem("loginStatus") == "true";
}

/**
 * redirects users to index.html if access is denied
 */
function protectPage() {
    if (!isLoggedIn()) {
        // alert("Page not accessible without logging in!")
        window.location.href = "/homepage/index.html";
    }
}

/**
 * redirects non-customers to index.html if access is denied
 */
function protectCustomerPage() {
    if (isLoggedIn() && (localStorage.getItem("userType") !== "customer")) {
        // alert("Page not accessible without logging in!")
        window.location.href = "/homepage/index.html";
    }
}

/**
 * prevents logged in users from trying to login again
 */
function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = "/homepage/index.html";
    }
}

/**
 * Function to check if user is admin or customer
 */
function adminDashboardCheck() {
    let userType = localStorage.getItem("userType");
    if (userType !== "admin") {
        window.location.href = '/homepage/index.html'
    }
}

/**
 * basic hashing function
 * @param {*} password 
 * @returns hashed password
 * @description
 * 1. uses unicode description
 * 2. performs basic arithmetic on unicode equivalent
 */
function hashPassword(password) {
    let hash = 0;
    if (password.length === 0) return hash;
    
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}