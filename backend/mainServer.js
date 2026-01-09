// ---- Header ---- //
// Creacion del servidor

const updatingServerMaintenence = true; // ESTADO DEL SERVIDOR
const dateMaintenenceEnd = new Date("January 12, 2026 00:00:00"); // Fecha de fin de mantenimiento
console.log("INICIANDO SERVIDOR EN MODO DE MANTENIMIENTO!!! " + dateMaintenenceEnd.toDateString());

const express = require("express");
const app = express();
const path = require("path");

// --- IMPORTANTE: Aquí importamos las rutas del blog (Si articles.js está en la misma carpeta que este archivo) ---
const methodOverride = require('method-override');
// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'frontend', 'views'));
app.set('trust proxy', 1); 

const { apiLimiter, generalLimiter, loginLimiter } = require("./security/rateLimiter.js");
const { isAuthCheck } = require("./auth/Auth_Middleware.js"); 
const { loginUser, logoutUser, registerNewUser } = require("./auth/User_Authentication.js"); 
const { registerValidationRules, validate } = require("./security/userRegistrationValidation.js");

// Creacion de la cookie
const cookieParser = require("cookie-parser");

// Cookies & JWT 
app.use(express.urlencoded({ extended: false })); // Agregado para que funcionen los formularios del blog
app.use(methodOverride('_method'));
app.use(express.json({ limit: '5kb' }));
app.use(cookieParser());
app.use(generalLimiter);

// Conexion a la BD
const mongoose = require("mongoose");
mongoose.set('sanitizeFilter', true); 
mongoose.connect('mongodb://localhost:27017/UserData')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const playerCodesDB = mongoose.createConnection('mongodb://localhost:27017/PlayerCodes')
playerCodesDB.on('connected', () => {
    console.log('MongoDB connected to PlayerCodes DB');
});


// ---- Fin de header ---- //


// ---- Routes ---- //
const PORT = 6294;
const userRoutes = require("./user.routes.js");
const protectedRoutes = require("./protected.routes.js");
const adminRoutes = require("./admin.routes.js");
const apiRequestRoutes = require("./apiRequest.routes.js");
const publicBlogRouter = require('./publicBlog.routes');
const { log } = require("console");

// ------------------------ BLOGS -----------
//app.use('/articles', articleRouter);
app.use('/news', publicBlogRouter);
// ------------------------ OTRAS RUTAS ---------------------- //

app.use('/user', userRoutes);
app.use('/app', protectedRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRequestRoutes);


// ------------------------- USER AUTH API --------------------- //
app.post('/login', loginLimiter, async (req, res)=>{
    const result = await loginUser(req, res);
    if (!result.succesful) return res.status(401).json(result);

    if (updatingServerMaintenence && Date.now() < dateMaintenenceEnd) {
        result.updateIncoming = true; // Decir si hay mantenimiento
        result.maintenenceEnd = dateMaintenenceEnd; // Fecha fin
    }

    return res.json(result);
});

app.post('/logout', loginLimiter, isAuthCheck, async (req, res)=>{
    console.log(`[LOGOUT] - User ${req.user.username} just logged out!`)
    const result = await logoutUser(res);
    return res.json(result);
});

app.post('/usr-new-register', loginLimiter, registerValidationRules(), validate, async (req, res)=>{
    console.log("[Register] - Procesando solicitud...");
    const result = await registerNewUser(req);
    console.log("[Register] - Resultado de la solicitud: " + result.reason);
    return res.json(result);
});


// ------------------------ EXPOSED PAGES ---------------------- //
// app.get('/', apiLimiter, (req, res) => {
//     res.sendFile(path.join(__dirname, "..", "frontend/login.html"))
// });

app.get('/', apiLimiter, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend/counter.html"))
});

// Registration
app.get('/register-user', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend/register-user.html"));
});

// Static files
app.use(express.static(path.join(__dirname, "..", 'frontend/public')));


// ---- Server Start ---- //
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Started at: http://localhost:${PORT}`);
    console.log(`Access the unprotected root: http://localhost:${PORT}`);
    console.log(`Blog Admin: http://localhost:${PORT}/admin/admin-blogs`); // Agregué esto para que tengas el link a mano
    console.log('-------------------------------------------------------')
});


// Manejo de requests malformados
// app.use((err, req, res, next) => {
//     if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
//         console.error('ERROR: Malformed JSON received from IP:', req.ip); 
//         return res.status(400).send({ message: 'Bad Request: Malformed JSON' });
//     }
//     next(); 
// });
