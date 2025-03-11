function logout() {
    localStorage.clear();
    window.location.href = '/homepage/index.html';
}

document.addEventListener("DOMContentLoaded", adminDashboardCheck);