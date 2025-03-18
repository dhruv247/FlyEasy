/**
 * redirects non-customer users to index.html if access is denied
 */
function protectCustomerPage() {
    const userType = getUserType();
    if (userType !== "customer") {
        window.location.href = "/homepage/index.html";
    }
}

/**
 * Function to check if user is admin
 */
function adminDashboardCheck() {
    const userType = getUserType();
    if (userType !== "admin") {
        window.location.href = '/homepage/index.html'
    }
}

/**
 * prevents logged in users from trying to login again
 */
function redirectIfLoggedIn() {
    if (localStorage.getItem("loginStatus") == "true") {
        window.location.href = "/homepage/index.html";
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