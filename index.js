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

// Middleware to parse JSON body
app.use(bodyParser.json());

// In-memory storage for scheduled appointments
const appointments = {};

// Basic response to user messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;

    if (message === '/start') {
        bot.sendMessage(chatId, "Welcome to the Appointment Scheduler! Use /schedule to create an appointment.");
    } else if (message.startsWith('/schedule')) {
        bot.sendMessage(chatId, "Please provide the following details: Name, Telephone Number, and Time (HH:MM).");
    } else if (appointments[chatId]) {
        const appointmentDetails = appointments[chatId].split(';');
        const [name, telephone, appointmentTime] = appointmentDetails;

        if (message.match(/^\d{2}:\d{2}$/)) { // Time format HH:MM
            const time = message;
            const dateTime = new Date();
            const [hour, minute] = time.split(':').map(Number);
            dateTime.setHours(hour, minute, 0);

            appointments[chatId] = `${name};${telephone};${time}`;

            schedule.scheduleJob(dateTime.getTime() - 10 * 60 * 1000, () => {
                bot.sendMessage(chatId, `🔔 Bath must be ready in 10 min for ${name}, ${telephone}.`);
            });

            bot.sendMessage(chatId, `Appointment scheduled for ${name} at ${time}.`);
        } else {
            const [name, telephone] = message.split(';');
            appointments[chatId] = `${name};${telephone};`;
            bot.sendMessage(chatId, "Now, please provide the appointment time in HH:MM format.");
        }
    } else {
        bot.sendMessage(chatId, `You said: ${message}`);
    }
});

// Serve a simple web page with the name "Appointment Scheduler"
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Appointment Scheduler</title>
            </head>
            <body>
                <h1>Batch Appointment Scheduler</h1>
                <p>Use Telegram to schedule your appointments.</p>
                <p>Commands:</p>
                <ul>
                    <li><strong>/start</strong> - Welcome worker</li>
                    <li><strong>/schedule</strong> - Schedule a new appointment</li>
                </ul>
            </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
