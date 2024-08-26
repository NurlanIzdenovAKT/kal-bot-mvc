const fs = require('fs');
const path = require('path');
const botView = require('../views/botView');
const botModel = require('../models/botModel');


const sessions = {};

module.exports = (bot) => {
    bot.command('start', (ctx) => {
        const userId = ctx.from.id;
        sessions[userId] = { step: 'getOrganization' };
        botView.sendOrganizationPrompt(ctx);
    });

    bot.command('end', (ctx) => {
        const userId = ctx.from.id;
        if (sessions[userId]) {
            delete sessions[userId];
            botView.sendSessionEnded(ctx);
            sessions[userId] = { step: 'getOrganization' };
        } else {
            botView.sendNoActiveSession(ctx);
        }
    });

    bot.on('text', async (ctx) => {
        const userId = ctx.from.id;
        const session = sessions[userId];
        const text = ctx.message.text;

        if (text === 'End Session') {
            ctx.telegram.sendMessage(ctx.chat.id, '/end');
            return;
        }

        if (session) {
            switch (session.step) {
                case 'getOrganization':
                    if (['KAL', 'KBL'].includes(text.toUpperCase())) {
                        session.organization = text.toUpperCase();
                        session.step = 'getEmployeeNumber';
                        botView.sendEmployeePrompt(ctx);
                    } else {
                        botView.sendInvalidOrganization(ctx);
                    }
                    break;
                case 'getEmployeeNumber':
                    const employeeName = botModel.getEmployeeName(text);
                    if (employeeName) {
                        session.name = employeeName;
                        session.step = 'getStockCode';
                        botView.sendWelcome(ctx, employeeName);
                    } else {
                        botView.sendUnauthorized(ctx);
                    }
                    break;
                case 'getStockCode':
                    if (text === 'Next Stock Code') {
                        session.stockCode = null;
                        session.step = 'getStockCode';
                        botView.sendNextStockCodePrompt(ctx);
                    } else if (/^\d{6}$/.test(text)) {
                        const stockCodeExists = await botModel.checkStockCodeInSheet(text);
                        if (stockCodeExists) {
                            botView.sendStockCodeExists(ctx);
                        } else {
                            session.stockCode = text;
                            session.step = 'getPhoto';
                            botView.sendPhotoPrompt(ctx);
                        }
                    } else {
                        botView.sendInvalidStockCode(ctx);
                    }
                    break;
            }
        }
    });

    bot.on('photo', async (ctx) => {
        const userId = ctx.from.id;
        const session = sessions[userId];

        if (session && session.step === 'getPhoto') {
            try {
                const fileId = ctx.message.photo.pop().file_id;
                const fileLink = await ctx.telegram.getFileLink(fileId);
                const filePath = await botModel.downloadFile(fileLink);
                await botModel.compressAndResizeImage(filePath);

                const newFileName = `${session.stockCode}${path.extname(filePath)}`;
                const folderId = session.organization === 'KAL' ? process.env.KAL_FOLDER_ID : process.env.KBL_FOLDER_ID;
                const fileDriveId = await botModel.uploadFileToDrive(filePath, newFileName, folderId);

                const row = [session.name, session.stockCode, new Date().toLocaleDateString(), `https://drive.google.com/uc?id=${fileDriveId}`, session.organization];
                await botModel.appendRowToSheet(row);

                fs.unlinkSync(filePath);

                botView.sendPhotoUploaded(ctx);
                session.previousStockCode = session.stockCode;
                session.stockCode = null;
                session.step = 'getStockCode';
            } catch (error) {
                botView.sendPhotoProcessingError(ctx);
                console.error('Error processing photo:', error);
            }
        }
    });
};
