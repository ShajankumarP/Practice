// JavaScript to switch sections when sidebar links are clicked
const links = document.querySelectorAll('.sidebar a');
const sections = document.querySelectorAll('.section');

links.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();

    // Remove 'active' class from all sections
    sections.forEach(section => section.classList.remove('active'));

    // Add 'active' class to the clicked section
    const sectionId = this.getAttribute('data-section');
    document.getElementById(sectionId).classList.add('active');
  });
  link.addEventListener('click', function(e) {
    // Check if the link is for logout
    if (this.getAttribute('data-section') === 'logout') {
        window.location.href='Project/index.html';
    }
  });  
});
function generateReport() {
  const reportType = document.getElementById('reportType').value;
  let startDate = document.getElementById('startDate').value;
  let endDate = document.getElementById('endDate').value;
  const reportResults = document.getElementById('reportResults');

  // Clear previous report results
  reportResults.innerHTML = '';

  // Fetch appointments data from localStorage
  const appointments = JSON.parse(localStorage.getItem('appointments')) || [];

  if (appointments.length === 0) {
    reportResults.innerHTML = '<p>No data available for the selected report.</p>';
    return;
  }

  // Set the default start date to the earliest appointment date if not provided
  if (!startDate) {
    const earliestAppointment = appointments.reduce((earliest, appointment) => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate < earliest ? appointmentDate : earliest;
    }, new Date());
    startDate = earliestAppointment.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
  }

  // Set the default end date to today if not provided
  if (!endDate) {
    endDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
  }

  // Validate date range (start date should not be later than end date)
  if (new Date(startDate) > new Date(endDate)) {
    alert('Please select a valid date range.');
    return;
  }

  let reportData = [];

  // Filter appointments by the selected date range
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate >= new Date(startDate) && appointmentDate <= new Date(endDate);
  });

  // Generate report based on the selected type
  switch (reportType) {
    case 'appointmentHistory':
      reportData = generateAppointmentHistory(filteredAppointments);
      break;
    case 'userActivity':
      reportData = generateUserActivity(filteredAppointments);
      break;
    case 'servicePopularity':
      reportData = generateServicePopularity(filteredAppointments);
      break;
  }

  // Display the report
  reportResults.innerHTML = reportData.join('');
}

function generateAppointmentHistory(appointments) {
  if (appointments.length === 0) {
    return ['<p>No appointments found in the selected date range.</p>'];
  }

  const report = appointments.map(appointment => {
    return `
      <p>
        <strong>Date:</strong> ${appointment.date} <br>
        <strong>Time:</strong> ${appointment.time} <br>
        <strong>Provider:</strong> ${appointment.provider} <br>
        <strong>Service:</strong> ${getServiceNameById(appointment.serviceId)} <br>
        <strong>Status:</strong> ${appointment.status}
      </p>
      <hr>
    `;
  });
  return report;
}

function generateUserActivity(appointments) {
  const userActivity = {};
  
  appointments.forEach(appointment => {
    const userName = appointment.userName || 'Unknown User';
    if (!userActivity[userName]) {
      userActivity[userName] = { booked: 0, canceled: 0, completed: 0 };
    }
    if (appointment.status === 'Availed') {
      userActivity[userName].completed++;
    } else if (appointment.status === 'Cancelled') {
      userActivity[userName].canceled++;
    } else {
      userActivity[userName].booked++;
    }
  });

  const report = Object.keys(userActivity).map(user => {
    return `
      <p>
        <strong>User:</strong> ${user} <br>
        <strong>Booked:</strong> ${userActivity[user].booked} <br>
        <strong>Cancelled:</strong> ${userActivity[user].canceled} <br>
        <strong>Completed:</strong> ${userActivity[user].completed}
      </p>
      <hr>
    `;
  });

  return report.length ? report : ['<p>No user activity found in the selected date range.</p>'];
}

function generateServicePopularity(appointments) {
  const servicePopularity = {};

  appointments.forEach(appointment => {
    const serviceName = getServiceNameById(appointment.serviceId);
    if (!servicePopularity[serviceName]) {
      servicePopularity[serviceName] = 0;
    }
    servicePopularity[serviceName]++;
  });

  const report = Object.keys(servicePopularity).map(service => {
    return `
      <p>
        <strong>Service:</strong> ${service} <br>
        <strong>Bookings:</strong> ${servicePopularity[service]}
      </p>
      <hr>
    `;
  });

  return report.length ? report : ['<p>No service popularity data available for the selected date range.</p>'];
}

function getServiceNameById(serviceId) {
  const services = JSON.parse(localStorage.getItem('services')) || {};
  return services[serviceId] ? services[serviceId].serviceName : 'Unknown Service';
}

document.addEventListener('DOMContentLoaded', function () {
  // Fetch data from localStorage
  const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
  const services = JSON.parse(localStorage.getItem('services')) || {};
  
  console.log('Appointments:', appointments);
  console.log('Services:', services);

  // Utility function to format the date to 'YYYY-MM-DD'
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'
  };

  // Display Upcoming Appointments
  const upcomingAppointmentsContainer = document.getElementById('upcoming-appointments-container');
  const today = new Date();

  // Filter upcoming appointments (date greater than today and status not 'Cancelled')
  const upcomingAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate > today && appointment.status === 'Upcoming' ;
  });

  console.log('Upcoming Appointments:', upcomingAppointments);

  if (upcomingAppointments.length > 0) {
    upcomingAppointments.forEach(appointment => {
      const appointmentElement = document.createElement('p');
      appointmentElement.textContent = `Service: ${services[appointment.serviceId]?.serviceName || 'Unknown'}, 
                                        Provider: ${appointment.provider || 'Unknown'}, 
                                        Date: ${formatDate(appointment.date)}, 
                                        Time: ${appointment.time || 'N/A'}`;
      upcomingAppointmentsContainer.appendChild(appointmentElement);
    });
  } else {
    upcomingAppointmentsContainer.innerHTML = '<p>No upcoming appointments</p>';
  }


// Prepare data for bar chart
const serviceStats = {};

// Count how many times each service was booked
appointments.forEach(appointment => {
  const serviceId = appointment.serviceId;
  if (serviceStats[serviceId]) {
    serviceStats[serviceId]++;
  } else {
    serviceStats[serviceId] = 1;
  }
});

const labels = [];
const data = [];

Object.keys(serviceStats).forEach(serviceId => {
  labels.push(services[serviceId]?.serviceName || 'Unknown');
  data.push(serviceStats[serviceId]);
});

// Create the bar chart
const ctx = document.getElementById('service-stats-chart').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: labels,
    datasets: [{
      label: 'Number of Bookings',
      data: data,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1 // Set the step size for y-axis ticks to 1
        }
      }
    }
  }
});

  // Display Recent User Activity
  const userActivityContainer = document.getElementById('user-activity-container');
  const recentActivities = appointments.slice(-5).reverse(); // Get the 5 most recent activities

  if (recentActivities.length > 0) {
    recentActivities.forEach(activity => {
      const activityElement = document.createElement('p');
      const serviceName = services[activity.serviceId]?.serviceName || 'Unknown';
      const action = activity.status === 'Cancelled' ? 'canceled' : 'booked';
      activityElement.textContent = `User: ${activity.userName || 'Unknown'} ${action} an appointment for ${serviceName} on ${formatDate(activity.date)} at ${activity.time || 'N/A'}`;
      userActivityContainer.appendChild(activityElement);
    });
  } else {
    userActivityContainer.innerHTML += '<p>No recent activity</p>';
  }
});

// admin.js

document.addEventListener('DOMContentLoaded', function () {
  // Add click event listener to the "Logout" link
  const logoutLink = document.querySelector('a[data-section="logout"]');

  if (logoutLink) {
      logoutLink.addEventListener('click', function (event) {
          // Prevent the default link behavior
          event.preventDefault();
          // Redirect to index.html
          window.location.href = '/Project/index.html';
      });
  }

  // Function to handle section visibility based on clicked links
  document.querySelectorAll('.sidebar a').forEach(link => {
      link.addEventListener('click', function () {
          const sectionId = this.getAttribute('data-section');
          document.querySelectorAll('.section').forEach(section => {
              section.classList.remove('active');
          });
          document.getElementById(sectionId).classList.add('active');
      });
  });
});
