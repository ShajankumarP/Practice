document.addEventListener('DOMContentLoaded', function () {
    var registrationForm = document.getElementById('registrationForm');
    var loginForm = document.getElementById('loginForm');
    var switchToLogin = document.getElementById('switchToLogin');
    var switchToRegister = document.getElementById('switchToRegister');
    var errorMessage = document.getElementById('errorMessage');

    // Function to switch between registration and login forms
    switchToLogin?.addEventListener('click', function (e) {
        e.preventDefault();
        if (registrationForm && loginForm && errorMessage) {
            registrationForm.style.display = 'none';
            loginForm.style.display = 'block';
            errorMessage.textContent = '';
        }
    });

    switchToRegister?.addEventListener('click', function (e) {
        e.preventDefault();
        if (loginForm && registrationForm && errorMessage) {
            loginForm.style.display = 'none';
            registrationForm.style.display = 'block';
            errorMessage.textContent = '';
        }
    });

    // Handle registration form submission
registrationForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('name')?.value;
    var email = document.getElementById('email')?.value;
    var phone = document.getElementById('phone')?.value;
    var password = document.getElementById('password')?.value;
    var confirmPassword = document.getElementById('confirm-Password')?.value;

    if (!name || !email || !phone || !password || !confirmPassword) return;

    // Check if password and confirm password match
    if (password !== confirmPassword) {
        if (errorMessage) {
            errorMessage.textContent = "Passwords do not match. Please try again.";
        }
        return;
    }

    // Get deactivated emails from local storage
    var deactivatedEmails = JSON.parse(localStorage.getItem('deactivatedEmails') || '[]');

    // Check if the email is in the deactivated list
    if (deactivatedEmails.includes(email)) {
        if (errorMessage) {
            errorMessage.textContent = "This email is deactivated and cannot be used for registration.";
        }
        return;
    }

    // Check if email already exists in users or admins
    var users = JSON.parse(localStorage.getItem('users') || '[]');
    var admins = JSON.parse(localStorage.getItem('admins') || '[]');
    if (users.some(user => user.email === email) || admins.some(admin => admin.email === email)) {
        if (errorMessage) {
            errorMessage.textContent = "Email already registered. Please use a different email.";
        }
        return;
    }

    // Store user data in local storage (for regular users)
    users.push({ name, email, phone, password, role: "User" });
    localStorage.setItem('users', JSON.stringify(users));

    if (errorMessage) {
        errorMessage.textContent = "Registration successful! Please log in.";
        errorMessage.style.color = "green";
    }
    switchToLogin?.click(); // Switch to login form
});

    // Handle login form submission
    loginForm?.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = document.getElementById('loginEmail')?.value;
        var password = document.getElementById('loginPassword')?.value;

        if (!email || !password) return;

        // Check credentials against stored users and admins
        var users = JSON.parse(localStorage.getItem('users') || '[]');
        var admins = JSON.parse(localStorage.getItem('admins') || '[]');

        var user = users.find(u => u.email === email && (u.password === password || atob(u.password) === password)); // Check users
        var admin = admins.find(a => a.email === email && (a.password === password || atob(a.password) === password)); // Check admins

        if (user) {
            // Destructure user and omit password
            const { password, ...userInfo } = user;

            // Store logged-in user info (except password)
            localStorage.setItem('currentUser', JSON.stringify(userInfo));
            sessionStorage.setItem('currentUser', JSON.stringify(userInfo));

            // Store the user's name in local storage
            localStorage.setItem('userName', user.name);

            if (errorMessage) {
                errorMessage.textContent = "Login successful! Redirecting...";
                errorMessage.style.color = "green";
            }

            // Redirect user
            setTimeout(function () {
                window.location.href ="/Project/appointment/appointment.html"; 
            }, 2000);

        } else if (admin) {
            // Destructure admin and omit password
            const { password, ...adminInfo } = admin;

            // Store logged-in admin info (except password)
            localStorage.setItem('currentAdmin', JSON.stringify(adminInfo));
            sessionStorage.setItem('currentAdmin', JSON.stringify(adminInfo));

            if (errorMessage) {
                errorMessage.textContent = "Login successful! Redirecting...";
                errorMessage.style.color = "green";
            }

            // Redirect admin
            setTimeout(function () {
                window.location.href = "/Project/admin/admin.html";
            }, 2000);
        } else {
            if (errorMessage) {
                errorMessage.textContent = "Invalid email or password.";
            }
        }
    });

    // Set login as the default form visible
    if (loginForm && registrationForm) {
        loginForm.style.display = 'block';
        registrationForm.style.display = 'none';
    }
});
