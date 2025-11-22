const jwt = require("jsonwebtoken");

// Importante: El secreto debe ser el mismo que en server.js
const JWT_SECRET = process.env.JWT_SECRET || 'SuperSecret91203718237';
const Users = require('../models/userModel.js')

/**
 * Middleware para verificar si el usuario está autenticado a través de JWT.
 * Se espera que el token se encuentre en la cookie 'sessionId'.
 */
async function isAuthCheck(req, res, next) {
    // Check for the 'token' cookie, which stores the JWT
    const token = req.cookies.sessionId; 
    
    if (!token) {
        // 401 Unauthorized - No token found
        // TODO: Change this for an actual 404 cool page
        return res.status(401).send({ message: "Unauthorized: No token provided" });
    }
    
    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check the database for the user given that it is not deleted 
        const user_in_check = await Users.findOne({username: decoded.username, $nor: [{deletedAccount: true}]});
        // If user is deleted account, return error
        if (!user_in_check) return res.status(401).send({ message: "Unauthorized: Invalid or expired login" });
        
        // Attach the decoded payload (e.g., userId) to the request object for use in routes
        req.user = decoded; 
        
        return next(); // Token is valid, continue to the route handler
    } catch (err) {
        // 401 Unauthorized - Token is invalid or expired
        return res.status(401).send({ message: "Unauthorized: Invalid or expired login" });
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
