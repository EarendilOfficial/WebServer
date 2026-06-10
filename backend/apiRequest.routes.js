const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')

// Importar los schemas

// Importar auth check
const { isAuthCheck, isAdminCheck } = require("./auth/Auth_Middleware.js");
const { getMinecraftData, getMyUserData, getMyActivity } = require("./dataGetters/get_UserData.js")

// Importar controladores y funciones
const { saveAnnouncementHandler, getLatestAnnouncementsHandler } = require('./apiControllers/dashboard/anouncementsController.js');
const { fgetActiveUserCount } = require('./dataGetters/get_activeUserCount.js');
const { fgetUsersSafeData } = require('./dataGetters/get_UserSafeData.js');
const { sendReportHandler } = require('./apiControllers/reports/playerReportController.js');
const { reportValidationRules, validateReport } = require('./security/reportValidation.js');
const { reportLimiter } = require('./security/rateLimiter.js');
const { getActiveEvents } = require('./dataGetters/get_activeEvents.js');
const createEventsHandler = require('./apiControllers/dashboard/eventsController.js');
const getLatestUpdate = require('./dataGetters/get_lastUpdate.js');
const { setNotificationRead, getMyNotifications, removeNotification } = require('./apiControllers/notificationController.js');
const { updateMyProfile, changePassword } = require('./apiControllers/user/updateAccountController.js');
const { getMyMails, createMail, deleteMail, markMailRead } = require('./apiControllers/mailController.js');


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

router.get('/get_my_data', getMyUserData, (req, res) => {
    return res.status(200).json(req.userData);
})

router.get('/get_my_activity', getMyActivity, (req, res) => {
    return res.status(200).json(req.activity);
})

/// ---------- NOTIFICACIONES ------------ ///
router.get("/get_my_notifications", getMyNotifications)

router.put("/set_notification_read", setNotificationRead)

router.post("/delete_notification", removeNotification)

/// ------------ CORREOS ------------ ///
// RESTful mail endpoints used by the frontend
router.get('/mails', getMyMails);
router.post('/mails', createMail);
router.delete('/mails/:id', deleteMail);
router.post('/mails/:id/mark-read', markMailRead);

/// -------------------------------------- ///
/// -------------------------------------- ///
/// -------------------------------------- ///

// Update user profile
router.post("/user/update_profile", updateMyProfile)
router.post("/user/change_password", changePassword)

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

// Endpoint para la Última Actualización
router.get('/get_latest_update', async (req, res) => {
    try {
        return res.json(await getLatestUpdate() || latestUpdate);
    } catch (e) {
        return res.status(500).json({ error: 'Fallo al obtener actualización' });
    }
});

// Endpoint para Eventos Activos
router.get('/get_active_events', async (req, res) => {
    try {
        // Obtencion de datos:
        const activeEvents = await getActiveEvents();

        return res.json({ events: activeEvents });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ error: 'Fallo al obtener eventos' });
    }
});

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

router.post('/add_event', isAdminCheck, createEventsHandler);

module.exports = router;