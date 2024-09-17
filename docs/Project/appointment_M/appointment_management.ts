interface Appointment {
    date: string;
    time: string;
    serviceId: string;
    provider: string;
    status: string;
}

interface Service {
    serviceName: string;
    providers: string;
}

function getAppointments(): Appointment[] {
    const appointments: Appointment[] = JSON.parse(localStorage.getItem('appointments') as string) || [];
    return appointments;
}

function populateServiceDropdown(): void {
    const serviceDropdown = document.getElementById('serviceFilter') as HTMLSelectElement;
    const services: Record<string, Service> = JSON.parse(localStorage.getItem('services') as string) || {};

    serviceDropdown.innerHTML = '<option value="">All Services</option>';

    for (const serviceId in services) {
        const service = services[serviceId];
        const option = document.createElement('option');
        option.value = serviceId;
        option.text = service.serviceName;
        serviceDropdown.appendChild(option);
    }
}

function updateProviderDropdown(serviceId: string): void {
    const providerDropdown = document.getElementById('providerFilter') as HTMLSelectElement;
    const services: Record<string, Service> = JSON.parse(localStorage.getItem('services') as string) || {};

    if (serviceId && services[serviceId]) {
        const providers: string[] = services[serviceId].providers.split(', ');

        providerDropdown.innerHTML = '<option value="">All Providers</option>';
        providerDropdown.disabled = false;

        providers.forEach(provider => {
            const option = document.createElement('option');
            option.value = provider;
            option.text = provider;
            providerDropdown.appendChild(option);
        });
    } else {
        providerDropdown.innerHTML = '<option value="">All Providers</option>';
        providerDropdown.disabled = true;
    }
}

function filterAppointments(): void {
    const selectedDate = (document.getElementById('dateFilter') as HTMLInputElement).value;
    const selectedService = (document.getElementById('serviceFilter') as HTMLSelectElement).value;
    const selectedProvider = (document.getElementById('providerFilter') as HTMLSelectElement).value;

    const appointments: Appointment[] = getAppointments();

    const filteredAppointments: Appointment[] = appointments.filter(appointment => {
        const isUpcoming = appointment.status === 'Upcoming';

        const matchesDate = selectedDate ? appointment.date === selectedDate : true;
        const matchesService = selectedService ? appointment.serviceId === selectedService : true;
        const matchesProvider = selectedProvider ? appointment.provider === selectedProvider : true;

        return isUpcoming && matchesDate && matchesService && matchesProvider;
    });

    displayAppointments(filteredAppointments);
}

function displayAppointments(appointments: Appointment[]): void {
    const appointmentsContainer = document.getElementById('appointmentsContainer') as HTMLElement;
    appointmentsContainer.innerHTML = '';

    const activeAppointments: Appointment[] = appointments.filter(appointment => appointment.status !== 'Cancelled' && appointment.status !== 'Availed');

    if (activeAppointments.length === 0) {
        appointmentsContainer.innerHTML = '<p>No upcoming appointments found for the selected filters.</p>';
        return;
    }

    const services: Record<string, Service> = JSON.parse(localStorage.getItem('services') as string) || {};

    activeAppointments.forEach((appointment, index) => {
        const appointmentDiv = document.createElement('div');
        appointmentDiv.classList.add('appointment');

        const service = services[appointment.serviceId];
        const serviceName = service ? service.serviceName : 'Unknown Service';

        appointmentDiv.innerHTML = `
            <p><strong>Date:</strong> ${appointment.date}</p>
            <p><strong>Service ID:</strong> ${appointment.serviceId}</p>
            <p><strong>Service Name:</strong> ${serviceName}</p>
            <p><strong>Provider:</strong> ${appointment.provider}</p>
            <p><strong>Status:</strong> ${appointment.status}</p>
        `;

        const actionButton = document.createElement('button');
        actionButton.innerText = 'Action';
        actionButton.classList.add('action-button');

        appointmentDiv.appendChild(actionButton);

        actionButton.addEventListener('click', () => {
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

            appointmentDiv.appendChild(form);

            form.querySelector('.save-button')?.addEventListener('click', () => {
                const newDate = (document.getElementById(`editDate-${index}`) as HTMLInputElement).value;
                const newTime = (document.getElementById(`editTime-${index}`) as HTMLInputElement).value;
                const newStatus = (document.getElementById(`editStatus-${index}`) as HTMLSelectElement).value;

                appointment.date = newDate;
                appointment.time = newTime;
                appointment.status = newStatus;

                localStorage.setItem('appointments', JSON.stringify(appointments));

                displayAppointments(appointments);
            });
        });

        appointmentsContainer.appendChild(appointmentDiv);
    });
}

const appointments: Appointment[] = JSON.parse(localStorage.getItem('appointments') as string) || [];
displayAppointments(appointments);

document.getElementById('dateFilter')?.addEventListener('change', filterAppointments);
document.getElementById('serviceFilter')?.addEventListener('change', function () {
    updateProviderDropdown(this.value);
    filterAppointments();
});
document.getElementById('providerFilter')?.addEventListener('change', filterAppointments);

populateServiceDropdown();
filterAppointments();