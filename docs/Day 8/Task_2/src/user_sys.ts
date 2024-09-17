class userManager {
    private users: Array<{id: number, name: string, email: string, role: string}>;
    private nextId: number;
    private messageArea: HTMLDivElement;

    constructor() {
        this.users = [];
        this.nextId = 1;
        this.messageArea = document.createElement('div');
        this.messageArea.id = 'messageArea';
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(this.messageArea, document.getElementById('userTable'));
        }
    }

    addUser(name: string, email: string, role: string): boolean {
        if (!this.validateEmail(email) || this.isDuplicateEmail(email)) {
            this.showMessage('Invalid or duplicate email', 'error');
            return false;
        }
        this.users.push({ id: this.nextId++, name, email, role });
        this.renderUsers();
        this.showMessage('User added successfully', 'success');
        return true;
    }

    editUser(id: number, name: string, email: string, role: string): boolean {
        if (!this.validateEmail(email) || this.isDuplicateEmail(email)) {
            this.showMessage('Invalid or duplicate email', 'error');
            return false;
        }
        const user = this.users.find(u => u.id === id);
        if (user) {
            Object.assign(user, { name, email, role });
            this.renderUsers();
            this.showMessage('User updated successfully', 'success');
            return true;
        }
        return false;
    }

    deleteUser(id: number): void {
        this.users = this.users.filter(user => user.id !== id);
        this.renderUsers();
        this.showMessage('User deleted successfully', 'success');
    }

    renderUsers(): void {
        const tableBody = document.querySelector('#userTable tbody');
        if (tableBody) {
            tableBody.innerHTML = this.users.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td class="actions">
                        <button onclick="userManager.startEdit(${user.id})">Edit</button>
                        <button onclick="userManager.deleteUser(${user.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    startEdit(id: number): void {
        const user = this.users.find(u => u.id === id);
        if (user) {
            const form = document.getElementById('userForm') as HTMLFormElement;
            const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
            const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
            const roleSelect = form.querySelector('select[name="role"]') as HTMLSelectElement;
            
            if (nameInput && emailInput && roleSelect) {
                nameInput.value = user.name;
                emailInput.value = user.email;
                roleSelect.value = user.role;
                form.dataset.editId = id.toString();
                
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.textContent = 'Update User';
                }
            }
        }
    }

    private validateEmail(email: string): boolean {
        return email.endsWith('@gmail.com');
    }

    private isDuplicateEmail(email: string): boolean {
        return this.users.some(user => user.email === email);
    }

    private showMessage(message: string, type: string): void {
        this.messageArea.textContent = message;
        this.messageArea.className = type;
        setTimeout(() => {
            this.messageArea.textContent = '';
            this.messageArea.className = '';
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const userManager = new UserManager();
    const userForm = document.getElementById('userForm') as HTMLFormElement;
    
    userForm.addEventListener('submit', function(this: HTMLFormElement, event) {
        event.preventDefault();
        const nameInput = this.querySelector('input[name="name"]') as HTMLInputElement;
        const emailInput = this.querySelector('input[name="email"]') as HTMLInputElement;
        const roleSelect = this.querySelector('select[name="role"]') as HTMLSelectElement;
        
        if (nameInput && emailInput && roleSelect) {
            const editId = this.dataset.editId;
            if (editId) {
                if (userManager.editUser(parseInt(editId), nameInput.value, emailInput.value, roleSelect.value)) {
                    delete this.dataset.editId;
                    const submitButton = this.querySelector('button[type="submit"]');
                    if (submitButton) {
                        submitButton.textContent = 'Add User';
                    }
                }
            } else {
                userManager.addUser(nameInput.value, emailInput.value, roleSelect.value);
            }
            
            this.reset();
            roleSelect.value = 'Admin';
        }
    });

    (window as any).userManager = userManager;
});