// Importar express
const express = require("express");
// Creacion del router
const router = express.Router()
// Importar path
const path = require('path')


// Importar auth check
const { isAuthCheck } = require("./auth/Auth_Middleware");
const { getMyUserData, fgetMinecraftData, fgetMyActivity } = require("./dataGetters/get_UserData");

router.use(isAuthCheck)

// TODO: Send this to apiRequest.routes.js
// const { getMyUserData } = require("./dataGetters/get_UserData");
// router.use(getMyUserData) // res.userdata = username mail mcAccount payement groups friends achievements uit balance registration_date


router.get('/profile', getMyUserData, async (req, res) => {
    console.log(`User ${req.user.username} accessed profile.`);
    const mcData = await fgetMinecraftData(req)
    res.render('user/profile', {
        user: req.userData,
        minecraftData: mcData,
        activity:  await fgetMyActivity(req)
    })
});

router.get('/edit-profile', getMyUserData, async (req, res) => {
    console.log(`User ${req.user.username} accessed profile.`);
    res.render('user/edit-profile', {
        user: req.userData
    })
});

router.get('/change-password', getMyUserData, async (req, res) => {
    console.log(`User ${req.user.username} accessed profile.`);
    res.render('user/change-password', {
        user: req.userData,
    })
});

router.get('/report', (req, res) => {
    console.log(`User ${req.user.username} accessed reports.`);
    res.render('user/report')
});

router.get('/console', getMyUserData, (req, res) => {
    console.log(`User ${req.user.username} accessed console.`);
    res.render('user/console', {
        user: req.userData
        
    })
});


module.exports = router