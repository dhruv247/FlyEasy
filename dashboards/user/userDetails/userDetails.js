async function loadUserDetails() {
    
    try {
        let userId = localStorage.getItem("userId");
        let user = await getUserByUserId(userId);
        document.getElementById("emailInput").value = user.email;
        document.getElementById("usernameInput").value = user.username;
    } catch (error) {
        alert(error.message);
    }
}

/**
 * This function is used by user to change login details
 * @param {*} event - form submission event
 * @description
 * The password change mechanism has the following steps:
 * 1. Checks if entered password is same as stored password
 * 2. Checks that the new password is different from the old password
 * 3. Checks that the new password is same as confirmation password
 * 4. Checks that the password fields are not empty
 */
async function changeUserDetails(event) {
    try {
        let userId = localStorage.getItem("userId");
        let user = await getUserByUserId(userId);
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        let email = formData.get("emailInput");
        let username = formData.get("usernameInput");

        let oldPassword = formData.get("oldPasswordInput");
        let newPasswordInput = formData.get("newPasswordInput");
        let confirmPasswordInput = formData.get("confirmPasswordInput");

        if (oldPassword) {
            if (hashPassword(oldPassword) === user.password) {
                if (oldPassword !== newPasswordInput) {
                    if (newPasswordInput === confirmPasswordInput) {
                        if (newPasswordInput.trim() !== "") {
                            let updatedUserDetails = await updateUser(userId, { email: email, username: username, password: hashPassword(newPasswordInput)})
                            if (updatedUserDetails) {
                                alert("Details changed successfully!");
                                window.location.href = '../userDashboard.html'
                            } else {
                                throw new Error("Details not changed! Please try again.")
                            }
                        } else {
                            throw new Error(" New Password cannot be empty")
                        }
                    } else {
                        throw new Error("New Passwords don't match")
                    }
                } else {
                    throw new Error("New Password cannot be same as old password")
                }
            } else {
                throw new Error("Incorrect Password!")
            }
        } else {
            let updatedUserDetails = await updateUser(userId, { email: email, username: username })
        
            if (updatedUserDetails) {
                alert("Details changed successfully!");
                window.location.href = '../userDashboard.html'
            } else {
                throw new Error("Details not changed! Please try again.")
            }
        }

    } catch (error) {
        alert(error.message)
    }
}

document.addEventListener("DOMContentLoaded", loadUserDetails);
document.addEventListener("DOMContentLoaded", protectPage);
document.addEventListener("DOMContentLoaded", protectCustomerPage);