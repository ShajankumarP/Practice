document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm') as HTMLFormElement;
    const loginForm = document.getElementById('loginForm') as HTMLFormElement;
    const switchToLogin = document.getElementById('switchToLogin') as HTMLAnchorElement;
    const switchToRegister = document.getElementById('switchToRegister') as HTMLAnchorElement;
    const errorMessage = document.getElementById('errorMessage') as HTMLParagraphElement;

    interface User {
        name: string;
        email: string;
        phone: string;
        password: string;
    }

    // Function to switch between registration and login forms
    switchToLogin.addEventListener('click', (e: Event) => {
        e.preventDefault();
        registrationForm.style.display = 'none';
        loginForm.style.display = 'block';
        errorMessage.textContent = '';
    });

    switchToRegister.addEventListener('click', (e: Event) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registrationForm.style.display = 'block';
        errorMessage.textContent = '';
    });

    // Handle registration form submission
    registrationForm.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const phone = (document.getElementById('phone') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        const confirmPassword = (document.getElementById('confirm-Password') as HTMLInputElement).value;

        // Check if password and confirm password match
        if (password !== confirmPassword) {
            errorMessage.textContent = "Passwords do not match. Please try again.";
            return;
        }

        // Check if email already exists
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
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
    loginForm.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
        const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
        console.log(email);
        console.log(password);

        // Check credentials against stored users
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        console.log(users);
        const user = users.find(u => u.email === email && u.password === password);
        console.log(user);

        if (user) {
            // Store logged-in user info (except password)
            const { password, ...userInfo } = user;
            console.log(user);
            console.log(userInfo);
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
        } else {
            errorMessage.textContent = "Invalid email or password.";
        }
    });

    function loginUser(email: string, password: string): void {
        let users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

        // Find the user by email
        const loggedInUser = users.find(user => user.email === email);

        if (loggedInUser && loggedInUser.password === password) {
            // Store the user data in 'currentUser' to track session
            localStorage.setItem('currentUser', JSON.stringify(loggedInUser));

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid email or password');
        }
    }
});
