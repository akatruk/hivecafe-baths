const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const token = '7835097683:AAE8W5EDRzbzRuCOYxwUwJlFePjF31uGFAc';
const bot = new TelegramBot(token, { polling: true });

// Store appointments in memory
let appointments = [];

// Bot's /start command
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to the Bath Scheduler 🛁! You can schedule a bath with /schedule.");
});

// Serve the HTML page with the calendar and scheduling form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Handle form submission
app.post('/schedule', (req, res) => {
    const { name, phone, time } = req.body;
    const appointmentTime = new Date(time);

    // Add appointment to list
    appointments.push({ name, phone, time: appointmentTime });

    // Schedule a job 10 minutes before the appointment
    const reminderTime = new Date(appointmentTime.getTime() - 10 * 60000);

    schedule.scheduleJob(reminderTime, () => {
        const message = `🚨 Bath must be ready in 10 min for ${name}, ${phone}.`;
        bot.sendMessage(/* Put your own Telegram chat ID here */, message);
    });

    res.send(`Appointment scheduled for ${name} at ${appointmentTime}`);
});

// Start express server
app.listen(port, () => {
    console.log(`Bath Scheduler 🛁 running on http://localhost:${port}`);
});
