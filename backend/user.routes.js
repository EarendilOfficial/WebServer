// Importar express
const express = require("express");
// Creacion del router
const router = express.Router()
// Importar path
const path = require('path')


// Importar auth check
const { isAuthCheck } = require("./auth/Auth_Middleware");

router.use(isAuthCheck)

// TODO: Send this to apiRequest.routes.js
// const { getMyUserData } = require("./dataGetters/get_UserData");
// router.use(getMyUserData) // res.userdata = username mail mcAccount payement groups friends achievements uit balance registration_date

router.get('/report', (req, res) => {
    console.log(`User ${req.user.username} accessed reports.`);
    res.render('user/report')
});


module.exports = router