require('dotenv').config();
const { Telegraf } = require('telegraf');
const botController = require('./controllers/botController');

// Создание бота
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
console.log('Bot initialized...');

// Подключение обработчиков
botController(bot);

// Запуск бота
bot.launch().then(() => {
    console.log('Bot started');
}).catch(console.error);

// Обработка остановки бота
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
