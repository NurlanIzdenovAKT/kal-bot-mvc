
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
    '667': 'Кажмуратов Жанболат',
    '745': 'Кузьмин Евгений',
    '7966': 'Айтказин Руслан',
    '10863': 'Сарсенбаев Даулетяр',
    '2066': 'Батырбек Азамат',
    '11503': 'Абдиев Нурахмет',
    '10919': 'Оспантаев Алишер',
    '14360': 'Лячин Игорь',
    '14033': 'Уалибеков Сундет',
    '4967': 'Раимбеков Мурат',
    '12036': 'Алимханов Олжас',
    '2828': 'Метелёв Олег',
    '10533': 'Лаптев Александр',
    '8303': 'Хе Руслан',
    '10978': 'Дюйсембаев Дамир',
    '4956': 'Дуйсенов Жарас',
    '6115': 'Горбунов Денис',
    '7480': 'Касаинов Дамир',
    '10722': 'Насенов Руслан',
    '14175': 'Аубакиров Ербол',
    '12034': 'Ратнер Иван',
    '11796': 'Тё Игорь',
    '10825': 'Сулейманов Ермек',
    '11841': 'Кайноллаев Данияр',
    '4885': 'Солошенко Евгений',
    '10536': 'Тургамбаев Ильяс',
    '11136': 'Слямов Едил',
    '9470': 'Пермебек Айбек',
    '10926': 'Шепард Сергей',
    '318': 'Татьянкин Евгений',
    '5515': 'Самсонов Кирилл',
    '2004': 'Фетисов Алексей',
    '8668': 'Ткач Даниил',
    '7581': 'Курочкин Евгений',
    '11836': 'Муса Талгат',
    '11798': 'Мамедов Вугар',
    '11733': 'Томасевич Сергей',
    '14032': 'Бектемиров Салимжан',
    '7470': 'Тетюхин Денис',
    '12012': 'Қасымханов Қанағат',
    '7629': 'Рымбек Бекзат',
    '10581': 'Дильманов Арман',
    '460': 'Хмара Игорь',
    '6776': 'Бортницкий Александр',
    '11169': 'Джумадиллаев Иззатулла',
    '7486': 'Жакупов Нурбол',
    '4790': 'Гузеев Анатолий',
    '11782': 'Волков Ян',
    '14214': 'Уахитов Максат',
    '11730': 'Орынбеков Жомарт',
    '14093': 'Кудайберген Аллаберген',
    '6888': 'Минатуллин Руслан',
    '8816': 'Абди Адлет',
    '11208': 'Агайданов Елдар',
    '11764': 'Яцук Владимир',
    '11135': 'Данкин Султан',
    '5469': 'Ким Юрий Сергеевич',
    '11683': 'Изденов Нурлан Равилович',
    '10599': 'Данилюк Дмитрий Михайлович',
    '4591': 'Уристемов Жанат Сеильбекович',
    '11181': 'Темирханова Венера Рамильевна',
    '7978': 'Котов Виктор Владленович',
    '4217': 'Төлеухан Аблайхан Өнерханұлы',
    '7712': 'Есиркепов Айбек Толкинович',
    '12053': 'Умирзаков Айбар Куралбаевич',
    '12171': 'Абдурахманов Нурсултан Бердиярулы',
    '11757': 'Зьяденев Танат Нурболатулы',
    '9492': 'Бекен Сұңғат Базарханұлы',
    '10996': 'Жалгелдеев Серик Хайргалиевич',
    '6481': 'Жағыпар Рүстем Жанахметұлы',
    '10354': 'Мамадбек Жолдас Нұрланұлы',
    '10260': 'Арман Марат',
    '11638': 'Марат Адильхан Маратулы',
    '10747': 'Куздеуов Сайран Кеншилыкович',
    '8777': 'Жусупов Дидар Куанышбекович',
    '5485': 'Баймуратов Газиз Кенжегалиевич',
    '1556': 'Сабиров Нұрдаулет Амантайұлы',
    '10851': 'Абенов Ануар Аскарович',
    '8070': 'Джарилкапов Даулет Маратович',
    '5079': 'Ербасынов Сержан Нуржанович',
    '7444': 'Ажикенов Азат Даулетханович',
    '12247': 'Турысбеков Жандос Максатович',
    '10379': 'Мәшіров Рауан Исламұлы',
    '7266': 'Искаков Данияр Нурсаинұлы',
    '8640': 'Жангирханов Мадияр Муратович',
    '11178': 'Кузембаев Бекболат Муратович',
    '14119': 'Кусайнов Айдар Омарбекович',
    '11324': 'Сарсенов Архат Жумабекович',
    '14113': 'Кадралин Галымжан Сайлаугазиевич',
    '10462': 'Калиев Алибек Нурмаханович',
    '11735': 'Жаныкулов Султан Саматович',
    '11331': 'Узбеков Илья',
    '4546': 'Миличкин Евгений Андреевич',
    '5482': 'Ручкин Сергей Александрович',
    '5426': 'Абдрахманов Арсен Алексеевич',
    '7278': 'Анкобаев Ринат Сетканович',
    '11151': 'Измайлов Моисей Андреевич',
    '6702': 'Жылкыжияров Алмас Базарханович',
    '11511': 'Қабдрашов Мирас Нұрланұлы',
    '12068': 'Рамазанов Рауан Манарбекович',
    '11740': 'Касымов Серикжан Жанахметулы',
    '10560': 'Сабитов Руслан Рашидович',
    '9883': 'Рымжан Бекжан Ержанұлы',
    '11846': 'Рымбек Рауан Айбекұлы',
    '9654': 'Асылгазин Амиржан Жомартулы',
    '7678': 'Қуанбек Нұрлан Батыржанұлы',
    '8775': 'Абдуллин Асан Айжанович',
    '9886': 'Тұрсынбаев Біржан Бағдатұлы',
    '14115': 'Карымсаков Асхат Маратович',
    '14109': 'Амирханов Асхан Амирович',
    '8332': 'Бекназаров Сахитжан Серікұлы',
    '8043': 'Болатұлы Абдусеит',
    '8859': 'Байкенжин Берик Жанатович',
    '7316': 'Исмазов Хусейн Раушанович'
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
