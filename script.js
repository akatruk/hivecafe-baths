const appointments = [];
const token = '7835097683:AAE8W5EDRzbzRuCOYxwUwJlFePjF31uGFAc';

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
            const timeSlot = $('<div></div>').text(time).data('time', time).click(() => openAppointmentModal(date, time));
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

    appointments.push({ name, telephone, date, time });
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
}

function notify(name, telephone) {
    alert(`Bath must be ready in 10 min for ${name}, ${telephone}`);
}

$(document).ready(() => {
    createCalendar();
});

function notify(name, telephone) {
    const message = `Bath must be ready in 10 min for ${name}, ${telephone}`;
    const chatId = '209164634'; 
 
    $.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: message
    }).done(() => {
        alert(`Notification sent to Telegram: ${message}`);
    }).fail(() => {
        alert('Failed to send notification to Telegram.');
    });
}