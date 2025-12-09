
const express = require('express');
const router = express.Router();
const path = require ("path");

// Importar auth check
const { isAuthCheck, isAdminCheck } = require("./auth/Auth_Middleware.js");

const articleRouter = require('./articles');
// El chequeo de autenticacion se aplica a todas las rutas
router.use(isAuthCheck, isAdminCheck);

// ------------------------ RUTAS PROTEGIDAS ----------------------- //

router.get('/edit_anounncements', (req, res) => {
    // Como el middleware ya corrió, podemos asumir que req.user existe.
    console.log(`User ${req.user.username} accessed announcements.`);
    res.render('admin/edit-announcements')
});

router.get('/reports', (req, res) => {
    console.log(`User ${req.user.username} accessed reports.`);
    res.sendFile(path.join(__dirname, "..", "frontend/handleReports.html"));
});

router.use('/admin-blogs', articleRouter);

router.use(express.static(path.join(__dirname, "..", 'frontend/private')));

module.exports = router;