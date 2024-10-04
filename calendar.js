// calendar.js

let currentWeekStart; // Variable to store the start date of the current week

// Function to initialize the calendar when the document is ready
$(document).ready(() => {
    currentWeekStart = new Date(); // Start from the current week
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // Set to the start of the week (Sunday)

    createWeeklyCalendar(); // Create the initial weekly calendar
});

// Function to create the weekly calendar
function createWeeklyCalendar() {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Get the end of the week

    $('#calendar').empty(); // Clear existing calendar content

    for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + i); // Increment day for each slot
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
                if (isPast) {
                    timeSlot.addClass('booked').text(displayText).css('text-decoration', 'line-through');
                } else {
                    timeSlot.addClass('booked').text(displayText);
                    timeSlot.click(() => openAppointmentModal(date, time)); // Allow clicking for future appointments
                }
            } else {
                timeSlot.click(() => openAppointmentModal(date, time));
            }

            dayDiv.append(timeSlot);
        }

        $('#calendar').append(dayDiv);
    }
}

// Functions to switch weeks
function goToNextWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    createWeeklyCalendar(); // Update calendar view
}

function goToPreviousWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    createWeeklyCalendar(); // Update calendar view
}

// Attach event listeners for week navigation buttons
$(document).on('click', '#prev-week', goToPreviousWeek);
$(document).on('click', '#next-week', goToNextWeek);
