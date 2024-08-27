// index.js

const { Telegraf } = require('telegraf');
const botController = require('./controllers/botController');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.on('text', botController.handleTextMessage);
bot.on('photo', botController.handlePhotoMessage);

bot.launch().then(() => {
    console.log('Bot started');
}).catch(console.error);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
