document.addEventListener('DOMContentLoaded', function () {
    const userInfo: HTMLElement | null = document.getElementById('userInfo');
    const logoutBtn: HTMLElement | null = document.getElementById('logoutBtn');

    let currentUser: { name: string; email: string; phone: string } | null = JSON.parse(localStorage.getItem('currentUser') as string);

    function displayUserInfo(editable: boolean = false): void {
        if (!currentUser) {
            window.location.href = '../index.html'; // Redirect to login if not logged in
        } else {
            if (userInfo) {
                userInfo.innerHTML = `
                    <div class="user-info-header">
                        <h1>User Information</h1>
                        <div class="btn-container">
                            <button id="editBtn" class="btn" title="Edit Information"><i class="fa-solid fa-pen-to-square" style="color: #ffffff;"></i></button>
                            <button id="saveBtn" class="btn" style="display: none;">Save Changes</button>
                        </div>
                    </div>
                    <p>
                        <label for="name">Name:</label><br>
                        <input type="text" id="name" value="${currentUser.name}" ${editable ? '' : 'disabled'}>
                    </p>
                    <p>
                        <label for="email">Email:</label><br>
                        <input type="email" id="email" value="${currentUser.email}" ${editable ? '' : 'disabled'}>
                    </p>
                    <p>
                        <label for="phone">Phone:</label><br>
                        <input type="tel" id="phone" value="${currentUser.phone}" ${editable ? '' : 'disabled'}>
                    </p>
                `;

                // Reattach event listeners to the new buttons
                document.getElementById('editBtn')?.addEventListener('click', handleEdit);
                document.getElementById('saveBtn')?.addEventListener('click', handleSave);
            }
        }
    }

    function handleEdit(): void {
        displayUserInfo(true);
        document.getElementById('editBtn')!.style.display = 'none';
        document.getElementById('saveBtn')!.style.display = 'inline-block';
    }

    function handleSave(): void {
        const newName: string = (document.getElementById('name') as HTMLInputElement).value;
        const newEmail: string = (document.getElementById('email') as HTMLInputElement).value;
        const newPhone: string = (document.getElementById('phone') as HTMLInputElement).value;

        // Update currentUser object
        if (currentUser) {
            currentUser.name = newName;
            currentUser.email = newEmail;
            currentUser.phone = newPhone;

            // Update localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Update users array in localStorage
            let users: Array<{ name: string; email: string; phone: string }> = JSON.parse(localStorage.getItem('users') as string) || [];
            const userIndex: number = users.findIndex(u => u.email === currentUser.email);
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...currentUser };
                localStorage.setItem('users', JSON.stringify(users));
            }

            displayUserInfo();
            alert('Your information has been updated successfully!');
        }
    }

    displayUserInfo();

    logoutBtn?.addEventListener('click', function (e: MouseEvent) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    });
});