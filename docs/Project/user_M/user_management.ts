import React, { FC } from 'react';

interface User {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  status?: string;
}

function loadUsers(): void {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const admins: User[] = JSON.parse(localStorage.getItem('admins') || '[]');
  const deactivatedEmails: string[] = JSON.parse(localStorage.getItem('deactivatedEmails') || '[]');
  const userList: HTMLElement | null = document.getElementById('userList');
  if (userList) userList.innerHTML = '';

  users.forEach((user: User, index: number) => {
    if (deactivatedEmails.includes(user.email)) return;

    const row: HTMLTableRowElement = document.createElement('tr');
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

  admins.forEach((user: User, index: number) => {
    if (deactivatedEmails.includes(user.email)) return;

    const row: HTMLTableRowElement = document.createElement('tr');
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

document.getElementById('addUserForm')?.addEventListener('submit', function (e: Event): void {
  e.preventDefault();

  const name: string = (document.getElementById('userName') as HTMLInputElement).value;
  const email: string = (document.getElementById('userEmail') as HTMLInputElement).value;
  const phone: string = (document.getElementById('userPhone') as HTMLInputElement).value;
  const password: string = (document.getElementById('userPassword') as HTMLInputElement).value;
  const role: string = (document.getElementById('userRole') as HTMLSelectElement).value;

  if (!name || !email || !phone || !password || !role) return;

  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const admins: User[] = JSON.parse(localStorage.getItem('admins') || '[]');
  const deactivatedEmails: string[] = JSON.parse(localStorage.getItem('deactivatedEmails') || '[]');

  if (deactivatedEmails.includes(email)) {
    alert('This email is deactivated and cannot be used.');
    return;
  }

  const user: User = { name, email, phone, password: btoa(password), role };
  
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

function editUser(index: number, role: string): void {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const admins: User[] = JSON.parse(localStorage.getItem('admins') || '[]');
  let user: User;

  if (role === 'Admin') {
    user = admins[index];
  } else {
    user = users[index];
  }

  (document.getElementById('editUserName') as HTMLInputElement).value = user.name;
  (document.getElementById('editUserEmail') as HTMLInputElement).value = user.email;
  (document.getElementById('editUserPhone') as HTMLInputElement).value = user.phone;
  (document.getElementById('editUserPassword') as HTMLInputElement).value = user.password;
  (document.getElementById('editUserRole') as HTMLSelectElement).value = user.role;

  document.getElementById('editUserModal')!.style.display = 'block';

  document.getElementById('editUserForm')!.onsubmit = function (e: Event): void {
    e.preventDefault();

    const updatedUser: User = {
      name: (document.getElementById('editUserName') as HTMLInputElement).value,
      email: (document.getElementById('editUserEmail') as HTMLInputElement).value,
      phone: (document.getElementById('editUserPhone') as HTMLInputElement).value,
      password: (document.getElementById('editUserPassword') as HTMLInputElement).value,
      role: (document.getElementById('editUserRole') as HTMLSelectElement).value,
      status: user.status // Keep the current user status
    };

    if (role === 'Admin' && updatedUser.role === 'User') {
      admins.splice(index, 1);
      users.push(updatedUser);
    } else if (role === 'User' && updatedUser.role === 'Admin') {
      users.splice(index, 1);
      admins.push(updatedUser);
    } else {
      if (role === 'Admin') {
        admins[index] = updatedUser;
      } else {
        users[index] = updatedUser;
      }
    }

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('admins', JSON.stringify(admins));

    document.getElementById('editUserModal')!.style.display = 'none';
    loadUsers();
  };
}

document.getElementById('cancelEdit')?.addEventListener('click', function (): void {
  document.getElementById('editUserModal')!.style.display = 'none';
});

loadUsers();

function deactivateUser(index: number): void {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const admins: User[] = JSON.parse(localStorage.getItem('admins') || '[]');
  const deactivatedEmails: string[] = JSON.parse(localStorage.getItem('deactivatedEmails') || '[]') || [];

  const user: User = users.concat(admins)[index];
  user.status = 'deactivated';

  if (!deactivatedEmails.includes(user.email)) {
    deactivatedEmails.push(user.email);
    localStorage.setItem('deactivatedEmails', JSON.stringify(deactivatedEmails));
  }

  if (user.role === 'Admin') {
    const updatedAdmins: User[] = admins.filter(u => u.email !== user.email);
    localStorage.setItem('admins', JSON.stringify(updatedAdmins));
  } else {
    const updatedUsers: User[] = users.filter(u => u.email !== user.email);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  }

  loadUsers();
}

function deleteUser(index: number): void {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const admins: User[] = JSON.parse(localStorage.getItem('admins') || '[]');
  const user: User = users.concat(admins)[index];

  if (user.status === 'deactivated') {
    alert('This user is deactivated and cannot be deleted.');
    return;
  }

  if (user.role === 'Admin') {
    const updatedAdmins: User[] = admins.filter(u => u.email !== user.email);
    localStorage.setItem('admins', JSON.stringify(updatedAdmins));
  } else {
    const updatedUsers: User[] = users.filter(u => u.email !== user.email);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  }

  loadUsers();
}

loadUsers();