const token = '7835097683:AAE8W5EDRzbzRuCOYxwUwJlFePjF31uGFAc'; // Telegram bot token
let appointments = []; // Array to store scheduled appointments

// Function to switch between tabs
function openTab(evt, tabName) {
    $('.tabcontent').hide();  // Hide all tab content
    $('.tablinks').removeClass('active');  // Remove active class from all tablinks
    $('#' + tabName).show();  // Show the current tab
    $(evt.currentTarget).addClass('active');  // Add active class to the button that opened the tab

    // Show or hide week navigation buttons based on the selected tab
    if (tabName === 'Today') {
        $('#calendar-controls').hide();  // Hide previous/next week buttons
    } else if (tabName === 'Calendar') {
        $('#calendar-controls').show();  // Show previous/next week buttons
    }
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
            console.log("Fetched appointments:", data); // Debug line
            appointments = data; // Update global appointments array
            createWeeklyCalendar(); // Recreate calendar to display weekly appointments
            createTodaySchedule();  // Create today's schedule
        })
        .catch(error => {
            console.error('Error fetching appointments:', error);
        });
}

function getWeekStart(date) {
    const currentDate = new Date(date);
    const firstDayOfWeek = currentDate.getDate() - currentDate.getDay();
    return new Date(currentDate.setDate(firstDayOfWeek));
}

let currentWeekStart; 

// Function to create the weekly calendar
function createWeeklyCalendar(weekStartDate = new Date()) {
    currentWeekStart = getWeekStart(weekStartDate); // Set current week start

    const weekStart = currentWeekStart.getDate();
    const weekEnd = weekStart + 6;

    $('#calendar').empty(); // Clear existing calendar content

    for (let i = weekStart; i <= weekEnd; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(i); // Set date for each day of the week
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

// Function to open the appointment modal (unchanged)
function openAppointmentModal(date, time) {
    $('#appointment-modal').show();
    $('#appointment-time').empty().append(`<option>${time}</option>`);

    $('#schedule-appointment').off().click(() => scheduleAppointmentFromScheduleTab());
}

function switchWeek(direction) {
    const weekOffset = direction === 'next' ? 7 : -7; // Move forward or backward by 7 days
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + weekOffset);
    createWeeklyCalendar(newWeekStart);
}

// Initialize the calendar when the document is ready
$(document).ready(() => {
    fetchAppointments(); // Start by fetching appointments
    $('#prev-week').click(() => switchWeek('prev'));
    $('#next-week').click(() => switchWeek('next'));
    openTab(null, 'Today');  // Show "Today's Schedule" tab by default
    $('#calendar-controls').hide();  // Ensure week controls are hidden initially
});


