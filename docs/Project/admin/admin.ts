const links: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('.sidebar a');
const sections: NodeListOf<HTMLElement> = document.querySelectorAll('.section');

links.forEach(link => {
  link.addEventListener('click', function(e: MouseEvent) {
    e.preventDefault();

    sections.forEach(section => section.classList.remove('active'));

    const sectionId: string | null = this.getAttribute('data-section');
    if (sectionId) {
      const section: HTMLElement | null = document.getElementById(sectionId);
      section?.classList.add('active');
    }
  });
  link.addEventListener('click', function(e: MouseEvent) {
    if (this.getAttribute('data-section') === 'logout') {
        window.location.href='Project/index.html';
    }
  });  
});

function generateReport(): void {
  const reportType: string = (document.getElementById('reportType') as HTMLSelectElement).value;
  let startDate: string = (document.getElementById('startDate') as HTMLInputElement).value;
  let endDate: string = (document.getElementById('endDate') as HTMLInputElement).value;
  const reportResults: HTMLElement = document.getElementById('reportResults') as HTMLElement;

  reportResults.innerHTML = '';

  const appointments: Array<{ date: string; time: string; provider: string; serviceId: string; status: string; userName?: string }> = JSON.parse(localStorage.getItem('appointments') || '[]');

  if (appointments.length === 0) {
    reportResults.innerHTML = '<p>No data available for the selected report.</p>';
    return;
  }

  if (!startDate) {
    const earliestAppointment: Date = appointments.reduce((earliest: Date, appointment: { date: string }) => {
      const appointmentDate: Date = new Date(appointment.date);
      return appointmentDate < earliest ? appointmentDate : earliest;
    }, new Date());
    startDate = earliestAppointment.toISOString().split('T')[0];
  }

  if (!endDate) {
    endDate = new Date().toISOString().split('T')[0];
  }

  if (new Date(startDate) > new Date(endDate)) {
    alert('Please select a valid date range.');
    return;
  }

  let reportData: string[] = [];

  const filteredAppointments: Array<{ date: string; time: string; provider: string; serviceId: string; status: string; userName?: string }> = appointments.filter(appointment => {
    const appointmentDate: Date = new Date(appointment.date);
    return appointmentDate >= new Date(startDate) && appointmentDate <= new Date(endDate);
  });

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

  reportResults.innerHTML = reportData.join('');
}

function generateAppointmentHistory(appointments: Array<{ date: string; time: string; provider: string; serviceId: string; status: string }>): string[] {
  if (appointments.length === 0) {
    return ['<p>No appointments found in the selected date range.</p>'];
  }

  const report: string[] = appointments.map(appointment => {
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

function generateUserActivity(appointments: Array<{ userName?: string; status: string }>): string[] {
  const userActivity: { [key: string]: { booked: number; canceled: number; completed: number } } = {};
  
  appointments.forEach(appointment => {
    const userName: string = appointment.userName || 'Unknown User';
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

  const report: string[] = Object.keys(userActivity).map(user => {
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

function generateServicePopularity(appointments: Array<{ serviceId: string }>): string[] {
  const servicePopularity: { [key: string]: number } = {};

  appointments.forEach(appointment => {
    const serviceName: string = getServiceNameById(appointment.serviceId);
    if (!servicePopularity[serviceName]) {
      servicePopularity[serviceName] = 0;
    }
    servicePopularity[serviceName]++;
  });

  const report: string[] = Object.keys(servicePopularity).map(service => {
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

function getServiceNameById(serviceId: string): string {
  const services: { [key: string]: { serviceName: string } } = JSON.parse(localStorage.getItem('services') || '{}');
  return services[serviceId] ? services[serviceId].serviceName : 'Unknown Service';
}

document.addEventListener('DOMContentLoaded', function () {
  const appointments: Array<{ date: string; time: string; provider: string; serviceId: string; status: string; userName?: string }> = JSON.parse(localStorage.getItem('appointments') || '[]');
  const services: { [key: string]: { serviceName: string } } = JSON.parse(localStorage.getItem('services') || '{}');
  
  console.log('Appointments:', appointments);
  console.log('Services:', services);

  const formatDate = (dateStr: string): string => {
    const date: Date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const upcomingAppointmentsContainer: HTMLElement = document.getElementById('upcoming-appointments-container') as HTMLElement;
  const today: Date = new Date();

  const upcomingAppointments: Array<{ serviceId: string; provider: string; date: string; time: string; status: string }> = appointments.filter(appointment => {
    const appointmentDate: Date = new Date(appointment.date);
    return appointmentDate > today && appointment.status === 'Upcoming';
  });

  console.log('Upcoming Appointments:', upcomingAppointments);

  if (upcomingAppointments.length > 0) {
    upcomingAppointments.forEach(appointment => {
      const appointmentElement: HTMLParagraphElement = document.createElement('p');
      appointmentElement.textContent = `Service: ${services[appointment.serviceId]?.serviceName || 'Unknown'}, 
                                        Provider: ${appointment.provider || 'Unknown'}, 
                                        Date: ${formatDate(appointment.date)}, 
                                        Time: ${appointment.time || 'N/A'}`;
      upcomingAppointmentsContainer.appendChild(appointmentElement);
    });
  } else {
    upcomingAppointmentsContainer.innerHTML = '<p>No upcoming appointments</p>';
  }

  const serviceStats: { [key: string]: number } = {};

  appointments.forEach(appointment => {
    const serviceId: string = appointment.serviceId;
    if (serviceStats[serviceId]) {
      serviceStats[serviceId]++;
    } else {
      serviceStats[serviceId] = 1;
    }
  });

  const labels: string[] = [];
  const data: number[] = [];

  Object.keys(serviceStats).forEach(serviceId => {
    labels.push(services[serviceId]?.serviceName || 'Unknown');
    data.push(serviceStats[serviceId]);
  });

  const ctx: CanvasRenderingContext2D = (document.getElementById('service-stats-chart') as HTMLCanvasElement).getContext('2d')!;
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
            stepSize: 1
          }
        }
      }
    }
  });

  const userActivityContainer: HTMLElement = document.getElementById('user-activity-container') as HTMLElement;
  const recentActivities: Array<{ userName?: string; serviceId: string; date: string; time: string; status: string }> = appointments.slice(-5).reverse();

  if (recentActivities.length > 0) {
    recentActivities.forEach(activity => {
      const activityElement: HTMLParagraphElement = document.createElement('p');
      const serviceName: string = services[activity.serviceId]?.serviceName || 'Unknown';
      const action: string = activity.status === 'Cancelled' ? 'canceled' : 'booked';
      activityElement.textContent = `User: ${activity.userName || 'Unknown'} ${action} an appointment for ${serviceName} on ${formatDate(activity.date)} at ${activity.time || 'N/A'}`;
      userActivityContainer.appendChild(activityElement);
    });
  } else {
    userActivityContainer.innerHTML += '<p>No recent activity</p>';
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const logoutLink: HTMLAnchorElement | null = document.querySelector('a[data-section="logout"]');

  if (logoutLink) {
      logoutLink.addEventListener('click', function (event: MouseEvent) {
          event.preventDefault();
          window.location.href = '/Project/index.html';
      });
  }

  document.querySelectorAll('.sidebar a').forEach(link => {
      link.addEventListener('click', function () {
          const sectionId: string | null = this.getAttribute('data-section');
          document.querySelectorAll('.section').forEach(section => {
              section.classList.remove('active');
          });
          const section: HTMLElement | null = document.getElementById(sectionId);
          section?.classList.add('active');
      });
  });
});