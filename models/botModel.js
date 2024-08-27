// models/botModel.js

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const { drive, sheets } = require('../config/googleConfig');

const sessions = {};

// Функция для получения сессии пользователя
exports.getSession = (userId) => {
    if (!sessions[userId]) {
        sessions[userId] = { step: 'getOrganization' };
    }
    return sessions[userId];
};

// Функция для завершения сессии пользователя
exports.endSession = (userId) => {
    delete sessions[userId];
};

// Функция для получения имени сотрудника по номеру
exports.getEmployeeName = (employeeNumber) => {
    const employees = {
        '11683': 'Нурлан Изденов',
        '222333': 'Сергей Ручкин'
        // Добавьте других сотрудников сюда
    };
    return employees[employeeNumber];
};

// Функция для проверки сток кода в Google Sheets
exports.checkStockCodeInSheet = async (stockCode) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Sheet1!B:B'
        });

        const values = response.data.values || [];
        const normalizedStockCode = stockCode.trim();
        return values.some(row => row[0] && row[0].trim() === normalizedStockCode);
    } catch (error) {
        console.error('Error checking stock code in Google Sheets:', error);
        throw error;
    }
};

// Функция для загрузки файла по ссылке
exports.downloadFile = async (url) => {
    const response = await axios({
        url,
        responseType: 'stream'
    });
    const filePath = path.join(__dirname, '../downloads/photo.jpg');
    response.data.pipe(fs.createWriteStream(filePath));
    return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve(filePath));
        response.data.on('error', reject);
    });
};

// Функция для сжатия и обрезки изображения
exports.compressAndResizeImage = async (filePath) => {
    const tempFilePath = path.join(__dirname, '../downloads/photo_temp.jpg');

    console.log(`Сжимаем и обрезаем изображение: ${filePath}`);

    await sharp(filePath)
        .resize(225, 300, { fit: 'cover' }) // Измените размер на 225x300 пикселей
        .toFile(tempFilePath);

    if (fs.existsSync(tempFilePath)) {
        console.log(`Изображение успешно сжато и обрезано: ${tempFilePath}`);
        fs.renameSync(tempFilePath, filePath);
    } else {
        console.error(`Сжатое изображение не создано: ${tempFilePath}`);
        throw new Error(`Сжатое изображение не создано: ${tempFilePath}`);
    }
};

// Функция для загрузки файла на Google Drive
exports.uploadFileToDrive = async (filePath, newFileName, folderId) => {
    const fileMetadata = {
        name: newFileName,
        parents: [folderId]
    };
    const media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(filePath)
    };

    try {
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        });
        return response.data.id;
    } catch (error) {
        console.error('Error uploading file to Google Drive:', error);
        throw error;
    }
};

// Функция для добавления строки в Google Sheets
exports.appendRowToSheet = async (row) => {
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Sheet1!A:E',
            valueInputOption: 'RAW',
            resource: {
                values: [row]
            }
        });
    } catch (error) {
        console.error('Error appending row to Google Sheets:', error);
        throw error;
    }
};
