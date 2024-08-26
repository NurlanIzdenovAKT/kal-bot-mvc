const fs = require('fs');
const { google } = require('googleapis');

const credentials = JSON.parse(fs.readFileSync('./google.json'));

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.metadata'
    ]
});

const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });

module.exports = { drive, sheets };
