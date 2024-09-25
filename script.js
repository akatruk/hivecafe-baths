const token = '7835097683:AAE8W5EDRzbzRuCOYxwUwJlFePjF31uGFAc'; // Store the Telegram bot token here
const appointments = []; // Array to store scheduled appointments

function createCalendar() {
    const currentDate = new Date();
    const weekStart = currentDate.getDate() - currentDate.getDay(); // Start of the week
    const weekEnd = weekStart + 6; // End of the week

    for (let i = weekStart; i <= weekEnd; i++) {
        const date = new Date(currentDate.setDate(i));
        const dayDiv = $('<div></div>').addClass('day').text(date.toDateString());
        
        // Append time slots to the day
        for (let hour = 8; hour <= 17; hour++) { // Assuming appointments from 8 AM to 5 PM
            const time = `${hour}:00`;
            const isBooked = appointments.some(app => 
                app.date.toDateString() === date.toDateString() && app.time === time
            );
            
            const timeSlot = $('<div></div>').text(time).data('time', time);
            
            // Check if the appointment is in the past
            const appointmentDateTime = new Date(date);
            const [appointmentHour] = time.split(':');
            appointmentDateTime.setHours(appointmentHour);
            const isPast = appointmentDateTime < new Date(); // Check if the appointment time has already passed
            
            // If the time is booked and in the past, change the appearance
            if (isBooked && isPast) {
                timeSlot.addClass('booked').text(`${time} (Booked)`).css('text-decoration', 'line-through');
            } else if (isBooked) {
                timeSlot.addClass('booked').text(`${time} (Booked)`);
                timeSlot.click(() => openAppointmentModal(date, time)); // Allow clicking for future appointments
            } else {
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

function scheduleAppointment(date, time) {
    const name = $('#name').val();
    const telephone = $('#telephone').val();

    if (!name || !telephone) {
        alert("Please fill in all fields.");
        return;
    }

    appointments.push({ name, telephone, date: new Date(date), time }); // Store a new appointment
    alert(`Appointment scheduled for ${name} at ${time} on ${date.toDateString()}`);
    
    // Set a notification for 10 minutes before the appointment
    const appointmentDateTime = new Date(date);
    const [hour, minute] = time.split(':');
    appointmentDateTime.setHours(hour, minute);
    
    const notificationTime = appointmentDateTime.getTime() - (10 * 60 * 1000); // 10 minutes before
    setTimeout(() => notify(name, telephone), notificationTime - Date.now());

    $('#appointment-modal').hide();
    $('#name').val('');
    $('#telephone').val('');
    $('#calendar').empty(); // Clear the calendar
    createCalendar(); // Recreate calendar to reflect new appointments
}

function notify(name, telephone) {
    const message = `Bath must be ready in 10 min for ${name}, ${telephone}`;
    const chatId = '209164634'; // Replace with your chat ID

    // Send message to Telegram
    $.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: message
    }).done(() => {
        alert(`Notification sent to Telegram: ${message}`);
    }).fail(() => {
        alert('Failed to send notification to Telegram.');
    });
}

// Initialize the calendar
$(document).ready(() => {
    createCalendar();
});
