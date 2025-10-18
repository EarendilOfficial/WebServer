const express = require('express');
const router = express.Router();
const path = require ("path");

// Importar auth check
const { isAuthCheck, isAdminCheck } = require("./auth/Auth_Middleware.js");

// El chequeo de autenticacion se aplica a todas las rutas
router.use(isAuthCheck, isAdminCheck);

// router.use(express.json({ // TODO: Probablemente innecesario (quitar en produccion)
//     limit: '5kb'
// })); 

// ------------------------ RUTAS PROTEGIDAS ----------------------- //

router.get('/edit_anounncements', (req, res) => {
    // Como el middleware ya corrió, podemos asumir que req.user existe.
    console.log(`User ${req.user.username} accessed announcements.`);
    res.sendFile(path.join(__dirname, "..", "frontend/admin-edit-announcements.html"));
});

router.get('/reports', (req, res) => {
    console.log(`User ${req.user.username} accessed reports.`);
    res.sendFile(path.join(__dirname, "..", "frontend/reports.html"));
});


router.use(express.static(path.join(__dirname, "..", 'frontend/private')));


module.exports = router;