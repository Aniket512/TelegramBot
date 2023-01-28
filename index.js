const axios = require("axios");
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
require("dotenv").config();

const token = process.env.TOKEN;
const apiEndpoint = 'https://api.openweathermap.org/data/2.5/weather?q=';
const API_KEY = process.env.API_KEY;

const bot = new TelegramBot(token, {polling: true});

let subscribers = [];

bot.on("polling_error", (err) => console.log(err));

// Handle the /subscribe command
bot.on('message', function(message) {
    if(message.text === '/subscribe') {
        // Add the chat ID to the subscribers array
        if (!subscribers.includes(message.chat.id)) {
            subscribers.push(message.chat.id)
        }
    
        fs.writeFileSync('subscribers.json', JSON.stringify(subscribers));

        bot.sendMessage(
            message.chat.id,
            'You have successfully subscribed to the temperature bot!'
        );

    }
});

setInterval(async() => {
    const {data} = await axios.get(`${apiEndpoint}Delhi&units=metric&appid=${API_KEY}`);
    const temperature = data.main.temp;

    let subscribers = JSON.parse(fs.readFileSync('subscribers.json'));

    subscribers.forEach((chatId) => {
        bot.sendMessage(
            chatId,
            `The current temperature in Delhi is ${temperature} °C`
        );
    });
}, 3600000);

