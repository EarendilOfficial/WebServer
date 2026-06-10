const mongoose = require('mongoose');

// 1. Centralizar las URIs leyendo variables de entorno
const MONGO_URI_USERDATA = process.env.MONGO_URI_USERDATA || 'mongodb://localhost:27017/UserData';
const MONGO_URI_PLAYERCODES = process.env.MONGO_URI_PLAYERCODES || 'mongodb://localhost:27017/PlayerCodes';
const MONGO_URI_HTMLCONTENT = process.env.MONGO_URI_HTMLCONTENT || 'mongodb://localhost:27017/HtmlContent';
const MONGO_URI_MAIL = process.env.MONGO_URI_MAIL || 'mongodb://localhost:27017/Mail';
const MONGO_URI_MESSAGES = process.env.MONGO_URI_MESSAGES || 'mongodb://localhost:27017/Messages';
const MONGO_URI_FEEDBACK = process.env.MONGO_URI_FEEDBACK || 'mongodb://localhost:27017/Feedback';


// Configuración global opcional
mongoose.set('sanitizeFilter', true);

// 2. Crear las instancias de conexión (Se ejecutan UNA sola vez al iniciar la app)
const userDataDB = mongoose.createConnection(MONGO_URI_USERDATA);
const playerCodesDB = mongoose.createConnection(MONGO_URI_PLAYERCODES);
const htmlContentDB = mongoose.createConnection(MONGO_URI_HTMLCONTENT);
const mailDB = mongoose.createConnection(MONGO_URI_MAIL);
const notificationDB = mongoose.createConnection(MONGO_URI_MESSAGES)
const feedbackDB = mongoose.createConnection(MONGO_URI_FEEDBACK)

// Logs de monitoreo de servicios
userDataDB.on('connected', () => console.log('📦 MongoDB conectado a UserData DB'));
playerCodesDB.on('connected', () => console.log('📦 MongoDB conectado a PlayerCodes DB'));
htmlContentDB.on('connected', () => console.log('📦 MongoDB conectado a HtmlContent DB'));
mailDB.on('connected', () => console.log('📦 MongoDB conectado a Mail DB'));
notificationDB.on('connected', () => console.log('📦 MongoDB conectado a Notification DB'));
feedbackDB.on('connected', () => console.log('📦 MongoDB conectado a Feedback DB'));


// 3. Exportar las conexiones ya listas para usarse
module.exports = {
    userDataDB,
    playerCodesDB,
    htmlContentDB,
    mailDB,
    notificationDB,
    feedbackDB
};