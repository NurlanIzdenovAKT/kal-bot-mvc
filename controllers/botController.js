const fs = require('fs');
const { Markup } = require('telegraf');
const path = require('path');
const botModel = require('../models/botModel');

exports.handleTextMessage = async (ctx) => {
    const userId = ctx.from.id;
    const session = botModel.getSession(userId);

    const text = ctx.message.text;

    if (text === 'End Session') {
        await ctx.reply('Сеанс завершен.');
        botModel.endSession(userId);
        ctx.telegram.sendMessage(ctx.chat.id, '/start');
        return;
    }

    if (text === 'Next Stock Code') {
        session.stockCode = null;
        session.step = 'getStockCode';
        await ctx.reply('Введите следующий сток код.');
        return;
    }

    if (session) {
        if (session.step === 'getOrganization') {
            const organization = text.toUpperCase();
            if (organization === 'KAL' || organization === 'KBL') {
                session.organization = organization;
                session.step = 'getEmployeeNumber';
                await ctx.reply('Введите номер сотрудника:');
            } else {
                await ctx.reply('Пожалуйста, укажите организацию: KAL или KBL.', 
                    Markup.keyboard([
                        ['KAL', 'KBL'],
                        ['End Session', 'Next Stock Code']
                    ]).resize()
                );
            }
        } else if (session.step === 'getEmployeeNumber') {
            const employeeNumber = text;
            const employeeName = botModel.getEmployeeName(employeeNumber);
            if (employeeName) {
                session.name = employeeName;
                session.step = 'getStockCode';
                await ctx.reply(`Добро пожаловать, ${employeeName}. Введите сток код.`, 
                    Markup.keyboard([
                        ['End Session', 'Next Stock Code']
                    ]).resize()
                );
            } else {
                await ctx.reply('Вы не авторизованы. Обратитесь к администратору.');
            }
        } else if (session.step === 'getStockCode') {
            const stockCode = text;
            if (/^\d{6}$/.test(stockCode)) {
                const stockCodeExists = await botModel.checkStockCodeInSheet(stockCode);
                if (stockCodeExists) {
                    await ctx.reply('Этот сток код уже существует. Пожалуйста, введите следующий сток код.');
                    return;
                }
                session.stockCode = stockCode;
                session.step = 'getPhoto';
                await ctx.reply('Сток код сохранен. Зайдите в камеру телеграм чата сделайте фото и отпрвавьте.', 
                    Markup.keyboard([
                        [{ text: 'Send Photo', request_contact: false, request_location: false }],
                        ['End Session', 'Next Stock Code']
                    ]).resize()
                );
            } else {
                await ctx.reply('Неверный сток код. Пожалуйста, убедитесь, что сток код состоит из 6 цифр и введите его заново.');
            }
        }
    }
};

exports.handlePhotoMessage = async (ctx) => {
    const userId = ctx.from.id;
    const session = botModel.getSession(userId);

    if (session && session.step === 'getPhoto') {
        try {
            const { photo } = ctx.message;
            const fileId = photo[photo.length - 1].file_id;
            const fileLink = await ctx.telegram.getFileLink(fileId);
            
            const filePath = await botModel.downloadFile(fileLink);
            await botModel.compressAndResizeImage(filePath);

            const newFileName = session.stockCode + path.extname(filePath);
            const folderId = session.organization === 'KAL' ? process.env.KAL_FOLDER_ID : process.env.KBL_FOLDER_ID;

            const fileDriveId = await botModel.uploadFileToDrive(filePath, newFileName, folderId);

            const row = [session.name, session.stockCode, new Date().toLocaleDateString(), `https://drive.google.com/uc?id=${fileDriveId}`, session.organization];
            await botModel.appendRowToSheet(row);

            fs.unlinkSync(filePath);

            await ctx.reply('Фотография успешно загружена и записана. Пожалуйста, введите следующий сток код или напишите /end для завершения.', 
                Markup.keyboard([
                    ['End Session', 'Next Stock Code']
                ]).resize()
            );
            session.stockCode = null;
            session.step = 'getStockCode';
        } catch (error) {
            console.error('Error processing photo:', error);
            await ctx.reply('Произошла ошибка при обработке фотографии.');
        }
    }
};
