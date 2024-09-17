import React, { FC, useEffect } from 'react';

interface Service {
    serviceName: string;
    description: string;
    duration: number;
    price: number;
    providers: string;
}

interface Services {
    [key: string]: Service;
}

interface Availability {
    availabilityStart?: string;
    availabilityEnd?: string;
    availabilityTimes?: string;
    blackoutPeriods?: string;
}

const services: Services = JSON.parse(localStorage.getItem('services') || '{}');
const serviceAvailability: { [key: string]: Availability } = JSON.parse(localStorage.getItem('serviceAvailability') || '{}');

const showTab = (tabIndex: number): void => {
    const tabs: NodeListOf<Element> = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    const tabButtons: NodeListOf<Element> = document.querySelectorAll('.tab');
    tabButtons.forEach(button => button.classList.remove('active'));

    document.getElementById(`tabContent${tabIndex}`)?.classList.add('active');
    tabButtons[tabIndex].classList.add('active');
};

const displayServices = (): void => {
    const serviceList: HTMLElement | null = document.getElementById('serviceList');
    if (serviceList) {
        serviceList.innerHTML = '';
        for (const key in services) {
            if (services.hasOwnProperty(key)) {
                const service: Service = services[key];
                const serviceItem: HTMLElement = document.createElement('li');
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
};

document.getElementById('serviceForm')?.addEventListener('submit', function(event: Event) {
    event.preventDefault();
    const serviceName: string = (document.getElementById('serviceName') as HTMLInputElement).value.trim();
    const description: string = (document.getElementById('description') as HTMLInputElement).value.trim();
    const duration: number = parseInt((document.getElementById('duration') as HTMLInputElement).value);
    const price: number = parseFloat((document.getElementById('price') as HTMLInputElement).value);
    const providers: string = (document.getElementById('providers') as HTMLInputElement).value.trim();

    const isDuplicate: boolean = Object.values(services).some(service => service.serviceName.toLowerCase() === serviceName.toLowerCase());
    
    if (isDuplicate) {
        alert('Service name already exists. Please choose a different name.');
        return;
    }

    const serviceKey: string = Date.now().toString();

    services[serviceKey] = {
        serviceName,
        description,
        duration,
        price,
        providers
    };

    localStorage.setItem('services', JSON.stringify(services));
    displayServices();
    populateServiceDropdown();
    (document.getElementById('serviceForm') as HTMLFormElement).reset();
});

const deleteService = (serviceKey: string): void => {
    if (confirm('Are you sure you want to delete this service?')) {
        delete services[serviceKey];
        delete serviceAvailability[serviceKey];
        localStorage.setItem('services', JSON.stringify(services));
        localStorage.setItem('serviceAvailability', JSON.stringify(serviceAvailability));
        displayServices();
        populateServiceDropdown();
    }
};

const editService = (serviceKey: string): void => {
    const service: Service = services[serviceKey];
    (document.getElementById('editServiceName') as HTMLInputElement).value = service.serviceName;
    (document.getElementById('editDescription') as HTMLInputElement).value = service.description;
    (document.getElementById('editDuration') as HTMLInputElement).value = service.duration.toString();
    (document.getElementById('editPrice') as HTMLInputElement).value = service.price.toString();
    (document.getElementById('editProviders') as HTMLInputElement).value = service.providers;
    document.getElementById('editServiceForm')!.onsubmit = function(event: Event) {
        event.preventDefault();
        services[serviceKey] = {
            serviceName: (document.getElementById('editServiceName') as HTMLInputElement).value,
            description: (document.getElementById('editDescription') as HTMLInputElement).value,
            duration: parseInt((document.getElementById('editDuration') as HTMLInputElement).value),
            price: parseFloat((document.getElementById('editPrice') as HTMLInputElement).value),
            providers: (document.getElementById('editProviders') as HTMLInputElement).value
        };
        localStorage.setItem('services', JSON.stringify(services));
        displayServices();
        closeEditForm();
    };
    document.getElementById('editServiceOverlay')!.classList.add('active');
};

const closeEditForm = (): void => {
    document.getElementById('editServiceOverlay')!.classList.remove('active');
};

const populateServiceDropdown = (): void => {
    const availabilityServiceSelect: HTMLElement | null = document.getElementById('availabilityService');
    if (availabilityServiceSelect) {
        availabilityServiceSelect.innerHTML = '';
        for (const key in services) {
            if (services.hasOwnProperty(key)) {
                const option: HTMLOptionElement = document.createElement('option');
                option.value = key;
                option.textContent = services[key].serviceName;
                availabilityServiceSelect.appendChild(option);
            }
        }
    }
};

const displayServiceAvailability = (): void => {
    const availabilityServiceSelect: HTMLSelectElement | null = document.getElementById('availabilityService') as HTMLSelectElement;
    const selectedServiceKey: string = availabilityServiceSelect.value;
    const availability: Availability = serviceAvailability[selectedServiceKey] || {};

    (document.getElementById('availabilityStart') as HTMLInputElement).value = availability.availabilityStart || '';
    (document.getElementById('availabilityEnd') as HTMLInputElement).value = availability.availabilityEnd || '';
    (document.getElementById('availabilityTimes') as HTMLInputElement).value = availability.availabilityTimes || '';
    (document.getElementById('blackoutPeriods') as HTMLInputElement).value = availability.blackoutPeriods || '';
};

document.getElementById('availabilityForm')?.addEventListener('submit', function(event: Event) {
    event.preventDefault();
    const selectedServiceKey: string = (document.getElementById('availabilityService') as HTMLSelectElement).value;
    const availability: Availability = {
        availabilityStart: (document.getElementById('availabilityStart') as HTMLInputElement).value,
        availabilityEnd: (document.getElementById('availabilityEnd') as HTMLInputElement).value,
        availabilityTimes: (document.getElementById('availabilityTimes') as HTMLInputElement).value,
        blackoutPeriods: (document.getElementById('blackoutPeriods') as HTMLInputElement).value
    };
    serviceAvailability[selectedServiceKey] = availability;
    localStorage.setItem('serviceAvailability', JSON.stringify(serviceAvailability));
    (document.getElementById('availabilityForm') as HTMLFormElement).reset();
});

const initialize = (): void => {
    displayServices();
    populateServiceDropdown();
    displayServiceAvailability();
};
initialize();

document.getElementById('availabilityService')?.addEventListener('change', displayServiceAvailability);