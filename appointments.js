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