const fs = require('fs');
const path = require('path');

module.exports = {
    createFolderIfNotExists(folderPath) {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
    },

    deleteFile(filePath) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};
