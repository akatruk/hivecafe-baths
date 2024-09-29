const token = '7835097683:AAE8W5EDRzbzRuCOYxwUwJlFePjF31uGFAc'; // Telegram bot token
let appointments = []; // Array to store scheduled appointments

// Function to switch between tabs
function openTab(evt, tabName) {
    $('.tabcontent').hide();  // Hide all tab content
    $('.tablinks').removeClass('active');  // Remove active class from all tablinks
    $('#' + tabName).show();  // Show the current tab
    $(evt.currentTarget).addClass('active');  // Add active class to the button that opened the tab
}

// Function to fetch appointments from the backend
function fetchAppointments() {
    fetch('https://nazi.today/appointments')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            appointments = data; // Update global appointments array
            createTodaySchedule(); // Display today's schedule
            createWeeklySchedule(); // Display weekly schedule
        })
        .catch(error => {
            console.error('Error fetching appointments:', error);
        });
}

// Function to create and display today's schedule
function createTodaySchedule() {
    const today = new Date();
    const todayDateStr = today.toDateString();
    
    $('#today-schedule').empty(); // Clear previous content

    const dayDiv = $('<div></div>').addClass('day').text(todayDateStr);

    for (let hour = 8; hour <= 20; hour++) { // Assuming appointments from 8 AM to 8 PM
        const time = `${hour}:00`;
        const appointment = appointments.find(app => new Date(app.date).toDateString() === todayDateStr && app.time === time);

        const timeSlot = $('<div></div>').text(time).data('time', time);
        const appointmentDateTime = new Date(today);
        appointmentDateTime.setHours(hour);

        if (appointment) {
            const displayText = `${time} - ${appointment.name}, ${appointment.telephone}`;
            timeSlot.addClass('booked').text(displayText);
            timeSlot.click(() => openAppointmentModal(today, time));
        } else {
            timeSlot.click(() => openAppointmentModal(today, time));
        }

        dayDiv.append(timeSlot);
    }

    $('#today-schedule').append(dayDiv);
}

// Function to create and display the weekly schedule
function createWeeklySchedule() {
    const currentDate = new Date();
    const weekStart = currentDate.getDate() - currentDate.getDay(); // Start of the week
    const weekEnd = weekStart + 6; // End of the week

    $('#weekly-schedule').empty(); // Clear existing weekly schedule content

    for (let i = weekStart; i <= weekEnd; i++) {
        const date = new Date(currentDate.setDate(i));
        const dayDiv = $('<div></div>').addClass('day').text(date.toDateString());

        for (let hour = 8; hour <= 20; hour++) { // Assuming appointments from 8 AM to 8 PM
            const time = `${hour}:00`;
            const appointment = appointments.find(app => new Date(app.date).toDateString() === date.toDateString() && app.time === time);

            const timeSlot = $('<div></div>').text(time).data('time', time);
            const appointmentDateTime = new Date(date);
            appointmentDateTime.setHours(hour);

            if (appointment) {
                const displayText = `${time} - ${appointment.name}, ${appointment.telephone}`;
                timeSlot.addClass('booked').text(displayText);
                timeSlot.click(() => openAppointmentModal(date, time));
            } else {
                timeSlot.click(() => openAppointmentModal(date, time));
            }

            dayDiv.append(timeSlot);
        }

        $('#weekly-schedule').append(dayDiv);
    }
}

// Function to open the appointment modal
function openAppointmentModal(date, time) {
    $('#appointment-modal').show();
    $('#appointment-time').empty().append(`<option>${time}</option>`);

    $('#schedule-appointment').off().click(() => scheduleAppointmentFromScheduleTab());
}

// Function to schedule appointments from the schedule tab
function scheduleAppointmentFromScheduleTab() {
    const date = $('#appointment-date').val();
    const time = $('#appointment-time').val();
    const name = $('#name').val();
    const telephone = $('#telephone').val();

    if (!date || !time || !name || !telephone) {
        alert("Please fill in all fields.");
        return;
    }

    const appointmentData = {
        name,
        telephone,
        date,
        time
    };

    // Send the appointment data to the Flask server using Fetch API
    fetch('https://nazi.today/appointments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        alert(`Appointment scheduled for ${data.name} at ${data.time} on ${new Date(data.date).toDateString()}`);

        const appointmentDateTime = new Date(date);
        const [hour, minute] = time.split(':');
        appointmentDateTime.setHours(hour, minute);
        
        const notificationTime = appointmentDateTime.getTime() - (10 * 60 * 1000); // 10 minutes before
        setTimeout(() => notify(name, telephone), notificationTime - Date.now());

        $('#name').val('');
        $('#telephone').val('');
        fetchAppointments();
    })
    .catch(error => {
        alert('Failed to schedule appointment: ' + error.message);
    });
}

// Initialize the calendar when document is ready
$(document).ready(() => {
    fetchAppointments(); // Fetch appointments on page load
    $('#day-tab').click(); // Show today's schedule by default
