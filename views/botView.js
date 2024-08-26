const { Markup } = require('telegraf');

module.exports = {
    sendOrganizationPrompt(ctx) {
        const keyboard = Markup.keyboard([
            ['KAL', 'KBL'],
            ['End Session', 'Next Stock Code']
        ]).resize();
        ctx.reply('Для кого вы начинаете работу?', keyboard);
    },

    sendEmployeePrompt(ctx) {
        ctx.reply('Введите номер сотрудника:');
    },

    sendWelcome(ctx, employeeName) {
        ctx.reply(`Добро пожаловать, ${employeeName}. Введите сток код.`);
    },

    sendInvalidOrganization(ctx) {
        ctx.reply('Неверный ввод. Пожалуйста, укажите организацию: KAL или KBL.');
    },

    sendUnauthorized(ctx) {
        ctx.reply('Вы не авторизованы. Обратитесь к администратору.');
    },

    sendInvalidStockCode(ctx) {
        ctx.reply('Неверный сток код. Пожалуйста, убедитесь, что сток код состоит из 6 цифр и введите его заново.');
    },

    sendNextStockCodePrompt(ctx) {
        ctx.reply('Введите следующий сток код.');
    },

    sendStockCodeExists(ctx) {
        ctx.reply('Этот сток код уже существует. Пожалуйста, введите следующий сток код.');
    },

    sendPhotoPrompt(ctx) {
        const keyboard = Markup.keyboard([
            [{ text: 'Send Photo', request_contact: false, request_location: false }],
            ['End Session', 'Next Stock Code']
        ]).resize();
        ctx.reply('Сток код сохранен. Пожалуйста, отправьте фотографию.', keyboard);
    },

    sendPhotoUploaded(ctx) {
        ctx.reply('Фотография успешно загружена и записана. Пожалуйста, введите следующий сток код или напишите /end для завершения.');
    },

    sendPhotoProcessingError(ctx) {
        ctx.reply('Произошла ошибка при обработке фотографии.');
    },

    sendSessionEnded(ctx) {
        ctx.reply('Сеанс завершен. Запускаю новый сеанс. Пожалуйста, укажите организацию.');
    },

    sendNoActiveSession(ctx) {
        ctx.reply('Нет активного сеанса. Для начала нового сеанса используйте команду /start.');
    }
};
