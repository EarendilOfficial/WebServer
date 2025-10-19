// ---- Header ---- //
// Creacion del servidor

const express = require("express");
const app = express();
app.set('trust proxy', 1); //Get the actual ip from the client
const { apiLimiter, generalLimiter, loginLimiter } = require("./security/rateLimiter.js");
const { isAuthCheck } = require("./auth/Auth_Middleware.js"); // Middleware
const { loginUser, logoutUser, registerNewUser } = require("./auth/User_Authentication.js"); // Controlador
const { registerValidationRules, validate } = require("./security/userRegistrationValidation.js");

// Creacion de la cookie (Para login)
const cookieParser = require("cookie-parser");

// Cookies & JWT 😋🍪🥛😋
app.use(express.json({
    // Limit in case of trash reqs 
    limit: '5kb' 
}));
app.use(cookieParser());
app.use(generalLimiter);

// Conexion a la BD
const mongoose = require("mongoose");
mongoose.set('sanitizeFilter', true); // IMPORTANTE: Sanitizar la entrada para prevenir ataques de inyeccion
mongoose.connect('mongodb://localhost:27017/UserData')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const playerCodesDB = mongoose.createConnection('mongodb://localhost:27017/PlayerCodes')
playerCodesDB.on('connected', () => {
    console.log('MongoDB connected to PlayerCodes DB');
});
// ---- Fin de header ---- //




// ---- Routes ---- //
const PORT = 3001;
const path = require("path");
const protectedRoutes = require("./protected.routes.js");
const adminRoutes = require("./admin.routes.js");
const apiRequestRoutes = require("./apiRequest.routes.js");

app.use('/app', protectedRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRequestRoutes);


// ------------------------- USER AUTH API --------------------- //
// Public route for login
app.post('/login', loginLimiter, async (req, res)=>{
    const result = await loginUser(req, res);

    if (!result.succesful) return res.status(401).json(result);
    return res.json(result);
});

app.post('/logout', loginLimiter, isAuthCheck, async (req, res)=>{
    console.log(`[LOGOUT] - User ${req.user.username} just logged out!`)
    const result = await logoutUser(res);
    return res.json(result);
});

// Public route for registering new users
app.post('/usr-new-register', loginLimiter, registerValidationRules(), validate, async (req, res)=>{
    console.log("[Register] - Procesando solicitud...");
    const result = await registerNewUser(req);
    console.log("[Register] - Resultado de la solicitud: " + result.reason);
    return res.json(result);
});


// ------------------------ EXPOSED PAGES ---------------------- //
// Login
app.get('/', apiLimiter, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend/login.html"))
});

// Registration path
app.get('/register-user', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend/register-user.html"));
});

app.use(express.static(path.join(__dirname, "..", 'frontend/public')));


// ---- Server Start ---- //
app.listen(PORT, () => {
    console.log(`Server Started at: http://localhost:${PORT}`);
    console.log(`Access the unprotected root: http://localhost:${PORT}`);
    console.log(`Test protected route: http://localhost:${PORT}/protected`);
    console.log('-------------------------------------------------------')
});


// Manejo de requests malformados
app.use((err, req, res, next) => {
    // Si el error es una instancia de SyntaxError y tiene el tipo 'entity.parse.failed',
    // significa que el JSON estaba malformado.
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        // Log solo el evento de error, no el cuerpo malicioso.
        console.error('ERROR: Malformed JSON received from IP:', req.ip); 
        return res.status(400).send({ message: 'Bad Request: Malformed JSON' });
    }

    // Para cualquier otro error no manejado, déjalo pasar.
    next(); 
});