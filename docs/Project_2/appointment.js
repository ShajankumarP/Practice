let appointments = [];

// Toggle between booking and management sections
function toggleSection(sectionId) {
    document.getElementById('booking-section').style.display = 'none';
    document.getElementById('management-section').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
}

// Switch between tabs
function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`.tab-button[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-appointments`).classList.add('active');
}

// Load services from local storage and populate the service dropdown
function loadServices() {
    const serviceSelect = document.getElementById('service');
    const services = JSON.parse(localStorage.getItem('services')) || [];
    sessionStorage.setItem('userServices', JSON.stringify(services));

    serviceSelect.innerHTML = '<option value="">Select a service</option>';
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.serviceName;
        option.textContent = service.serviceName;
        serviceSelect.appendChild(option);
    });

    // Update provider dropdown when service is selected
    serviceSelect.addEventListener('change', function () {
        const selectedService = services.find(service => service.serviceName === this.value);
        updateProviderDropdown(selectedService ? selectedService.providers : []);
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('booking-form').addEventListener('submit', bookAppointment);
    document.getElementById('nav-booking').addEventListener('click', () => toggleSection('booking-section'));
    document.getElementById('nav-management').addEventListener('click', () => toggleSection('management-section'));

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function () {
            switchTab(this.dataset.tab);
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
        const userName = localStorage.getItem('userName');
        if (userName) {
            const userNameField = document.getElementById('user-name');
            userNameField.value = userName;
            userNameField.setAttribute('readonly', true);
        }
    });
}

// Update provider dropdown based on selected service
function updateProviderDropdown(providers) {
    const providerSelect = document.getElementById('provider');
    providerSelect.innerHTML = '<option value="">Select a provider</option>';

    providers.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider;
        option.textContent = provider;
        providerSelect.appendChild(option);
    });

    if (providers.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No providers available";
        providerSelect.appendChild(option);
    }
}

// Load availability data from local storage
function loadAvailability() {
    return JSON.parse(localStorage.getItem('availability')) || {
        availabilityStart: '',
        availabilityEnd: '',
        availabilityTimes: '',
        blackoutPeriods: ''
    };
}

// Validate appointment date and time
function validateAvailability(date, time, availability) {
    const { availabilityStart, availabilityEnd, availabilityTimes, blackoutPeriods } = availability;
    const startDate = new Date(availabilityStart);
    const endDate = new Date(availabilityEnd);
    const selectedDate = new Date(date);
    const timeStr = `${time}`;

    let dateError = '';
    let timeError = '';

    if (selectedDate < startDate || selectedDate > endDate) {
        dateError = 'The selected date is not within the allowed range.';
    }

    const blackoutRanges = blackoutPeriods.split(',').map(range => range.trim().split(' to '));
    const isBlackout = blackoutRanges.some(([blackoutStart, blackoutEnd]) => {
        const start = new Date(blackoutStart);
        const end = new Date(blackoutEnd);
        return selectedDate >= start && selectedDate <= end;
    });

    if (isBlackout) {
        dateError = 'The selected date falls within a blackout period.';
    }

    const allowedTimes = availabilityTimes.split(',').map(timeRange => timeRange.trim());
    const isTimeAllowed = allowedTimes.some(range => {
        const [startTime, endTime] = range.split('-').map(t => t.trim());
        return timeStr >= startTime && timeStr <= endTime;
    });

    if (!isTimeAllowed) {
        timeError = 'The selected time is not within the allowed times.';
    }

    return { isValid: !dateError && !timeError, dateError, timeError };
}

// Book an appointment
function bookAppointment(event) {
    event.preventDefault();

    const service = document.getElementById('service').value;
    const provider = document.getElementById('provider').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const userName = localStorage.getItem('userName'); 

    const availability = loadAvailability();
    const { isValid, dateError, timeError } = validateAvailability(date, time, availability);

    if (!isValid) {
        if (dateError) alert(dateError);
        if (timeError) alert(timeError);
        return;
    }

    // Check if the user already has an appointment for the selected date, excluding cancelled appointments
    const userHasAppointment = appointments.some(app => 
        app.userName === userName && 
        app.date === date && 
        app.status !== 'Cancelled'
    );
    if (userHasAppointment) {
        alert('You already have an appointment booked for this date.');
        return;
    }

    // Check if the provider is already booked for the selected date, excluding cancelled appointments
    const providerBooked = appointments.some(app => 
        app.provider === provider && 
        app.date === date && 
        app.status !== 'Cancelled'
    );
    if (providerBooked) {
        alert('The selected provider is already booked for this date.');
        return;
    }

    const newAppointment = {
        id: Date.now(),
        service,
        provider,
        date,
        time,
        userName,
        status: 'Upcoming'
    };

    appointments.push(newAppointment);
    saveAppointments();
    renderUpcomingAppointments();
    document.getElementById('booking-form').reset();
    alert('Appointment booked successfully');
}



// Save appointments to local storage
function saveAppointments() {
    localStorage.setItem('appointments', JSON.stringify(appointments));
}



// Render upcoming appointments
function renderUpcomingAppointments() {
    const appointmentList = document.getElementById('upcoming-appointments');
    appointmentList.innerHTML = '';

    appointments.filter(app => app.status === 'Upcoming' && app.userName==localStorage.getItem('userName') ).forEach(appointment => {
        const appointmentElement = document.createElement('div');
        appointmentElement.className = 'appointment-container';
        appointmentElement.setAttribute('data-id', appointment.id);
        appointmentElement.innerHTML = `
            <div class="appointment-item">
                <div class="appointment-details">
                    <h3>${appointment.service}</h3>
                    <p><strong>Provider:</strong> ${appointment.provider}</p>
                    <p><strong>Date:</strong> <span class="date-field">${appointment.date}</span></p>
                    <p><strong>Time:</strong> <span class="time-field">${appointment.time}</span></p>
                    <p><strong>Status:</strong> ${appointment.status}</p>
                </div>
                <div class="appointment-actions">
                    <button class="btn btn-reschedule">Reschedule</button>
                    <button class="btn btn-cancel">Cancel</button>
                </div>
            </div>
            <div class="reschedule-form" style="display: none;">
                <h4>Reschedule Appointment</h4>
                <div class="form-group">
                    <label for="reschedule-date-${appointment.id}">New Date:</label>
                    <input type="date" id="reschedule-date-${appointment.id}" class="reschedule-date">
                </div>
                <div class="form-group">
                    <label for="reschedule-time-${appointment.id}">New Time:</label>
                    <input type="time" id="reschedule-time-${appointment.id}" class="reschedule-time">
                </div>
                <button class="btn btn-save">Save</button>
                <button class="btn btn-cancel-reschedule">Cancel</button>
            </div>
        `;
        appointmentList.appendChild(appointmentElement);

        // Add event listeners for reschedule and cancel buttons
        appointmentElement.querySelector('.btn-reschedule').addEventListener('click', () => toggleRescheduleForm(appointment.id));
        appointmentElement.querySelector('.btn-cancel').addEventListener('click', () => cancelAppointment(appointment.id));
        appointmentElement.querySelector('.btn-save').addEventListener('click', () => saveReschedule(appointment.id));
        appointmentElement.querySelector('.btn-cancel-reschedule').addEventListener('click', () => toggleRescheduleForm(appointment.id));
    });
}

// Toggle reschedule form visibility
function toggleRescheduleForm(id) {
    const form = document.querySelector(`.appointment-container[data-id="${id}"] .reschedule-form`);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// Save rescheduled appointment
function saveReschedule(id) {
    const date = document.querySelector(`#reschedule-date-${id}`).value;
    const time = document.querySelector(`#reschedule-time-${id}`).value;

    const appointment = appointments.find(app => app.id === id);
    if (appointment) {
        appointment.date = date;
        appointment.time = time;
        saveAppointments();
        renderUpcomingAppointments();
        renderAppointmentHistory();
    }
}

// Cancel an appointment
function cancelAppointment(id) {
    const appointment = appointments.find(app => app.id === id);
    if (appointment) {
        appointment.status = 'Cancelled';
        saveAppointments();
        renderUpcomingAppointments();
        renderAppointmentHistory();
    }
}

// Load appointments from local storage
function loadAppointmentsFromLocalStorage() {
    appointments = JSON.parse(localStorage.getItem('appointments')) || [];
}

// Render appointment history for the current user
function renderAppointmentHistory() {
    const historyTableBody = document.querySelector('#history-table tbody');
    historyTableBody.innerHTML = '';

    const currentUser = localStorage.getItem('userName'); // Get the current user from local storage

    // Load appointments from localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];

    // Filter appointments for the current user and those with a status other than 'Upcoming'
    const historyAppointments = appointments.filter(app => 
        app.userName === currentUser && app.status !== 'Upcoming'
    );

    if (historyAppointments.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="5">No appointment history available for ${currentUser}</td>`;
        historyTableBody.appendChild(emptyRow);
    } else {
        historyAppointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.service}</td>
                <td>${appointment.provider}</td>
                <td>${appointment.date}</td>
                <td>${appointment.time}</td>
                <td>${appointment.status}</td>
            `;
            historyTableBody.appendChild(row);
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Load initial data
    loadAppointmentsFromLocalStorage();
    renderUpcomingAppointments();
    renderAppointmentHistory();
    loadServices();

    // Navigation handlers
    document.getElementById('nav-booking').addEventListener('click', () => toggleSection('booking-section'));
    document.getElementById('nav-management').addEventListener('click', () => toggleSection('management-section'));

    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function () {
            switchTab(this.dataset.tab);
        });
    });

    // Booking form submission
    document.getElementById('booking-form').addEventListener('submit', bookAppointment);
});
document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName');
    if (userName) {
        const userNameField = document.getElementById('user-name');
        userNameField.value = userName;
        userNameField.setAttribute('readonly', true);
    }
});
document.getElementById('booking-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const service = document.getElementById('service').value;
    const provider = document.getElementById('provider').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const userName = document.getElementById('user-name').value;

    const bookingData = {
        service: service,
        provider: provider,
        date: date,
        time: time,
        userName: userName
    };

    // Send bookingData to the server or local storage
    console.log(bookingData); // Replace with actual form submission logic
});
document.getElementById('booking-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const service = document.getElementById('service').value;
    const provider = document.getElementById('provider').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const userName = document.getElementById('user-name').value;

    const bookingData = {
        service: service,
        provider: provider,
        date: date,
        time: time,
        userName: userName
    };

    // Save the booking data in localStorage
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.push(bookingData);
    localStorage.setItem('bookings', JSON.stringify(bookings));

});

// Initialize the booking system
function initializeBookingSystem() {
    loadServices();
    loadAppointmentsFromLocalStorage();
    renderUpcomingAppointments();
    renderAppointmentHistory(); 
    document.getElementById('booking-form').addEventListener('submit', bookAppointment);
}

// Call initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeBookingSystem);
