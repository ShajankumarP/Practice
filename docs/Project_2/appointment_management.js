let appointments = [];
let services = [];
let providers = [];

// Load services and providers from local storage
function loadServicesAndProviders() {
    const serviceSelect = document.getElementById('filter-service');
    const providerSelect = document.getElementById('filter-provider');

    // Load services from local storage
    services = JSON.parse(localStorage.getItem('services')) || [];
    
    // Populate service dropdown
    serviceSelect.innerHTML = '<option value="">All Services</option>';
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.serviceName;
        option.textContent = service.serviceName;
        serviceSelect.appendChild(option);
    });

    // Populate provider dropdown with all providers initially
    updateProviderDropdown();
}

// Update provider dropdown based on selected service
function updateProviderDropdown() {
    const selectedServiceName = document.getElementById('filter-service').value;
    const providerSelect = document.getElementById('filter-provider');

    // Get the selected service
    const selectedService = services.find(service => service.serviceName === selectedServiceName);

    // Populate provider dropdown based on selected service
    if (selectedService) {
        providerSelect.innerHTML = '<option value="">All Providers</option>';
        selectedService.providers.forEach(provider => {
            const option = document.createElement('option');
            option.value = provider;
            option.textContent = provider;
            providerSelect.appendChild(option);
        });
    } else {
        // If no service selected, populate all providers
        const allProviders = [...new Set(services.flatMap(service => service.providers))];
        providerSelect.innerHTML = '<option value="">All Providers</option>';
        allProviders.forEach(provider => {
            const option = document.createElement('option');
            option.value = provider;
            option.textContent = provider;
            providerSelect.appendChild(option);
        });
    }
}

// Filter and render appointments
function renderAppointments() {
    const container = document.getElementById('appointments-container');
    const dateFilter = document.getElementById('filter-date').value;
    const serviceFilter = document.getElementById('filter-service').value;
    const providerFilter = document.getElementById('filter-provider').value;

    // Show the appointments container only after filters are applied
    container.style.display = 'block';

    const filteredAppointments = appointments.filter(app => {
        const matchesDate = !dateFilter || app.date === dateFilter;
        const matchesService = !serviceFilter || app.service === serviceFilter;
        const matchesProvider = !providerFilter || app.provider === providerFilter;
        return matchesDate && matchesService && matchesProvider;
    });

    container.innerHTML = '';

    if (filteredAppointments.length === 0) {
        container.innerHTML = '<p>No appointments found. Please apply filters to see results.</p>';
    } else {
        filteredAppointments.forEach(appointment => {
            const appointmentElement = document.createElement('div');
            appointmentElement.className = 'appointment-item';
            appointmentElement.innerHTML = `
                <h3>${appointment.service}</h3>
                <p><strong>Provider:</strong> ${appointment.provider}</p>
                <p><strong>Date:</strong> ${appointment.date}</p>
                <p><strong>Time:</strong> ${appointment.time}</p>
                <p><strong>User:</strong> ${appointment.userName}</p>
                <p><strong>Status:</strong> ${appointment.status}</p>
                <div class="appointment-actions">
                    <button class="btn btn-reschedule" onclick="rescheduleAppointment(${appointment.id})">Reschedule</button>
                    <button class="btn btn-cancel" onclick="cancelAppointment(${appointment.id})">Cancel</button>
                </div>
            `;
            container.appendChild(appointmentElement);
        });
    }
}

// Setup event listeners for filters
function setupEventListeners() {
    document.getElementById('apply-filters').addEventListener('click', renderAppointments);
    document.getElementById('filter-service').addEventListener('change', updateProviderDropdown);
}

// Load appointments from local storage
function loadAppointments() {
    appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    // Hide the appointments container initially
    document.getElementById('appointments-container').style.display = 'none';
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadServicesAndProviders();
    loadAppointments();
    setupEventListeners();
});
// Function to set up event listeners for reschedule and cancel buttons
function setupManagementActions() {
    // Reschedule Button
    document.querySelectorAll('.btn-reschedule').forEach(button => {
        button.addEventListener('click', function () {
            const appointmentId = this.closest('.appointment-container').getAttribute('data-id');
            toggleRescheduleForm(appointmentId); // Show/Hide Reschedule Form
        });
    });

    // Cancel Button
    document.querySelectorAll('.btn-cancel').forEach(button => {
        button.addEventListener('click', function () {
            const appointmentId = this.closest('.appointment-container').getAttribute('data-id');
            cancelAppointment(appointmentId); // Cancel the Appointment
        });
    });

    // Save Reschedule Button
    document.querySelectorAll('.btn-save-reschedule').forEach(button => {
        button.addEventListener('click', function () {
            const appointmentId = this.getAttribute('data-id');
            saveReschedule(appointmentId); // Save the rescheduled appointment
        });
    });
}

// Toggle reschedule form visibility
function toggleRescheduleForm(appointmentId) {
    const form = document.querySelector(`.appointment-container[data-id="${appointmentId}"] .reschedule-form`);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// Save rescheduled appointment when 'Save' button is clicked
function saveReschedule(appointmentId) {
    const newDate = document.querySelector(`#reschedule-date-${appointmentId}`).value;
    const newTime = document.querySelector(`#reschedule-time-${appointmentId}`).value;

    // Validate new date and time before saving
    if (!newDate || !newTime) {
        alert('Please select a valid date and time.');
        return;
    }

    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const appointment = appointments.find(app => app.id === parseInt(appointmentId));

    if (appointment) {
        appointment.date = newDate;
        appointment.time = newTime;

        // Update local storage with the rescheduled appointment
        localStorage.setItem('appointments', JSON.stringify(appointments));

        // Re-render appointments on both admin and user pages
        renderUpcomingAppointments();
        renderAppointmentHistory();

        alert('Appointment rescheduled successfully!');
    } else {
        alert('Appointment not found.');
    }
}

// Cancel an appointment
function cancelAppointment(appointmentId) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const appointment = appointments.find(app => app.id === parseInt(appointmentId));

    if (appointment && appointment.status !== 'Cancelled') {
        appointment.status = 'Cancelled';

        // Update local storage with the canceled status
        localStorage.setItem('appointments', JSON.stringify(appointments));

        // Re-render appointments on both admin and user pages
        renderUpcomingAppointments();
        renderAppointmentHistory();

        alert('Appointment cancelled successfully!');
    } else {
        alert('This appointment is already cancelled.');
    }
}

// Render upcoming appointments (Admin & User View)
function renderUpcomingAppointments() {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    let upcomingAppointmentsContainer = document.getElementById('upcoming-appointments-container');
    upcomingAppointmentsContainer.innerHTML = ''; // Clear existing appointments

    appointments.forEach(appointment => {
        if (appointment.status !== 'Cancelled') {
            upcomingAppointmentsContainer.innerHTML += `
                <div class="appointment-container" data-id="${appointment.id}">
                    <p>Service: ${appointment.service}</p>
                    <p>Provider: ${appointment.provider}</p>
                    <p>Date: ${appointment.date}</p>
                    <p>Time: ${appointment.time}</p>
                    <p>Status: ${appointment.status}</p>
                    <button class="btn-reschedule">Reschedule</button>
                    <button class="btn-cancel">Cancel</button>
                    <div class="reschedule-form" style="display:none;">
                        <label for="reschedule-date">New Date:</label>
                        <input type="date" id="reschedule-date-${appointment.id}" value="${appointment.date}">
                        <label for="reschedule-time">New Time:</label>
                        <input type="time" id="reschedule-time-${appointment.id}" value="${appointment.time}">
                        <button class="btn-save-reschedule" data-id="${appointment.id}">Save</button>
                    </div>
                </div>
            `;
        }
    });

    // Reattach event listeners after re-rendering
    setupManagementActions();
}

// Render appointment history (User View)
function renderAppointmentHistory() {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    let historyContainer = document.getElementById('appointment-history-container');
    historyContainer.innerHTML = ''; // Clear existing history

    appointments.forEach(appointment => {
        historyContainer.innerHTML += `
            <div class="appointment-container" data-id="${appointment.id}">
                <p>Service: ${appointment.service}</p>
                <p>Provider: ${appointment.provider}</p>
                <p>Date: ${appointment.date}</p>
                <p>Time: ${appointment.time}</p>
                <p>Status: ${appointment.status}</p>
                <button class="btn-reschedule">Reschedule</button>
                <button class="btn-cancel">Cancel</button>
                <div class="reschedule-form" style="display:none;">
                    <label for="reschedule-date">New Date:</label>
                    <input type="date" id="reschedule-date-${appointment.id}" value="${appointment.date}">
                    <label for="reschedule-time">New Time:</label>
                    <input type="time" id="reschedule-time-${appointment.id}" value="${appointment.time}">
                    <button class="btn-save-reschedule" data-id="${appointment.id}">Save</button>
                </div>
            </div>
        `;
    });

    // Reattach event listeners after re-rendering
    setupManagementActions();
}

// Initialize actions on DOM load
document.addEventListener('DOMContentLoaded', function () {
    renderUpcomingAppointments();  // Render upcoming appointments when page loads
    renderAppointmentHistory();    // Render appointment history when page loads
    setupManagementActions();      // Setup event listeners for buttons
});
