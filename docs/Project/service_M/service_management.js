        // Function to switch between tabs
        function showTab(tabIndex) {
            const tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => tab.classList.remove('active'));

            const tabButtons = document.querySelectorAll('.tab');
            tabButtons.forEach(button => button.classList.remove('active'));

            document.getElementById(`tabContent${tabIndex}`).classList.add('active');
            tabButtons[tabIndex].classList.add('active');
        }

        // Initialize services and availability from localStorage
        let services = JSON.parse(localStorage.getItem('services')) || {};
        let serviceAvailability = JSON.parse(localStorage.getItem('serviceAvailability')) || {};

        // Function to display services
        function displayServices() {
            const serviceList = document.getElementById('serviceList');
            serviceList.innerHTML = '';
            for (const key in services) {
                if (services.hasOwnProperty(key)) {
                    const service = services[key];
                    const serviceItem = document.createElement('li');
                    serviceItem.className = 'service-item';
                    serviceItem.innerHTML = `
                        <strong>${service.serviceName}</strong>
                        <p>Description: ${service.description}</p>
                        <p>Duration: ${service.duration} minutes</p>
                        <p>Price: $${service.price}</p>
                        <p>Providers: ${service.providers}</p>
                        <button onclick="editService('${key}')">Edit</button>
                        <button onclick="deleteService('${key}')">Delete</button>
                    `;
                    serviceList.appendChild(serviceItem);
                }
            }
        }

// Function to handle service form submission
document.getElementById('serviceForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const serviceName = document.getElementById('serviceName').value.trim();
    const description = document.getElementById('description').value.trim();
    const duration = document.getElementById('duration').value;
    const price = document.getElementById('price').value;
    const providers = document.getElementById('providers').value.trim();

    // Validate if the service name already exists
    const isDuplicate = Object.values(services).some(service => service.serviceName.toLowerCase() === serviceName.toLowerCase());
    
    if (isDuplicate) {
        alert('Service name already exists. Please choose a different name.');
        return;
    }

    // Proceed with adding the service if validation passes
    const serviceKey = Date.now().toString(); // Generate unique key

    services[serviceKey] = {
        serviceName,
        description,
        duration,
        price,
        providers
    };

    localStorage.setItem('services', JSON.stringify(services));
    displayServices();
    populateServiceDropdown(); // Update dropdown for availability tab
    document.getElementById('serviceForm').reset();
});


        // Function to handle service deletion
        function deleteService(serviceKey) {
            if (confirm('Are you sure you want to delete this service?')) {
                delete services[serviceKey];
                delete serviceAvailability[serviceKey]; // Remove associated availability
                localStorage.setItem('services', JSON.stringify(services));
                localStorage.setItem('serviceAvailability', JSON.stringify(serviceAvailability));
                displayServices();
                populateServiceDropdown(); // Update dropdown for availability tab
            }
        }

        // Function to handle service editing
        function editService(serviceKey) {
            const service = services[serviceKey];
            document.getElementById('editServiceName').value = service.serviceName;
            document.getElementById('editDescription').value = service.description;
            document.getElementById('editDuration').value = service.duration;
            document.getElementById('editPrice').value = service.price;
            document.getElementById('editProviders').value = service.providers;
            document.getElementById('editServiceForm').onsubmit = function(event) {
                event.preventDefault();
                services[serviceKey] = {
                    serviceName: document.getElementById('editServiceName').value,
                    description: document.getElementById('editDescription').value,
                    duration: document.getElementById('editDuration').value,
                    price: document.getElementById('editPrice').value,
                    providers: document.getElementById('editProviders').value
                };
                localStorage.setItem('services', JSON.stringify(services));
                displayServices();
                closeEditForm();
            };
            document.getElementById('editServiceOverlay').classList.add('active');
        }

        // Function to close the edit form overlay
        function closeEditForm() {
            document.getElementById('editServiceOverlay').classList.remove('active');
        }

        // Populate the service dropdown in the availability tab
        function populateServiceDropdown() {
            const availabilityServiceSelect = document.getElementById('availabilityService');
            availabilityServiceSelect.innerHTML = ''; // Clear existing options
            for (const key in services) {
                if (services.hasOwnProperty(key)) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = services[key].serviceName;
                    availabilityServiceSelect.appendChild(option);
                }
            }
        }

        // Display service availability based on selected service
        function displayServiceAvailability() {
            const availabilityServiceSelect = document.getElementById('availabilityService');
            const selectedServiceKey = availabilityServiceSelect.value;
            const availability = serviceAvailability[selectedServiceKey] || {};

            document.getElementById('availabilityStart').value = availability.availabilityStart || '';
            document.getElementById('availabilityEnd').value = availability.availabilityEnd || '';
            document.getElementById('availabilityTimes').value = availability.availabilityTimes || '';
            document.getElementById('blackoutPeriods').value = availability.blackoutPeriods || '';
        }

        // Handle availability form submission
        document.getElementById('availabilityForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const selectedServiceKey = document.getElementById('availabilityService').value;
            const availability = {
                availabilityStart: document.getElementById('availabilityStart').value,
                availabilityEnd: document.getElementById('availabilityEnd').value,
                availabilityTimes: document.getElementById('availabilityTimes').value,
                blackoutPeriods: document.getElementById('blackoutPeriods').value
            };
            serviceAvailability[selectedServiceKey] = availability;
            localStorage.setItem('serviceAvailability', JSON.stringify(serviceAvailability));
            document.getElementById('availabilityForm').reset();
        });

        // Initialize the page
        function initialize() {
            displayServices();
            populateServiceDropdown();
            displayServiceAvailability();
        }
        initialize();

        // Update availability form on dropdown change
        document.getElementById('availabilityService').addEventListener('change', displayServiceAvailability);