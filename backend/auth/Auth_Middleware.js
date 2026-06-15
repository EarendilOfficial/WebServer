const jwt = require("jsonwebtoken");

// Importante: El secreto debe ser el mismo que en server.js
const JWT_SECRET = process.env.JWT_SECRET || 'SuperSecret91203718237';
const Users = require('../models/userModel.js')

/**
 * Middleware para verificar la autenticación del usuario.
 * Soporta cookies (Web) y encabezados Authorization: Bearer <token> (Android/Retrofit).
 */
async function isAuthCheck(req, res, next) {
    let token = req.cookies.sessionId; 
    
    // Si no hay cookie, buscar en el encabezado Authorization (Android/Retrofit).
    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }
    
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    
    try {
        // Verificar el token JWT
        const decoded = jwt.verify(token, JWT_SECRET);

        // Verificar que el usuario exista y no tenga la cuenta eliminada
        const user_in_check = await Users.findOne({
            username: decoded.username, 
            $nor: [{ deletedAccount: true }]
        });
        
        if (!user_in_check) {
            return res.status(401).json({ message: "Unauthorized: Invalid or expired login" });
        }
        
        // Adjuntar datos del usuario a la petición
        req.user = decoded; 
        
        return next(); 
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid or expired login" });
    }
}

async function isAdminCheck(req, res, next) {
    try {
        // Use userId to search for if the user is admin
        if (await isAdmin(req.user.userId)) return next();

        // else
        return res.status(401).send({message: "Unauthorised, not admin"})
    } catch (e) {
        console.log(e)
        res.status(401).send({message: "Unauthorised, not admin"})
    }
}

async function isAdmin(id){
    const user = await Users.findById(id);
    if (user.isAdmin == true) return true;
    return false;
}


module.exports = { isAuthCheck, isAdminCheck };
