// Function to retrieve appointments from local storage
function getAppointments() {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    return appointments;
}

// Function to populate the service dropdown from local storage
function populateServiceDropdown() {
    const serviceDropdown = document.getElementById('serviceFilter');
    const services = JSON.parse(localStorage.getItem('services'));

    // Clear existing options
    serviceDropdown.innerHTML = '<option value="">All Services</option>';

    // Populate service dropdown
    for (const serviceId in services) {
        const service = services[serviceId];
        const option = document.createElement('option');
        option.value = serviceId;
        option.text = service.serviceName;
        serviceDropdown.appendChild(option);
    }
}

// Function to update provider dropdown based on selected service
function updateProviderDropdown(serviceId) {
    const providerDropdown = document.getElementById('providerFilter');
    const services = JSON.parse(localStorage.getItem('services'));

    // Get the selected service's providers
    if (serviceId && services[serviceId]) {
        const providers = services[serviceId].providers.split(', ');

        // Clear existing options
        providerDropdown.innerHTML = '<option value="">All Providers</option>';
        providerDropdown.disabled = false; // Enable provider dropdown

        // Populate provider dropdown
        providers.forEach(provider => {
            const option = document.createElement('option');
            option.value = provider;
            option.text = provider;
            providerDropdown.appendChild(option);
        });
    } else {
        // Reset provider dropdown if no valid service is selected
        providerDropdown.innerHTML = '<option value="">All Providers</option>';
        providerDropdown.disabled = true; // Disable provider dropdown
    }
}

// Function to filter appointments based on the selected criteria
function filterAppointments() {
    const selectedDate = document.getElementById('dateFilter').value;
    const selectedService = document.getElementById('serviceFilter').value;
    const selectedProvider = document.getElementById('providerFilter').value;

    const appointments = getAppointments();

    // Filter appointments based on selected criteria
    const filteredAppointments = appointments.filter(appointment => {
        const isUpcoming = appointment.status === 'Upcoming';

        const matchesDate = selectedDate ? appointment.date === selectedDate : true;
        const matchesService = selectedService ? appointment.serviceId === selectedService : true;
        const matchesProvider = selectedProvider ? appointment.provider === selectedProvider : true;

        return isUpcoming && matchesDate && matchesService && matchesProvider;
    });

    // Display the filtered appointments
    displayAppointments(filteredAppointments);
}

// Function to display appointments
function displayAppointments(appointments) {
    const appointmentsContainer = document.getElementById('appointmentsContainer');
    appointmentsContainer.innerHTML = ''; // Clear previous content

    // Filter out cancelled and availed appointments before rendering
    const activeAppointments = appointments.filter(appointment => appointment.status !== 'Cancelled' && appointment.status !== 'Availed');

    if (activeAppointments.length === 0) {
        appointmentsContainer.innerHTML = '<p>No upcoming appointments found for the selected filters.</p>';
        return;
    }

    // Retrieve services from localStorage
    const services = JSON.parse(localStorage.getItem('services')) || {};

    activeAppointments.forEach((appointment, index) => {
        const appointmentDiv = document.createElement('div');
        appointmentDiv.classList.add('appointment');

        // Get the service name using serviceId from the services object
        const service = services[appointment.serviceId];
        const serviceName = service ? service.serviceName : 'Unknown Service';

        // Populate the div with appointment details
        appointmentDiv.innerHTML = `
            <p><strong>Date:</strong> ${appointment.date}</p>
            <p><strong>Service ID:</strong> ${appointment.serviceId}</p>
            <p><strong>Service Name:</strong> ${serviceName}</p>
            <p><strong>Provider:</strong> ${appointment.provider}</p>
            <p><strong>Status:</strong> ${appointment.status}</p>
        `;

        // Create the action button
        const actionButton = document.createElement('button');
        actionButton.innerText = 'Action';
        actionButton.classList.add('action-button');
        
        // Append the action button below the appointment details
        appointmentDiv.appendChild(actionButton);

        // Event listener for button click
        actionButton.addEventListener('click', () => {
            // Display an editable form for date, time, and status
            const form = document.createElement('div');
            form.classList.add('edit-form');

            form.innerHTML = `
                <label>Date: <input type="date" value="${appointment.date}" id="editDate-${index}" /></label>
                <label>Time: <input type="time" value="${appointment.time}" id="editTime-${index}" /></label>
                <label>Status: 
                    <select id="editStatus-${index}">
                        <option value="Confirmed" ${appointment.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Availed" ${appointment.status === 'Availed' ? 'selected' : ''}>Availed</option>
                        <option value="Cancelled" ${appointment.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </label>
                <button class="save-button">Save Changes</button>
            `;

            // Append the form to the appointmentDiv
            appointmentDiv.appendChild(form);

            // Handle save button click
            form.querySelector('.save-button').addEventListener('click', () => {
                // Get new values
                const newDate = document.getElementById(`editDate-${index}`).value;
                const newTime = document.getElementById(`editTime-${index}`).value;
                const newStatus = document.getElementById(`editStatus-${index}`).value;

                // Update the appointment details
                appointment.date = newDate;
                appointment.time = newTime;
                appointment.status = newStatus;

                // Update appointments in localStorage
                localStorage.setItem('appointments', JSON.stringify(appointments));

                // Re-render appointments to reflect the updated data
                displayAppointments(appointments);
            });
        });

        // Append the complete appointmentDiv to the container
        appointmentsContainer.appendChild(appointmentDiv);
    });
}

// Initial call to display appointments
const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
displayAppointments(appointments);


// Event listeners for filtering
document.getElementById('dateFilter').addEventListener('change', filterAppointments);
document.getElementById('serviceFilter').addEventListener('change', function () {
    updateProviderDropdown(this.value); // Update providers when a service is selected
    filterAppointments(); // Re-filter appointments
});
document.getElementById('providerFilter').addEventListener('change', filterAppointments);

// Initial population of service dropdown and appointments
populateServiceDropdown();
filterAppointments();
