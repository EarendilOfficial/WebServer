const express = require('express');
const announcementSch = require('./schema/announcementSchema.js')
const router = express.Router();
const mongoose = require('mongoose')

// Importar los schemas

// Importar auth check
const { isAuthCheck, isAdminCheck } = require("./auth/Auth_Middleware.js");
const { getMinecraftData } = require("./dataGetters/get_UserData.js")

// Importar controladores que obtienen el contenido
const { getLatestAnnouncementsController, saveAnnouncementController } = require('./apiControllers/anouncementsController.js');


// El chequeo de autenticacion se aplica a todas las rutas
router.use(isAuthCheck);
router.use(express.json({
    limit: '5kb'
})); 


// ---------------- RUTAS --------------- //
// dashboard.html
router.post('/get_content_latest', getLatestAnnouncementsController)

// Get all the minecraft data
router.post('/get_minecraft_data', getMinecraftData, (req, res) => {
    return res.status(200).json(req.minecraftData);
})

// This is only accesible to admin (isAdminCheck is middleware for admin verification)
router.post('/save_announcement', isAdminCheck, saveAnnouncementController);


module.exports = router;