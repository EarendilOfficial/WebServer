const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')

// Importar los schemas

// Importar auth check
const { isAuthCheck, isAdminCheck } = require("./auth/Auth_Middleware.js");
const { getMinecraftData } = require("./dataGetters/get_UserData.js")

// Importar controladores y funciones
const { saveAnnouncementHandler, getLatestAnnouncementsHandler } = require('./apiControllers/dashboard/anouncementsController.js');
const { fgetActiveUserCount } = require('./dataGetters/get_activeUserCount.js');
const { fgetUsersSafeData } = require('./dataGetters/get_UserSafeData.js');
const { sendReportHandler } = require('./apiControllers/reports/playerReportController.js');
const { reportValidationRules, validateReport } = require('./security/reportValidation.js');
const { reportLimiter } = require('./security/rateLimiter.js');


// El chequeo de autenticacion se aplica a todas las rutas
router.use(isAuthCheck);
router.use(express.json({
    limit: '5kb'
})); 


// ---------------- RUTAS --------------- //
// Obtiene los ultimos anuncios de la base de datos
router.get('/get_content_latest', getLatestAnnouncementsHandler)

// Get all the minecraft data
router.get('/get_minecraft_data', getMinecraftData, (req, res) => {
    return res.status(200).json(req.minecraftData);
})

// Get user count
router.get('/get_user_count', async ({res}) => {
    const playerCount = await fgetActiveUserCount();
    return res.status(200).json({number: playerCount});
})

// Get playernames or username (if playername not available) for reports // Return: Array(name, name, ...)
router.get('/get_player_names', async ({res}) => {
    let playersData = await fgetUsersSafeData();
    playersData = playersData.map((user)=> {
        return user.mcAccount || user.username;
    })
    
    return res.status(200).json({playersData: playersData})
})

// Add a report to the database
router.post(
    '/sendReport', reportLimiter,
    reportValidationRules(), // 1. Aplica las reglas (limpieza y validación)
    validateReport,          // 2. Maneja los errores si la validación falla
    sendReportHandler        // 3. Si todo está limpio, guarda en la base de datos
);


// ---------------- RUTAS ADMINISTRADOR --------------- //
// - - - admin-edit-announcements.html
// This is only accesible to admin (isAdminCheck is middleware for admin verification)
router.post('/save_announcement', isAdminCheck, saveAnnouncementHandler);


module.exports = router;