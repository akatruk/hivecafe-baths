const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');

const app = express();
const port = process.env.PORT || 80;

// Replace with your Telegram bot token from BotFather
const token = '7835097683:AAE8W5EDRzbzRuCOYxwUwJlFePjF31uGFAc';

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Middleware to parse JSON body and serve static files
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory storage for scheduled appointments
const appointments = {};

// Basic response to user messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (msg.text === '/start') {
        bot.sendMessage(chatId, "Welcome to the Appointment Scheduler! Use the web app to schedule your appointments.");
    }
});

// Endpoint to schedule an appointment
app.post('/schedule', (req, res) => {
    const { chatId, name, telephone, time } = req.body;

    const dateTime = new Date();
    const [hour, minute] = time.split(':').map(Number);
    dateTime.setHours(hour, minute, 0);

    appointments[chatId] = { name, telephone, time };

    // Schedule the notification 10 minutes before the appointment
    schedule.scheduleJob(dateTime.getTime() - 10 * 60 * 1000, () => {
        bot.sendMessage(chatId, `🔔 Bath must be ready in 10 min for ${name}, ${telephone}.`);
    });

    res.json({ message: `Appointment scheduled for ${name} at ${time}.` });
});

// Serve the web app
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
