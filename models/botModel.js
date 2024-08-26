const { drive, sheets } = require('../config/googleConfig');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const employees = {
    '11683': 'Нурлан Изденов',
    '222333': 'Сергей Ручкин'
};

module.exports = {
    getEmployeeName(employeeNumber) {
        return employees[employeeNumber] || null;
    },

    async checkStockCodeInSheet(stockCode) {
        try {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'Sheet1!B:B'
            });
            const values = response.data.values || [];
            return values.some(row => row[0] && row[0].trim() === stockCode);
        } catch (error) {
            console.error('Error checking stock code in Google Sheets:', error);
            throw error;
        }
    },

    async downloadFile(url) {
        const response = await axios({ url, responseType: 'stream' });
        const filePath = path.join(__dirname, '../downloads/photo.jpg');
        response.data.pipe(fs.createWriteStream(filePath));
        return new Promise((resolve, reject) => {
            response.data.on('end', () => resolve(filePath));
            response.data.on('error', reject);
        });
    },

    async compressAndResizeImage(filePath) {
        const tempFilePath = path.join(__dirname, '../downloads/photo_temp.jpg');
        await sharp(filePath)
            .resize(225, 300, { fit: 'cover' })
            .toFile(tempFilePath);
        fs.renameSync(tempFilePath, filePath);
    },

    async uploadFileToDrive(filePath, newFileName, folderId) {
        const fileMetadata = { name: newFileName, parents: [folderId] };
        const media = { mimeType: 'image/jpeg', body: fs.createReadStream(filePath) };
        try {
            const response = await drive.files.create({ resource: fileMetadata, media: media, fields: 'id' });
            return response.data.id;
        } catch (error) {
            console.error('Error uploading file to Google Drive:', error);
            throw error;
        }
    },

    async appendRowToSheet(row) {
        try {
            await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'Sheet1!A:E',
                valueInputOption: 'RAW',
                resource: { values: [row] }
            });
        } catch (error) {
            console.error('Error appending row to Google Sheets:', error);
            throw error;
        }
    }
};
