document.addEventListener('DOMContentLoaded', () => {
    const weekContainer = document.getElementById('week');
    const eventModal = document.getElementById('eventModal');
    const closeModal = document.getElementById('closeModal');
    const eventForm = document.getElementById('eventForm');
    const eventNameInput = document.getElementById('eventName');
    const eventDescriptionInput = document.getElementById('eventDescription');
    const eventDateInput = document.getElementById('eventDate');

    // Helper function to format date to 'Day, MM/DD'
    function formatDate(date) {
        const options = { weekday: 'short', month: 'numeric', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Generate the week starting from the current date
    function generateWeek() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Set to the start of the week (Sunday)

        // Clear the previous week if it exists
        weekContainer.innerHTML = '';

        // Loop to create 7 days
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);

            // Create a day element
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.dataset.date = day.toDateString(); // Store date in data attribute
            if (day.toDateString() === today.toDateString()) {
                dayElement.classList.add('current'); // Highlight the current day
            }
            dayElement.innerHTML = `<div>${formatDate(day)}</div>`;
            
            // Load events from localStorage
            loadEvents(dayElement);

            // Add click event to open modal
            dayElement.addEventListener('click', () => openModal(day));

            // Append the day element to the week container
            weekContainer.appendChild(dayElement);
        }
    }

    // Load events for a specific day
    function loadEvents(dayElement) {
        const date = dayElement.dataset.date;
        const events = JSON.parse(localStorage.getItem(date)) || [];
        events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.textContent = event.name;
            dayElement.appendChild(eventDiv);
        });
    }

    // Open modal to add an event
    function openModal(date) {
        eventModal.style.display = 'block';
        eventDateInput.value = date.toDateString();
    }

    // Close the modal
    closeModal.onclick = () => {
        eventModal.style.display = 'none';
    }

    // Close the modal if clicked outside
    window.onclick = (event) => {
        if (event.target == eventModal) {
            eventModal.style.display = 'none';
        }
    }

    // Handle form submission
    eventForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const eventName = eventNameInput.value;
        const eventDescription = eventDescriptionInput.value;
        const eventDate = eventDateInput.value;

        // Save event to localStorage
        const events = JSON.parse(localStorage.getItem(eventDate)) || [];
        events.push({ name: eventName, description: eventDescription });
        localStorage.setItem(eventDate, JSON.stringify(events));

        // Refresh the week view
        generateWeek();

        // Reset form and close modal
        eventForm.reset();
        eventModal.style.display = 'none';
    });

    // Generate the week when the page loads
    generateWeek();
});
