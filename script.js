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
    const currentDate = new Date();
    const weekStart = currentDate.getDate() - currentDate.getDay(); // Start of the week
    const weekEnd = weekStart + 6; // End of the week

    $('#calendar').empty(); // Clear existing calendar content

    for (let i = weekStart; i <= weekEnd; i++) {
        const date = new Date(currentDate.setDate(i));
        const dayDiv = $('<div></div>').addClass('day').text(date.toDateString());

        for (let hour = 8; hour <= 20; hour++) { // Assuming appointments from 8 AM to 8 PM
            const time = `${hour}:00`;
            const appointment = appointments.find(app =>
                new Date(app.date).toDateString() === date.toDateString() && app.time === time
            );

            const timeSlot = $('<div></div>').text(time).data('time', time);
            // Check if the appointment is in the past
            const appointmentDateTime = new Date(date);
            const [appointmentHour] = time.split(':');
            appointmentDateTime.setHours(appointmentHour);
            const isPast = appointmentDateTime < new Date();

            if (appointment) {
                const displayText = `${time} - ${appointment.name}, ${appointment.telephone}`;
                const deleteButton = $('<button></button>').text('Delete').addClass('delete-btn');

                // Append delete button to the appointment slot
                timeSlot.addClass('booked').text(displayText).append(deleteButton);

                if (isPast) {
                    timeSlot.css('text-decoration', 'line-through');
                }

                // Add click event for deleting the appointment
                deleteButton.click(() => deleteAppointment(appointment.id));

                // Allow clicking for future appointments (if needed)
                if (!isPast) {
                    timeSlot.click(() => openAppointmentModal(date, time));
                }
            } else {
                timeSlot.click(() => openAppointmentModal(date, time));
            }

            dayDiv.append(timeSlot);
        }

        $('#calendar').append(dayDiv);
    }
}

// Function to delete an appointment
function deleteAppointment(appointmentId) {
    if (confirm("Are you sure you want to delete this appointment?")) {
        fetch(`https://nazi.today/appointments/${appointmentId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete the appointment.');
            }
            alert('Appointment deleted successfully.');
            fetchAppointments(); // Refresh the calendar
        })
        .catch(error => {
            console.error('Error deleting appointment:', error);
            alert('Failed to delete the appointment.');
        });
    }
}

// Function to open the appointment modal
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
        
        // Schedule the notification 30 minutes before the appointment
        const appointmentDateTime = new Date(date);
        const [hour, minute] = time.split(':');
        appointmentDateTime.setHours(hour, minute);
        const notificationTime30 = appointmentDateTime.getTime() - (30 * 60 * 1000); // 30 minutes before

        setTimeout(() => notify(data.name, data.telephone), notificationTime30 - Date.now());

        fetchAppointments(); // Refresh the appointments
    })
    .catch(error => alert('Failed to schedule appointment: ' + error.message));
}

// Function to send notification to Telegram
function notify(name, telephone) {
    const message = `Appointment reminder: Your appointment with ${name}, ${telephone} is in 30 minutes.`;
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
