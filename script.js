// script.js

// Function to switch between tabs
function openTab(evt, tabName) {
    $('.tabcontent').hide();  // Hide all tab content
    $('.tablinks').removeClass('active');  // Remove active class from all tablinks
    $('#' + tabName).show();  // Show the current tab
    $(evt.currentTarget).addClass('active');  // Add active class to the button that opened the tab
}

// Initialize the application when the document is ready
$(document).ready(() => {
    fetchAppointments(); // Fetch appointments on page load
    $('#calendar-tab').click(); // Open the "Calendar" tab by default
});
