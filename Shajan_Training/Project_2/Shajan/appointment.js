// Navigation
const navBooking = document.getElementById('nav-booking');
const navManagement = document.getElementById('nav-management');

navBooking.addEventListener('click', () => showSection('booking-section'));
navManagement.addEventListener('click', () => showSection('management-section'));

function showSection(sectionId) {
    document.getElementById('booking-section').style.display = 'none';
    document.getElementById('management-section').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';

    // Update active nav link
    navBooking.classList.remove('active');
    navManagement.classList.remove('active');
    if (sectionId === 'booking-section') {
        navBooking.classList.add('active');
    } else {
        navManagement.classList.add('active');
    }
}

// Initialize empty appointments array
let appointments = [];

// Booking form submission
document.getElementById('booking-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = {
        id: Date.now(), // Use timestamp as a simple unique id
        service: document.getElementById('service').value,
        provider: document.getElementById('provider').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        status: 'Upcoming'
    };
    appointments.push(formData);
    console.log('Booking submitted:', formData);
    alert('Appointment booked successfully!');
    this.reset();
    renderAppointments();
});

// Render appointments
function renderAppointments() {
    const appointmentList = document.getElementById('appointment-list');
    appointmentList.innerHTML = '';
    if (appointments.length === 0) {
        appointmentList.innerHTML = '<p>No appointments scheduled.</p>';
        return;
    }
    appointments.forEach(appointment => {
        const appointmentElement = document.createElement('div');
        appointmentElement.className = 'appointment-item';
        appointmentElement.innerHTML = `
            <div class="appointment-details">
                <h3>${appointment.service}</h3>
                <p><strong>Provider:</strong> ${appointment.provider}</p>
                <p><strong>Date:</strong> ${appointment.date}</p>
                <p><strong>Time:</strong> ${appointment.time}</p>
                <p><strong>Status:</strong> ${appointment.status}</p>
            </div>
            <div class="appointment-actions">
                <button onclick="rescheduleAppointment(${appointment.id})">Reschedule</button>
                <button onclick="cancelAppointment(${appointment.id})" style="background-color: #e74c3c;">Cancel</button>
            </div>
        `;
        appointmentList.appendChild(appointmentElement);
    });
}

function rescheduleAppointment(id) {
    console.log('Reschedule appointment:', id);
    alert('Reschedule functionality not implemented');
}

function cancelAppointment(id) {
    console.log('Cancel appointment:', id);
    appointments = appointments.filter(appointment => appointment.id !== id);
    renderAppointments();
    alert('Appointment cancelled successfully');
}

// Initial setup
showSection('booking-section');
renderAppointments();