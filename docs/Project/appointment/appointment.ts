let appointments: Array<{ id: number; serviceId: string; provider: string; date: string; time: string; userName: string; status: string }> = [];

document.addEventListener('DOMContentLoaded', () => {
    function toggleSection(sectionId: string): void {
        document.getElementById('booking-section')!.style.display = 'none';
        document.getElementById('management-section')!.style.display = 'none';
        document.getElementById(sectionId)!.style.display = 'block';
    }

    function switchTab(tabName: string): void {
        document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        document.querySelector(`.tab-button[data-tab="${tabName}"]`)!.classList.add('active');
        document.getElementById(`${tabName}-appointments`)!.classList.add('active');
    }

    document.getElementById('nav-booking')!.addEventListener('click', (event: MouseEvent) => {
        event.preventDefault();
        toggleSection('booking-section');
    });

    document.getElementById('nav-management')!.addEventListener('click', (event: MouseEvent) => {
        event.preventDefault();
        toggleSection('management-section');
    });

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (event: MouseEvent) => {
            const tabName = (event.target as HTMLElement).getAttribute('data-tab')!;
            switchTab(tabName);
        });
    });

    toggleSection('booking-section');
    switchTab('upcoming');
});

function loadServices(): void {
    const serviceSelect = document.getElementById('service') as HTMLSelectElement;
    const services: Record<string, { serviceName: string; providers: string }> = JSON.parse(localStorage.getItem('services') || '{}');
    sessionStorage.setItem('userServices', JSON.stringify(services));

    serviceSelect.innerHTML = '<option value="">Select a service</option>';
    Object.keys(services).forEach(id => {
        const service = services[id];
        const option = document.createElement('option');
        option.value = id;
        option.textContent = service.serviceName;
        serviceSelect.appendChild(option);
    });

    serviceSelect.addEventListener('change', function () {
        const selectedServiceId = this.value;
        const selectedService = services[selectedServiceId];
        const providers = selectedService ? selectedService.providers.split(', ') : [];
        updateProviderDropdown(providers);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const bookingSection = document.getElementById('booking-section')!;
    const managementSection = document.getElementById('management-section')!;
    
    const navBooking = document.getElementById('nav-booking')!;
    const navManagement = document.getElementById('nav-management')!;

    bookingSection.style.display = 'block';
    navBooking.classList.add('active');

    navBooking.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        bookingSection.style.display = 'block';
        managementSection.style.display = 'none';

        navBooking.classList.add('active');
        navManagement.classList.remove('active');
    });

    navManagement.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        bookingSection.style.display = 'none';
        managementSection.style.display = 'block';

        navManagement.classList.add('active');
        navBooking.classList.remove('active');
    });
});

loadServices();

function setupEventListeners(): void {
    document.getElementById('booking-form')!.addEventListener('submit', bookAppointment);
    document.getElementById('nav-booking')!.addEventListener('click', () => toggleSection('booking-section'));
    document.getElementById('nav-management')!.addEventListener('click', () => toggleSection('management-section'));

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function () {
            switchTab(this.dataset.tab!);
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
        const userName = localStorage.getItem('userName');
        if (userName) {
            const userNameField = document.getElementById('user-name') as HTMLInputElement;
            userNameField.value = userName;
            userNameField.setAttribute('readonly', 'true');
        }
    });
}

function updateProviderDropdown(providers: string[]): void {
    const providerSelect = document.getElementById('provider') as HTMLSelectElement;
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

function loadAvailability(serviceId: string): any {
    const serviceAvailability: Record<string, any> = JSON.parse(localStorage.getItem('serviceAvailability') || '{}');
    return serviceAvailability[serviceId] || null;
}

function validateAvailability(date: string, availability: any): { isValid: boolean; dateError: string } {
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

    if (blackoutPeriods && typeof blackoutPeriods === 'string') {
        const blackoutRanges = blackoutPeriods.split(',');
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

function bookAppointment(event: Event): void {
    event.preventDefault();

    const serviceId = (document.getElementById('service') as HTMLSelectElement).value;
    const provider = (document.getElementById('provider') as HTMLSelectElement).value;
    const date = (document.getElementById('date') as HTMLInputElement).value;
    const time = (document.getElementById('time') as HTMLInputElement).value;
    const userName = localStorage.getItem('userName')!;
    
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

    const userHasAppointment = appointments.some(app => 
        app.userName === userName && 
        app.date === date && 
        app.status !== 'Cancelled'
    );
    if (userHasAppointment) {
        alert('You already have an appointment booked for this date.');
        return;
    }

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
        serviceId,
        provider,
        date,
        time,
        userName,
        status: 'Upcoming'
    };

    appointments.push(newAppointment);
    saveAppointments();
    renderUpcomingAppointments();
    (document.getElementById('booking-form') as HTMLFormElement).reset();
    alert('Appointment booked successfully');
}

function saveAppointments(): void {
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

function renderUpcomingAppointments(): void {
    const appointmentList = document.getElementById('upcoming-appointments')!;
    appointmentList.innerHTML = '';

    appointments.filter(app => app.status === 'Upcoming' && app.userName === localStorage.getItem('userName')).forEach(appointment => {
        const service = JSON.parse(localStorage.getItem('services') || '{}')[appointment.serviceId];
        const appointmentElement = document.createElement('div');
        appointmentElement.className = 'appointment-container';
        appointmentElement.setAttribute('data-id', appointment.id.toString());
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

        appointmentElement.querySelector('.btn-reschedule')!.addEventListener('click', () => toggleRescheduleForm(appointment.id));
        appointmentElement.querySelector('.btn-cancel')!.addEventListener('click', () => cancelAppointment(appointment.id));
        appointmentElement.querySelector('.btn-save')!.addEventListener('click', () => saveReschedule(appointment.id));
        appointmentElement.querySelector('.btn-cancel-reschedule')!.addEventListener('click', () => toggleRescheduleForm(appointment.id));
    });
}

function toggleRescheduleForm(id: number, forceClose: boolean = false): void {
    const form = document.querySelector(`.appointment-container[data-id="${id}"] .reschedule-form`) as HTMLDivElement;
    if (forceClose) {
        form.style.display = 'none';
    } else {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
}

function saveReschedule(appointmentId: number): void {
    const newDate = (document.getElementById(`reschedule-date-${appointmentId}`) as HTMLInputElement).value;
    const newTime = (document.getElementById(`reschedule-time-${appointmentId}`) as HTMLInputElement).value;

    const appointment = appointments.find(app => app.id === appointmentId);
    if (appointment) {
        const availability = loadAvailability(appointment.serviceId);
        const { isValid, dateError } = validateAvailability(newDate, availability);

        if (!isValid) {
            if (dateError) alert(dateError);
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

        appointment.date = newDate;
        appointment.time = newTime;

        saveAppointments();
        renderUpcomingAppointments();
        toggleRescheduleForm(appointmentId, true);
    }
}

function cancelAppointment(appointmentId: number): void {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (appointment) {
        appointment.status = 'Cancelled';
        saveAppointments();
        renderUpcomingAppointments();
    }
}

function loadAppointmentsFromLocalStorage(): void {
    appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
}

function loadServicesMap(): Record<string, string> {
    const services = JSON.parse(localStorage.getItem('services') || '{}');
    const servicesMap: Record<string, string> = {};
    for (const [id, service] of Object.entries(services)) {
        servicesMap[id] = service.serviceName;
    }
    return servicesMap;
}

function renderAppointmentHistory(): void {
    const historyTableBody = document.querySelector('#history-table tbody')!;
    historyTableBody.innerHTML = '';

    const currentUser = localStorage.getItem('userName')!;
    const appointments: Array<{ serviceId: string; provider: string; date: string; time: string; status: string; userName: string }> = JSON.parse(localStorage.getItem('appointments') || '[]');
    const servicesMap = loadServicesMap();

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
    loadAppointmentsFromLocalStorage();
    renderUpcomingAppointments();
    renderAppointmentHistory();
    loadServices();

    document.getElementById('nav-booking')!.addEventListener('click', () => toggleSection('booking-section'));
    document.getElementById('nav-management')!.addEventListener('click', () => toggleSection('management-section'));

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function () {
            switchTab(this.dataset.tab!);
        });
    });

    document.getElementById('booking-form')!.addEventListener('submit', bookAppointment);
});

document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName');
    if (userName) {
        const userNameField = document.getElementById('user-name') as HTMLInputElement;
    }
});

document.getElementById('booking-form')!.addEventListener('submit', function(event: Event) {
    event.preventDefault();

    const service = (document.getElementById('service') as HTMLSelectElement).value;
    const provider = (document.getElementById('provider') as HTMLSelectElement).value;
    const date = (document.getElementById('date') as HTMLInputElement).value;
    const time = (document.getElementById('time') as HTMLInputElement).value;

    const bookingData = {
        service: service,
        provider: provider,
        date: date,
        time: time,
    };

    let bookings: Array<{ service: string; provider: string; date: string; time: string }> = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(bookingData);
    localStorage.setItem('bookings', JSON.stringify(bookings));
});

function initializeBookingSystem(): void {
    loadServices();
    loadAppointmentsFromLocalStorage();
    renderUpcomingAppointments();
    renderAppointmentHistory(); 
    document.getElementById('booking-form')!.addEventListener('submit', bookAppointment);
}

document.addEventListener('DOMContentLoaded', initializeBookingSystem);