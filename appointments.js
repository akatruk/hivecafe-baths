// appointments.js

const token = 'YOUR_TELEGRAM_BOT_TOKEN'; // Replace with your Telegram bot token
let appointments = []; // Array to store scheduled appointments

// Function to fetch appointments from the backend
function fetchAppointments() {
    fetch('https://nazi.today/appointments') // Replace with your actual endpoint
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            appointments = data; // Update global appointments array
            createTodaySchedule();  // Create today's schedule
        })
        .catch(error => {
            console.error('Error fetching appointments:', error);
        });
}

// Function to create today's schedule
function createTodaySchedule() {
    const today = new Date().toDateString(); // Get current day's date string
    $('#today-schedule').empty(); // Clear previous day's schedule

    const todayAppointments = appointments.filter(app => new Date(app.date).toDateString() === today);
    
    if (todayAppointments.length === 0) {
        $('#today-schedule').append('<p>No appointments for today.</p>');
        return;
    }

    todayAppointments.forEach(appointment => {
        const appointmentDiv = $('<div></div>')
            .addClass('appointment')
            .text(`${appointment.time} - ${appointment.name}, ${appointment.telephone}`);
        $('#today-schedule').append(appointmentDiv);
    });
}
