const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');

const app = express();
const port = process.env.PORT || 3000;

const token = '7835097683:AAE8W5EDRzbzRuCOYxwUwJlFePjF31uGFAc'; 
const bot = new TelegramBot(token, { polling: true });
app.use(bodyParser.json());
app.use(express.static('public'));
const appointments = {};
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (msg.text === '/start') {
        bot.sendMessage(chatId, "Welcome! Use the web app to schedule your appointments.");
    }
});

// API endpoint to schedule an appointment
app.post('/schedule', (req, res) => {
    const { chatId, name, telephone, time } = req.body;

    const dateTime = new Date();
    const [hour, minute] = time.split(':').map(Number);
    dateTime.setHours(hour, minute, 0);

    // Store appointment details
    appointments[chatId] = appointments[chatId] || [];
    appointments[chatId].push({ name, telephone, time });

    // Schedule a notification 10 minutes before the appointment
    schedule.scheduleJob(dateTime.getTime() - 10 * 60 * 1000, () => {
        bot.sendMessage(chatId, `🔔 Bath must be ready in 10 min for ${name}, ${telephone}.`);
    });

    res.json({ message: `Appointment scheduled for ${name} at ${time}.` });
});

// API endpoint to get scheduled appointments
app.get('/appointments/:chatId', (req, res) => {
    const { chatId } = req.params;
    res.json(appointments[chatId] || []);
});

// Serve the web app
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
