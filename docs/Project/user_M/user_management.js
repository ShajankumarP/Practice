// Load users from local storage and display them in the table
function loadUsers() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const admins = JSON.parse(localStorage.getItem('admins')) || [];
  const deactivatedEmails = JSON.parse(localStorage.getItem('deactivatedEmails')) || [];
  const userList = document.getElementById('userList');
  userList.innerHTML = '';

  users.forEach((user, index) => {
    if (deactivatedEmails.includes(user.email)) return;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.phone}</td>
      <td>${user.role}</td>
      <td>
        <button onclick="editUser(${index}, 'User')">Edit</button>
        <button onclick="deactivateUser(${index}, 'User')">Deactivate</button>
        <button onclick="deleteUser(${index}, 'User')">Delete</button>
      </td>
    `;
    userList.appendChild(row);
  });

  admins.forEach((user, index) => {
    if (deactivatedEmails.includes(user.email)) return;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.phone}</td>
      <td>
        <button onclick="editUser(${index}, 'Admin')">Edit</button>
        <button onclick="deactivateUser(${index}, 'Admin')">Deactivate</button>
        <button onclick="deleteUser(${index}, 'Admin')">Delete</button>
      </td>
    `;
    userList.appendChild(row);
  });
}


// Add new user
document.getElementById('addUserForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;
  const phone = document.getElementById('userPhone').value;
  const password = document.getElementById('userPassword').value;
  const role = document.getElementById('userRole').value;

  if (!name || !email || !phone || !password || !role) return;

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const admins = JSON.parse(localStorage.getItem('admins')) || [];
  const deactivatedEmails = JSON.parse(localStorage.getItem('deactivatedEmails')) || [];

  if (deactivatedEmails.includes(email)) {
    alert('This email is deactivated and cannot be used.');
    return;
  }

  const user = { name, email, phone, password: btoa(password), role };
  
  if (role === 'Admin') {
    admins.push(user);
    localStorage.setItem('admins', JSON.stringify(admins));
  } else {
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  }

  loadUsers();
  this.reset();
});


// Edit user function
function editUser(index, role) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const admins = JSON.parse(localStorage.getItem('admins')) || [];
  let user;

  if (role === 'Admin') {
    user = admins[index];
  } else {
    user = users[index];
  }

  // Populate the modal form with the user's data
  document.getElementById('editUserName').value = user.name;
  document.getElementById('editUserEmail').value = user.email;
  document.getElementById('editUserPhone').value = user.phone;
  document.getElementById('editUserPassword').value = user.password;
  document.getElementById('editUserRole').value = user.role;

  // Show the edit modal
  document.getElementById('editUserModal').style.display = 'block';

  // Handle form submission
  document.getElementById('editUserForm').onsubmit = function (e) {
    e.preventDefault();

    const updatedUser = {
      name: document.getElementById('editUserName').value,
      email: document.getElementById('editUserEmail').value,
      phone: document.getElementById('editUserPhone').value,
      password: document.getElementById('editUserPassword').value,
      role: document.getElementById('editUserRole').value,
      status: user.status // Keep the current user status
    };

    // If the role has changed, move the user between arrays
    if (role === 'Admin' && updatedUser.role === 'User') {
      // Remove from admins and add to users
      admins.splice(index, 1);
      users.push(updatedUser);
    } else if (role === 'User' && updatedUser.role === 'Admin') {
      // Remove from users and add to admins
      users.splice(index, 1);
      admins.push(updatedUser);
    } else {
      // If the role hasn't changed, just update the relevant array
      if (role === 'Admin') {
        admins[index] = updatedUser;
      } else {
        users[index] = updatedUser;
      }
    }

    // Save the updated arrays to local storage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('admins', JSON.stringify(admins));

    // Close the modal and reload the user list
    document.getElementById('editUserModal').style.display = 'none';
    loadUsers();
  };
}

// Cancel edit modal
document.getElementById('cancelEdit').addEventListener('click', function () {
  document.getElementById('editUserModal').style.display = 'none';
});

// Initial load
loadUsers();


// Deactivate user
function deactivateUser(index) {
  const users = JSON.parse(localStorage.getItem('users'));
  const admins = JSON.parse(localStorage.getItem('admins'));
  const deactivatedEmails = JSON.parse(localStorage.getItem('deactivatedEmails')) || [];

  const user = users.concat(admins)[index];
  user.status = 'deactivated';

  if (!deactivatedEmails.includes(user.email)) {
    deactivatedEmails.push(user.email);
    localStorage.setItem('deactivatedEmails', JSON.stringify(deactivatedEmails));
  }

  if (user.role === 'Admin') {
    const updatedAdmins = admins.filter(u => u.email !== user.email);
    localStorage.setItem('admins', JSON.stringify(updatedAdmins));
  } else {
    const updatedUsers = users.filter(u => u.email !== user.email);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  }

  loadUsers();
}

// Delete user
function deleteUser(index) {
  const users = JSON.parse(localStorage.getItem('users'));
  const admins = JSON.parse(localStorage.getItem('admins'));
  const user = users.concat(admins)[index];

  if (user.status === 'deactivated') {
    alert('This user is deactivated and cannot be deleted.');
    return;
  }

  if (user.role === 'Admin') {
    const updatedAdmins = admins.filter(u => u.email !== user.email);
    localStorage.setItem('admins', JSON.stringify(updatedAdmins));
  } else {
    const updatedUsers = users.filter(u => u.email !== user.email);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  }

  loadUsers();
}


// Initial load
loadUsers();

