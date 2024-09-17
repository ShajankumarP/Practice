document.addEventListener('DOMContentLoaded', function () {
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    function displayUserInfo(editable = false) {
        if (!currentUser) {
            window.location.href = '../index.html'; // Redirect to login if not logged in
        } else {
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
            document.getElementById('editBtn').addEventListener('click', handleEdit);
            document.getElementById('saveBtn').addEventListener('click', handleSave);
        }
    }

    function handleEdit() {
        displayUserInfo(true);
        document.getElementById('editBtn').style.display = 'none';
        document.getElementById('saveBtn').style.display = 'inline-block';
    }

    function handleSave() {
        const newName = document.getElementById('name').value;
        const newEmail = document.getElementById('email').value;
        const newPhone = document.getElementById('phone').value;

        // Update currentUser object
        currentUser.name = newName;
        currentUser.email = newEmail;
        currentUser.phone = newPhone;

        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Update users array in localStorage
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...currentUser };
            localStorage.setItem('users', JSON.stringify(users));
        }

        displayUserInfo();
        alert('Your information has been updated successfully!');
    }

    displayUserInfo();

    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    });
});