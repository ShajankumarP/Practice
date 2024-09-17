var UserManager = /** @class */ (function () {
    function UserManager() {
        this.users = [];
        this.nextId = 1;
        this.messageArea1 = document.getElementById('messageArea1');
        this.messageArea2 = document.getElementById('messageArea2');
        this.emailInput = document.getElementById('email');
        if (!this.messageArea1 || !this.messageArea2 || !this.emailInput) {
            console.error('One or more required elements not found in the DOM');
        }
    }

    UserManager.prototype.addUser = function (name, email, role) {
        if (!this.validateEmail(email)) {
            this.showError('Invalid email...');
            return false;
        }
        if (this.isDuplicateEmail(email)) {
            this.showError('Duplicate email. This email is already in use.');
            return false;
        }
        this.users.push({ id: this.nextId++, name: name, email: email, role: role });
        this.renderUsers();
        this.showMessage('User added successfully', 'success');
        return true;
    };

    UserManager.prototype.editUser = function (id, name, email, role) {
        if (!this.validateEmail(email)) {
            this.showError('Invalid email...');
            return false;
        }
        var user = this.users.find(function (u) { return u.id === id; });
        if (user && user.email !== email && this.isDuplicateEmail(email)) {
            this.showError('Duplicate email. This email is already in use.');
            return false;

        }
        if (user) {
            Object.assign(user, { name: name, email: email, role: role });
            this.renderUsers();
            this.showMessage('User updated successfully', 'success');
            return true;
        }
        return false;
    };

    UserManager.prototype.deleteUser = function (id) {
        this.users = this.users.filter(function (user) { return user.id !== id; });
        this.renderUsers();
        this.showMessage('User deleted successfully', 'success');
    };

    UserManager.prototype.renderUsers = function () {
        var tableBody = document.querySelector('#userTable tbody');
        if (tableBody) {
            tableBody.innerHTML = this.users.map(function (user) { return "\n                <tr>\n                    <td>".concat(user.name, "</td>\n                    <td>").concat(user.email, "</td>\n                    <td>").concat(user.role, "</td>\n                    <td class=\"actions\">\n                        <button onclick=\"userManager.startEdit(").concat(user.id, ")\">Edit</button>\n                        <button onclick=\"userManager.deleteUser(").concat(user.id, ")\">Delete</button>\n                    </td>\n                </tr>\n            "); }).join('');
        }
    };

    UserManager.prototype.startEdit = function (id) {
        var user = this.users.find(function (u) { return u.id === id; });
        if (user) {
            var form = document.getElementById('userForm');
            var nameInput = form.querySelector('input[name="name"]');
            var emailInput = form.querySelector('input[name="email"]');
            var roleSelect = form.querySelector('select[name="role"]');
            if (nameInput && emailInput && roleSelect) {
                nameInput.value = user.name;
                emailInput.value = user.email;
                roleSelect.value = user.role;
                form.dataset.editId = id.toString();
                var submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.textContent = 'Update User';
                }
            }
        }
    };

    UserManager.prototype.validateEmail = function (email) {
        return email.endsWith('@gmail.com');
    };

    UserManager.prototype.isDuplicateEmail = function (email) {
        return this.users.some(function (user) { return user.email === email; });
    };

    UserManager.prototype.clearEmailInput = function() {
        if (this.emailInput) {
            this.emailInput.value = '';
            this.emailInput.focus();
        }
    };

    UserManager.prototype.showError = function (message) {
        if (this.messageArea1 && this.emailInput) {
            this.messageArea1.textContent = message;
            this.messageArea1.style.display = 'block';
            this.emailInput.setAttribute('aria-invalid', 'true');
            this.emailInput.setAttribute('aria-describedby', 'messageArea1');
            this.clearEmailInput();
            clearTimeout(this.errorTimeout);
            this.errorTimeout = setTimeout(() => {
                this.messageArea1.textContent = '';
                this.messageArea1.style.display = 'none';
                this.emailInput.removeAttribute('aria-invalid');
                this.emailInput.removeAttribute('aria-describedby');
            }, 3000);
        } else {
            console.error('Error message area or email input not found:', message);
        }
    };

    UserManager.prototype.showMessage = function (message, type) {
        if (this.messageArea2) {
            this.messageArea2.textContent = message;
            this.messageArea2.className = type;
            this.messageArea2.style.display = 'block';
            clearTimeout(this.messageTimeout);
            this.messageTimeout = setTimeout(() => {
                this.messageArea2.textContent = '';
                this.messageArea2.className = '';
                this.messageArea2.style.display = 'none';
            }, 3000);
        } else {
            console.error('Message area not found:', message);
        }
    };

    return UserManager;
}());

document.addEventListener('DOMContentLoaded', function () {
    var userManager = new UserManager();
    var userForm = document.getElementById('userForm');
    userForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var nameInput = this.querySelector('input[name="name"]');
        var emailInput = this.querySelector('input[name="email"]');
        var roleSelect = this.querySelector('select[name="role"]');
        if (nameInput && emailInput && roleSelect) {
            var editId = this.dataset.editId;
            var success = false;
            if (editId) {
                success = userManager.editUser(parseInt(editId), nameInput.value, emailInput.value, roleSelect.value);
                if (success) {
                    delete this.dataset.editId;
                    var submitButton = this.querySelector('button[type="submit"]');
                    if (submitButton) {
                        submitButton.textContent = 'Add User';
                    }
                }
            } else {
                success = userManager.addUser(nameInput.value, emailInput.value, roleSelect.value);
            }
            if (success) {
                this.reset();
                roleSelect.value = 'Admin';
            }
        }
    });
    window.userManager = userManager;
});