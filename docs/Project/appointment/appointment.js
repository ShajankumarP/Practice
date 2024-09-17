let appointments = [];

document.addEventListener('DOMContentLoaded', () => {
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

    // Add event listeners for navigation links
    document.getElementById('nav-booking').addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        toggleSection('booking-section');
    });

    document.getElementById('nav-management').addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        toggleSection('management-section');
    });

    // Add event listeners for tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const tabName = event.target.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    
    toggleSection('booking-section');
    switchTab('upcoming'); // Default tab
});


// Load services from local storage and populate the service dropdown
function loadServices() {
    const serviceSelect = document.getElementById('service');
    const services = JSON.parse(localStorage.getItem('services')) || {};
    sessionStorage.setItem('userServices', JSON.stringify(services));

    serviceSelect.innerHTML = '<option value="">Select a service</option>';
    Object.keys(services).forEach(id => {
        const service = services[id];
        const option = document.createElement('option');
        option.value = id; // Use unique ID as value
        option.textContent = service.serviceName;
        serviceSelect.appendChild(option);
    });

    // Update provider dropdown when service is selected
    serviceSelect.addEventListener('change', function () {
        const selectedServiceId = this.value;
        const selectedService = services[selectedServiceId];
        const providers = selectedService ? selectedService.providers.split(', ') : []; // Split the comma-separated string into an array
        updateProviderDropdown(providers);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const bookingSection = document.getElementById('booking-section');
    const managementSection = document.getElementById('management-section');
    
    const navBooking = document.getElementById('nav-booking');
    const navManagement = document.getElementById('nav-management');

    // Default section to display
    bookingSection.style.display = 'block';
    navBooking.classList.add('active');

    // Function to switch active state and show respective sections
    navBooking.addEventListener('click', (e) => {
        e.preventDefault();
        bookingSection.style.display = 'block';
        managementSection.style.display = 'none';

        navBooking.classList.add('active');
        navManagement.classList.remove('active');
    });

    navManagement.addEventListener('click', (e) => {
        e.preventDefault();
        bookingSection.style.display = 'none';
        managementSection.style.display = 'block';

        navManagement.classList.add('active');
        navBooking.classList.remove('active');
    });
});


// Call loadServices to initialize the dropdown
loadServices();

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

function updateProviderDropdown(providers) {
    const providerSelect = document.getElementById('provider');
    providerSelect.innerHTML = '<option value="">Select a provider</option>';

    if (providers.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No providers available";
        providerSelect.appendChild(option);
    } else {
        providers.forEach(provider => {
            const option = document.createElement('option');
            option.value = provider;
            option.textContent = provider;
            providerSelect.appendChild(option);
        });
    }
}


// Load availability for the selected service from local storage
function loadAvailability(serviceId) {
    const serviceAvailability = JSON.parse(localStorage.getItem('serviceAvailability')) || {};
    return serviceAvailability[serviceId] || null;
}


// Validate appointment date with availability
function validateAvailability(date, availability) {
    if (!availability) {
        return { isValid: false, dateError: 'No availability data found for the selected service and provider.' };
    }

    const { availabilityStart, availabilityEnd, blackoutPeriods } = availability;

    const startDate = new Date(availabilityStart);
    const endDate = new Date(availabilityEnd);
    const selectedDate = new Date(date);

    let dateError = '';

    if (selectedDate < startDate || selectedDate > endDate) {
        dateError = 'The selected date is not within the available date range.';
    }

    // Check for blackout periods
    if (blackoutPeriods && typeof blackoutPeriods === 'string') {
        const blackoutRanges = blackoutPeriods.split(','); // Handle multiple blackout periods
        for (const range of blackoutRanges) {
            const [blackoutStart, blackoutEnd] = range.trim().split(' to ');
            if (blackoutStart && blackoutEnd) {
                const blackoutStartDate = new Date(blackoutStart);
                const blackoutEndDate = new Date(blackoutEnd);

                if (selectedDate >= blackoutStartDate && selectedDate <= blackoutEndDate) {
                    dateError = 'The selected date falls within a blackout period.';
                    break;
                }
            }
        }
    }

    return { isValid: !dateError, dateError };
}

// Book an appointment
function bookAppointment(event) {
    event.preventDefault();

    const serviceId = document.getElementById('service').value;
    const provider = document.getElementById('provider').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const userName = localStorage.getItem('userName');
    console.log(serviceId, provider, date, time, userName);

    // Load availability for the selected service and provider
    const availability = loadAvailability(serviceId);

    if (!availability) {
        alert('No availability found for the selected service and provider.');
        return;
    }

    const { isValid, dateError } = validateAvailability(date, availability);

    if (!isValid) {
        if (dateError) alert(dateError);
        return;
    }

    // Check if the user already has an appointment for the selected date
    const userHasAppointment = appointments.some(app => 
        app.userName === userName && 
        app.date === date && 
        app.status !== 'Cancelled'
    );
    if (userHasAppointment) {
        alert('You already have an appointment booked for this date.');
        return;
    }

    // Check if the provider is already booked for the selected date
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
        serviceId, // Use the service ID
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

    appointments.filter(app => app.status === 'Upcoming' && app.userName === localStorage.getItem('userName')).forEach(appointment => {
        const service = JSON.parse(localStorage.getItem('services'))[appointment.serviceId]; // Fetch service details
        const appointmentElement = document.createElement('div');
        appointmentElement.className = 'appointment-container';
        appointmentElement.setAttribute('data-id', appointment.id);
        appointmentElement.innerHTML = `
            <div class="appointment-item">
                <div class="appointment-details">
                    <h3>${service.serviceName}</h3>
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
function toggleRescheduleForm(id, forceClose = false) {
    const form = document.querySelector(`.appointment-container[data-id="${id}"] .reschedule-form`);
    if (forceClose) {
        form.style.display = 'none';
    } else {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
}

// Save rescheduled appointment
function saveReschedule(appointmentId) {
    const newDate = document.getElementById(`reschedule-date-${appointmentId}`).value;
    const newTime = document.getElementById(`reschedule-time-${appointmentId}`).value;

    const appointment = appointments.find(app => app.id === appointmentId);
    if (appointment) {
        const availability = loadAvailability();
        const { isValid, dateError, timeError } = validateAvailability(newDate, newTime, availability);

        if (!isValid) {
            if (dateError) alert(dateError);
            if (timeError) alert(timeError);
            return;
        }

        const userHasAppointment = appointments.some(app => 
            app.userName === appointment.userName && 
            app.date === newDate && 
            app.status !== 'Cancelled'
        );
        if (userHasAppointment) {
            alert('You already have an appointment booked for this date.');
            return;
        }

        const providerBooked = appointments.some(app => 
            app.provider === appointment.provider && 
            app.date === newDate && 
            app.status !== 'Cancelled'
        );
        if (providerBooked) {
            alert('The selected provider is already booked for this date.');
            return;
        }

        const providerAssigned = appointments.some(app =>
            app.provider === appointment.provider &&
            app.date === newDate &&
            app.status !== 'Cancelled'
        );
        if (providerAssigned) {
            alert('The selected provider is already assigned to another user for this date.');
            return;
        }

        appointment.date = newDate;
        appointment.time = newTime;

        saveAppointments(); // Save updated appointments to local storage
        renderUpcomingAppointments(); // Re-render the appointment list

        // Close the reschedule form after saving
        toggleRescheduleForm(appointmentId, true); 

    }
}


// Cancel an appointment
function cancelAppointment(appointmentId) {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (appointment) {
        appointment.status = 'Cancelled';
        saveAppointments();
        renderUpcomingAppointments();
    }
}


// Load appointments from local storage
function loadAppointmentsFromLocalStorage() {
    appointments = JSON.parse(localStorage.getItem('appointments')) || [];
}

// Load services from local storage and create a map of serviceId to serviceName
function loadServicesMap() {
    const services = JSON.parse(localStorage.getItem('services')) || {};
    const servicesMap = {};
    for (const [id, service] of Object.entries(services)) {
        servicesMap[id] = service.serviceName;
    }
    return servicesMap;
}

// Render appointment history for the current user
function renderAppointmentHistory() {
    const historyTableBody = document.querySelector('#history-table tbody');
    historyTableBody.innerHTML = '';

    const currentUser = localStorage.getItem('userName'); // Get the current user from local storage

    // Load appointments from localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];

    // Load services map
    const servicesMap = loadServicesMap();

    // Filter appointments for the current user and those with a status other than 'Upcoming'
    const historyAppointments = appointments.filter(app => 
        app.userName === currentUser && app.status !== 'Upcoming' && app.status !== 'confirmed' && app.status !== 'Rescheduled'
    );

    if (historyAppointments.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="5">No appointment history available for ${currentUser}</td>`;
        historyTableBody.appendChild(emptyRow);
    } else {
        historyAppointments.forEach(appointment => {
            const serviceName = servicesMap[appointment.serviceId] || 'Unknown Service';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${serviceName}</td>
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
    }
});
document.getElementById('booking-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const service = document.getElementById('service').value;
    const provider = document.getElementById('provider').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    const bookingData = {
        service: service,
        provider: provider,
        date: date,
        time: time,
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
