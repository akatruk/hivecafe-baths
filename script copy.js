const token = '7835097683:AAE8W5EDRzbzRuCOYxwUwJlFePjF31uGFAc'; // Telegram bot token
const appointments = []; // Array to store scheduled appointments

// Function to switch between tabs
function openTab(evt, tabName) {
    $('.tabcontent').hide();  // Hide all tab content
    $('.tablinks').removeClass('active');  // Remove active class from all tablinks
    $('#' + tabName).show();  // Show the current tab
    $(evt.currentTarget).addClass('active');  // Add active class to the button that opened the tab
}

function createCalendar() {
    const currentDate = new Date();
    const weekStart = currentDate.getDate() - currentDate.getDay(); // Start of the week
    const weekEnd = weekStart + 7; // End of the week

    for (let i = weekStart; i <= weekEnd; i++) {
        const date = new Date(currentDate.setDate(i));
        const dayDiv = $('<div></div>').addClass('day').text(date.toDateString());

        // Append time slots to the day
        for (let hour = 8; hour <= 20; hour++) { // Assuming appointments from 8 AM to 8 PM
            const time = `${hour}:00`;
            const appointment = appointments.find(app =>
                app.date.toDateString() === date.toDateString() && app.time === time
            );

            const timeSlot = $('<div></div>').text(time).data('time', time);

            // Check if the appointment is in the past
            const appointmentDateTime = new Date(date);
            const [appointmentHour] = time.split(':');
            appointmentDateTime.setHours(appointmentHour);
            const isPast = appointmentDateTime < new Date(); // Check if the appointment time has already passed

            if (appointment) {
                // If there is an appointment, show name and telephone number
                const displayText = `${time} - ${appointment.name}, ${appointment.telephone}`;
                if (isPast) {
                    timeSlot.addClass('booked').text(displayText).css('text-decoration', 'line-through');
                } else {
                    timeSlot.addClass('booked').text(displayText);
                    timeSlot.click(() => openAppointmentModal(date, time)); // Allow clicking for future appointments
                }
            } else {
                // If no appointment, allow creating a new one
                timeSlot.click(() => openAppointmentModal(date, time));
            }

            dayDiv.append(timeSlot);
        }

        $('#calendar').append(dayDiv);
    }
}

function openAppointmentModal(date, time) {
    $('#appointment-modal').show();
    $('#appointment-time').empty().append(`<option>${time}</option>`);
    
    $('#schedule-appointment').off().click(() => scheduleAppointment(date, time));
}

// function scheduleAppointmentFromScheduleTab() {
//     const date = $('#appointment-date').val();
//     const time = $('#appointment-time').val();
//     const name = $('#name').val();
//     const telephone = $('#telephone').val();

//     if (!date || !time || !name || !telephone) {
//         alert("Please fill in all fields.");
//         return;
//     }

//     const appointmentDate = new Date(date);
//     appointments.push({ name, telephone, date: appointmentDate, time }); // Store a new appointment
//     alert(`Appointment scheduled for ${name} at ${time} on ${appointmentDate.toDateString()}`);
    
//     // Set a notification for 10 minutes before the appointment
//     const appointmentDateTime = new Date(date);
//     const [hour, minute] = time.split(':');
//     appointmentDateTime.setHours(hour, minute);
    
//     const notificationTime = appointmentDateTime.getTime() - (10 * 60 * 1000); // 10 minutes before
//     setTimeout(() => notify(name, telephone), notificationTime - Date.now());

//     $('#name').val('');
//     $('#telephone').val('');
//     $('#calendar').empty(); // Clear the calendar∆
//     createCalendar(); // Recreate calendar to reflect new appointments
// }
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
    fetch('http://backend:5000/appointments', {
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
        
        // Set a notification for 10 minutes before the appointment
        const appointmentDateTime = new Date(date);
        const [hour, minute] = time.split(':');
        appointmentDateTime.setHours(hour, minute);
        
        const notificationTime = appointmentDateTime.getTime() - (10 * 60 * 1000); // 10 minutes before
        setTimeout(() => notify(name, telephone), notificationTime - Date.now());

        // Clear input fields
        $('#name').val('');
        $('#telephone').val('');
        $('#calendar').empty(); // Clear the calendar
        createCalendar(); // Recreate calendar to reflect new appointments
    })
    .catch(error => {
        alert('Failed to schedule appointment: ' + error.message);
    });
}

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

// Initialize the calendar when document is ready
$(document).ready(() => {
    createCalendar();

    // Open the "Calendar" tab by default
    $('#calendar-tab').click();

    // Attach event handler to schedule appointment from the Schedule tab
    $('#schedule-appointment').click(scheduleAppointmentFromScheduleTab);
});
