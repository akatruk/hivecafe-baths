// index.js
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = process.env.PORT || 3000;

// Replace with your Telegram token from BotFather
const token = '7835097683:AAE8W5EDRzbzRuCOYxwUwJlFePjF31uGFAc';

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Basic response to user messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;
    
    if (message === '/start') {
        bot.sendMessage(chatId, "Welcome to the Telegram Bot!");
    } else {
        bot.sendMessage(chatId, `You said: ${message}`);
    }
});

// Serve a simple web page
app.get('/', (req, res) => {
    res.send('<h1>Telegram Web App</h1><p>Your bot is up and running!</p>');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
