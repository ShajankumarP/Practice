document.addEventListener('DOMContentLoaded', function () {
    const userInfo = document.getElementById('userInfo');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    function displayUserInfo(editable = false) {
        if (!currentUser) {
            window.location.href = 'index.html'; // Redirect to login if not logged in
        } else {
            userInfo.innerHTML = `
                <h2>User Information</h2>
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
        }
    }

    displayUserInfo();

    editBtn.addEventListener('click', function () {
        displayUserInfo(true);
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
    });

    saveBtn.addEventListener('click', function () {
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
        saveBtn.style.display = 'none';
        editBtn.style.display = 'inline-block';

        alert('Your information has been updated successfully!');
    });

    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
});