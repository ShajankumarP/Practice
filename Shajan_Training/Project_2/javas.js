    document.addEventListener('DOMContentLoaded', function() {
            const registrationForm = document.getElementById('registrationForm');
            const loginForm = document.getElementById('loginForm');
            const switchToLogin = document.getElementById('switchToLogin');
            const switchToRegister = document.getElementById('switchToRegister');
            const errorMessage = document.getElementById('errorMessage');

            // Switch between registration and login forms
            switchToLogin.addEventListener('click', function(e) {
                e.preventDefault();
                registrationForm.style.display = 'none';
                loginForm.style.display = 'block';
                errorMessage.textContent = '';
            });

            switchToRegister.addEventListener('click', function(e) {
                e.preventDefault();
                loginForm.style.display = 'none';
                registrationForm.style.display = 'block';
                errorMessage.textContent = '';
            });

            // Handle registration form submission
            registrationForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const phone = document.getElementById('phone').value;
                const password = document.getElementById('password').value;

                // Check if email already exists
                const users = JSON.parse(localStorage.getItem('users')) || [];
                if (users.some(user => user.email === email)) {
                    errorMessage.textContent = "Email already registered. Please use a different email.";
                    return;
                }

                // Store user data in local storage
                users.push({ name, email, phone, password });
                localStorage.setItem('users', JSON.stringify(users));

                errorMessage.textContent = "Registration successful! Please log in.";
                errorMessage.style.color = "green";
                switchToLogin.click(); // Switch to login form
            });

            // Handle login form submission
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;

                // Check credentials against stored users
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    // Store logged in user info (except password)
                    const { password, ...userInfo } = user;
                    localStorage.setItem('currentUser', JSON.stringify(userInfo));
                    errorMessage.textContent = "Login successful! Redirecting to Booking Page...";
                    errorMessage.style.color = "green";
                    window.location.href = 'appointment.html';
                } else {
                    errorMessage.textContent = "Invalid email or password.";
                }
            });
        });