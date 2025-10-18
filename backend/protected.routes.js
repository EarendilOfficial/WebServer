const express = require('express');
const router = express.Router();
const path = require ("path");

// Importar auth check
const { isAuthCheck } = require("./auth/Auth_Middleware.js");

// El chequeo de autenticacion se aplica a todas las rutas
router.use(isAuthCheck);

// router.use(express.json({ // TODO: Probablemente innecesario (quitar en produccion)
//     limit: '5kb'
// })); 

// ------------------------ RUTAS PROTEGIDAS ----------------------- //

router.get('/dashboard', (req, res) => {
    // Como el middleware ya corrió, podemos asumir que req.user existe.
    console.log(`User ${req.user.username} accessed dashboard.`);
    res.sendFile(path.join(__dirname, "..", "frontend/dashboard.html"));
});

router.get('/reports', (req, res) => {
    console.log(`User ${req.user.username} accessed reports.`);
    res.sendFile(path.join(__dirname, "..", "frontend/reports.html"));
});




module.exports = router;