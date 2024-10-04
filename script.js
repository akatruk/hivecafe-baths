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
            createWeeklyCalendar(); // Recreate calendar to display weekly appointments
            createTodaySchedule();  // Create today's schedule
        })
        .catch(error => {
            console.error('Error fetching appointments:', error);
        });
}

// Function to create the weekly calendar
function createWeeklyCalendar() {
    $('#calendar').empty(); // Clear existing calendar content
    const currentDate = new Date();
    const weekStart = currentDate.getDate() - currentDate.getDay();
    const weekEnd = weekStart + 6;

    for (let i = weekStart; i <= weekEnd; i++) {
        const date = new Date(currentDate.setDate(i));
        const dayDiv = $('<div></div>').addClass('day').text(date.toDateString());

        for (let hour = 8; hour <= 20; hour++) {
            const time = `${hour}:00`;
            const appointment = appointments.find(app => new Date(app.date).toDateString() === date.toDateString() && app.time === time);

            const timeSlot = $('<div></div>').text(time).data('time', time);

            if (appointment) {
                const displayText = `${time} - ${appointment.name}, ${appointment.telephone}`;
                timeSlot.addClass('booked').text(displayText);

                // Add delete button
                const deleteButton = $('<button></button>').text('Delete').click(() => deleteAppointment(appointment.id));
                timeSlot.append(deleteButton);
            }

            dayDiv.append(timeSlot);
        }

        $('#calendar').append(dayDiv);
    }
}

// Function to create today's schedule
function createTodaySchedule() {
    $('#today-schedule').empty(); // Clear existing schedule content
    const today = new Date().toDateString();

    appointments.forEach(app => {
        const appointmentDate = new Date(app.date).toDateString();
        if (appointmentDate === today) {
            const appointmentDiv = $('<div></div>').addClass('appointment');
            appointmentDiv.text(`${app.time} - ${app.name}, ${app.telephone}`);

            // Add delete button next to each appointment
            const deleteButton = $('<button></button>').text('Delete').click(() => deleteAppointment(app.id));
            appointmentDiv.append(deleteButton);

            $('#today-schedule').append(appointmentDiv);
        }
    });
}

// Function to open the appointment modal (unchanged)
function openAppointmentModal(date, time) {
    $('#appointment-modal').show();
    $('#appointment-time').empty().append(`<option>${time}</option>`);

    $('#schedule-appointment').off().click(() => scheduleAppointmentFromScheduleTab());
}

// Schedule appointment function (with notification to Telegram)
function scheduleAppointmentFromScheduleTab() {
    const date = $('#appointment-date').val();
    const time = $('#appointment-time').val();
    const name = $('#name').val();
    const telephone = $('#telephone').val();

    if (!date || !time || !name || !telephone) {
        alert("Please fill in all fields.");
        return;
    }

    const appointmentData = { name, telephone, date, time };

    fetch('https://nazi.today/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        
        // Schedule the notification 10 minutes before the appointment
        const appointmentDateTime = new Date(date);
        const [hour, minute] = time.split(':');
        appointmentDateTime.setHours(hour, minute);
        const notificationTime30 = appointmentDateTime.getTime() - (30 * 60 * 1000); // 30 minutes before
        const notificationTime60 = appointmentDateTime.getTime() - (30 * 60 * 1000); // 30 minutes before

        setTimeout(() => notify(data.name, data.telephone), notificationTime30 - Date.now());
        setTimeout(() => notify(data.name, data.telephone), notificationTime60 - Date.now());

        fetchAppointments(); // Refresh the appointments
    })
    .catch(error => alert('Failed to schedule appointment: ' + error.message));
}

// Function to send notification to Telegram
function notify(name, telephone) {
    const message = `Appointment reminder: Your appointment with ${name}, ${telephone} is in 10 minutes.`;
    const chatId = '209164634'; // Replace with your chat ID

    // Send notification message to Telegram
    $.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: message
    }).done(() => {
        alert(`Notification sent to Telegram: ${message}`);
    }).fail(() => {
        alert('Failed to send notification to Telegram.');
    });
}


// Initialize the calendar when the document is ready
$(document).ready(() => {
    fetchAppointments(); // Fetch appointments on page load
    $('#calendar-tab').click(); // Open the "Calendar" tab by default
    $('#schedule-appointment').click(scheduleAppointmentFromScheduleTab);
});
