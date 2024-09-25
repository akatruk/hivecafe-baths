// index.js
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = process.env.PORT || 80;

// Replace with your Telegram bot token from BotFather
const token = '7835097683:AAE8W5EDRzbzRuCOYxwUwJlFePjF31uGFAc';

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Basic response to user messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;
    
    if (message === '/start') {
        bot.sendMessage(chatId, "Welcome to testbot!");
    } else {
        bot.sendMessage(chatId, `You said: ${message}`);
    }
});

// Serve a simple web page with the name "testbot"
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>TestBot</title>
            </head>
            <body>
                <h1>TestBot</h1>
            </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
