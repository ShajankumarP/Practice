document.addEventListener('DOMContentLoaded', function () {
    const registrationForm = document.getElementById('registrationForm');
    const loginForm = document.getElementById('loginForm');
    const switchToLogin = document.getElementById('switchToLogin');
    const switchToRegister = document.getElementById('switchToRegister');
    const errorMessage = document.getElementById('errorMessage');

    // Function to switch between registration and login forms
    switchToLogin.addEventListener('click', function (e) {
        e.preventDefault();
        registrationForm.style.display = 'none';
        loginForm.style.display = 'block';
        errorMessage.textContent = '';
    });

    switchToRegister.addEventListener('click', function (e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        registrationForm.style.display = 'block';
        errorMessage.textContent = '';
    });

    // Handle registration form submission
    registrationForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-Password').value;

        // Check if password and confirm password match
        if (password !== confirmPassword) {
            errorMessage.textContent = "Passwords do not match. Please try again.";
            return;
        }

        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(user => user.email === email)) {
            errorMessage.textContent = "Email already registered. Please use a different email.";
            return;
        }

        // Store user data in local storage (plain text password)
        users.push({ name, email, phone, password });
        localStorage.setItem('users', JSON.stringify(users));

        errorMessage.textContent = "Registration successful! Please log in.";
        errorMessage.style.color = "green";
        switchToLogin.click(); // Switch to login form
    });

    // Handle login form submission
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = String(document.getElementById('loginEmail').value);
        const password = String(document.getElementById('loginPassword').value);
        
        // Check credentials against stored users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email == email && u.password == password);

        if (user) {
            // Store logged-in user info (except password)
            const { password, ...userInfo } = user;
            localStorage.setItem('currentUser', JSON.stringify(userInfo));
            sessionStorage.setItem('currentUser', JSON.stringify(userInfo));
            
            // Store the user's name in local storage
            localStorage.setItem('userName', user.name);

            errorMessage.textContent = "Login successful! Redirecting to Booking Page...";
            errorMessage.style.color = "green";
            // Simulate a delay before redirecting (for demonstration purposes)
            setTimeout(() => {
                window.location.href = 'appointment.html';
            }, 2000);
        } 
        else {
            const loginEmail = document.getElementById('loginEmail').value;
            const loginPassword = document.getElementById('loginPassword').value;

            // Admin credentials
            const adminEmail = 'admin123@gmail.com';
            const adminPassword = '123';

            if (loginEmail === adminEmail && loginPassword === adminPassword) {
                // localStorage.setItem('adminId', 'admin');
                // localStorage.setItem('adminPassword', 'adminPassword');
                window.location.href = 'admin.html';
            }
            else{
                errorMessage.textContent = "Invalid email or password.";
            } 
            
        }
    });
    // loginForm.addEventListener('submit', (e) => {
    //     e.preventDefault();
    //     const loginEmail = document.getElementById('loginEmail').value;
    //     const loginPassword = document.getElementById('loginPassword').value;

    //     // Admin credentials
    //     const adminEmail = 'admin123@gmail.com';
    //     const adminPassword = '123';

    //     if (loginEmail === adminEmail && loginPassword === adminPassword) {
    //         // localStorage.setItem('adminId', 'admin');
    //         // localStorage.setItem('adminPassword', 'adminPassword');
    //         window.location.href = 'admin.html';
    //     } 
    //     else {
    //         //errorMessage.textContent = 'Invalid email or password.';
    //     }
    // });
    function loginUser(email, password) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find the user by email
        const loggedInUser = users.find(user => user.email === email);
    
        if (loggedInUser && loggedInUser.password === password) {
            // Store the user data in 'currentUser' to track session
            localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid email or password');
        }
    }
    
});
