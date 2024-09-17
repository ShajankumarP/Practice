document.addEventListener('DOMContentLoaded', function () {
    const registrationForm: HTMLElement | null = document.getElementById('registrationForm');
    const loginForm: HTMLElement | null = document.getElementById('loginForm');
    const switchToLogin: HTMLElement | null = document.getElementById('switchToLogin');
    const switchToRegister: HTMLElement | null = document.getElementById('switchToRegister');
    const errorMessage: HTMLElement | null = document.getElementById('errorMessage');

    switchToLogin?.addEventListener('click', function (e: MouseEvent) {
        e.preventDefault();
        if (registrationForm && loginForm && errorMessage) {
            registrationForm.style.display = 'none';
            loginForm.style.display = 'block';
            errorMessage.textContent = '';
        }
    });

    switchToRegister?.addEventListener('click', function (e: MouseEvent) {
        e.preventDefault();
        if (loginForm && registrationForm && errorMessage) {
            loginForm.style.display = 'none';
            registrationForm.style.display = 'block';
            errorMessage.textContent = '';
        }
    });

    registrationForm?.addEventListener('submit', function (e: Event) {
        e.preventDefault();
        const name: string | undefined = (document.getElementById('name') as HTMLInputElement)?.value;
        const email: string | undefined = (document.getElementById('email') as HTMLInputElement)?.value;
        const phone: string | undefined = (document.getElementById('phone') as HTMLInputElement)?.value;
        const password: string | undefined = (document.getElementById('password') as HTMLInputElement)?.value;
        const confirmPassword: string | undefined = (document.getElementById('confirm-Password') as HTMLInputElement)?.value;

        if (!name || !email || !phone || !password || !confirmPassword) return;

        if (password !== confirmPassword) {
            if (errorMessage) {
                errorMessage.textContent = "Passwords do not match. Please try again.";
            }
            return;
        }

        const deactivatedEmails: string[] = JSON.parse(localStorage.getItem('deactivatedEmails') || '[]');

        if (deactivatedEmails.includes(email)) {
            if (errorMessage) {
                errorMessage.textContent = "This email is deactivated and cannot be used for registration.";
            }
            return;
        }

        const users: { email: string; password: string; name: string; phone: string; role: string }[] = JSON.parse(localStorage.getItem('users') || '[]');
        const admins: { email: string; password: string; name: string; role: string }[] = JSON.parse(localStorage.getItem('admins') || '[]');
        if (users.some(user => user.email === email) || admins.some(admin => admin.email === email)) {
            if (errorMessage) {
                errorMessage.textContent = "Email already registered. Please use a different email.";
            }
            return;
        }

        users.push({ name, email, phone, password, role: "User" });
        localStorage.setItem('users', JSON.stringify(users));

        if (errorMessage) {
            errorMessage.textContent = "Registration successful! Please log in.";
            errorMessage.style.color = "green";
        }
        switchToLogin?.click();
    });

    loginForm?.addEventListener('submit', function (e: Event) {
        e.preventDefault();
        const email: string | undefined = (document.getElementById('loginEmail') as HTMLInputElement)?.value;
        const password: string | undefined = (document.getElementById('loginPassword') as HTMLInputElement)?.value;

        if (!email || !password) return;

        const users: { email: string; password: string; name: string; role: string }[] = JSON.parse(localStorage.getItem('users') || '[]');
        const admins: { email: string; password: string; name: string; role: string }[] = JSON.parse(localStorage.getItem('admins') || '[]');

        const user = users.find(u => u.email === email && (u.password === password || atob(u.password) === password));
        const admin = admins.find(a => a.email === email && (a.password === password || atob(a.password) === password));

        if (user) {
            const { password, ...userInfo } = user;

            localStorage.setItem('currentUser', JSON.stringify(userInfo));
            sessionStorage.setItem('currentUser', JSON.stringify(userInfo));
            localStorage.setItem('userName', user.name);

            if (errorMessage) {
                errorMessage.textContent = "Login successful! Redirecting...";
                errorMessage.style.color = "green";
            }

            setTimeout(function () {
                window.location.href = "/Project/appointment/appointment.html"; 
            }, 2000);

        } else if (admin) {
            const { password, ...adminInfo } = admin;

            localStorage.setItem('currentAdmin', JSON.stringify(adminInfo));
            sessionStorage.setItem('currentAdmin', JSON.stringify(adminInfo));

            if (errorMessage) {
                errorMessage.textContent = "Login successful! Redirecting...";
                errorMessage.style.color = "green";
            }

            setTimeout(function () {
                window.location.href = "/Project/admin/admin.html";
            }, 2000);
        } else {
            if (errorMessage) {
                errorMessage.textContent = "Invalid email or password.";
            }
        }
    });

    if (loginForm && registrationForm) {
        loginForm.style.display = 'block';
        registrationForm.style.display = 'none';
    }
});