
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

        // Initialize appointments array
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

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
            saveAppointments();
            console.log('Booking submitted:', formData);
            alert('Appointment booked successfully!');
            this.reset();
            renderAppointments();
        });

        // Render appointments
        function renderAppointments() {
            renderUpcomingAppointments();
            renderAppointmentHistory();
        }

        function renderUpcomingAppointments() {
            const appointmentList = document.getElementById('upcoming-appointments');
            appointmentList.innerHTML = '';
            const upcomingAppointments = appointments.filter(app => app.status === 'Upcoming');
            
            if (upcomingAppointments.length === 0) {
                appointmentList.innerHTML = '<p>No upcoming appointments scheduled.</p>';
                return;
            }
            
            upcomingAppointments.forEach(appointment => {
                const appointmentElement = document.createElement('div');
                appointmentElement.className = 'appointment-container';
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
                            <button onclick="toggleReschedule(${appointment.id})" class="btn btn-reschedule">Reschedule</button>
                            <button onclick="cancelAppointment(${appointment.id})" class="btn btn-cancel">Cancel</button>
                        </div>
                    </div>
                    <div class="reschedule-form">
                        <h4>Reschedule Appointment</h4>
                        <div class="form-group">
                            <label for="reschedule-date-${appointment.id}">New Date:</label>
                            <input type="date" id="reschedule-date-${appointment.id}" class="reschedule-date" value="${appointment.date}">
                        </div>
                        <div class="form-group">
                            <label for="reschedule-time-${appointment.id}">New Time:</label>
                            <input type="time" id="reschedule-time-${appointment.id}" class="reschedule-time" value="${appointment.time}">
                        </div>
                        <div class="form-actions">
                            <button onclick="confirmReschedule(${appointment.id})" class="btn btn-confirm">Confirm</button>
                            <button onclick="toggleReschedule(${appointment.id})" class="btn btn-cancel-reschedule">Cancel</button>
                        </div>
                    </div>
                `;
                appointmentList.appendChild(appointmentElement);
            });
        }

        function renderAppointmentHistory() {
            const historyList = document.getElementById('appointment-history');
            historyList.innerHTML = '';
            const pastAppointments = appointments.filter(app => app.status === 'Completed' || app.status === 'Cancelled');
            
            if (pastAppointments.length === 0) {
                historyList.innerHTML = '<p>No past appointments found.</p>';
                return;
            }
            
            pastAppointments.forEach(appointment => {
                const appointmentElement = document.createElement('div');
                appointmentElement.className = 'appointment-container';
                appointmentElement.innerHTML = `
                    <div class="appointment-item">
                        <div class="appointment-details">
                            <h3>${appointment.service}</h3>
                            <p><strong>Provider:</strong> ${appointment.provider}</p>
                            <p><strong>Date:</strong> ${appointment.date}</p>
                            <p><strong>Time:</strong> ${appointment.time}</p>
                            <p><strong>Status:</strong> ${appointment.status}</p>
                        </div>
                    </div>
                `;
                historyList.appendChild(appointmentElement);
            });
        }

        function toggleReschedule(id) {
            const appointmentContainer = document.querySelector(`.appointment-container:has(button[onclick="toggleReschedule(${id})"])`);
            const rescheduleForm = appointmentContainer.querySelector('.reschedule-form');
            rescheduleForm.style.display = rescheduleForm.style.display === 'none' ? 'flex' : 'none';
        }

        function confirmReschedule(id) {
            const appointmentContainer = document.querySelector(`.appointment-container:has(button[onclick="toggleReschedule(${id})"])`);
            const newDate = appointmentContainer.querySelector('.reschedule-date').value;
            const newTime = appointmentContainer.querySelector('.reschedule-time').value;

            const appointment = appointments.find(app => app.id === id);
            if (appointment) {
                appointment.date = newDate;
                appointment.time = newTime;
                saveAppointments();
                
                // Update the appointment details in the UI
                const dateField = appointmentContainer.querySelector('.date-field');
                const timeField = appointmentContainer.querySelector('.time-field');
                dateField.textContent = newDate;
                timeField.textContent = newTime;
                
                // Hide the reschedule form
                toggleReschedule(id);
                
                alert('Appointment rescheduled successfully');
            }
        }

                function cancelAppointment(id) {
            if (confirm('Are you sure you want to cancel this appointment?')) {
                const appointment = appointments.find(app => app.id === id);
                if (appointment) {
                    appointment.status = 'Cancelled';
                    saveAppointments();
                    renderAppointments();
                    alert('Appointment cancelled successfully');
                }
            }
        }

        function saveAppointments() {
            localStorage.setItem('appointments', JSON.stringify(appointments));
        }

        // Tab functionality
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                const tabContent = document.getElementById(`${tabName}-appointments`);
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                tabContent.classList.add('active');
            });
        });

        // Initial setup
        showSection('booking-section');
        renderAppointments(); 

