const jwt = require("jsonwebtoken");
const Users = require("../models/userModel.js"); // Asume que userModel.js está en el mismo nivel
const MinecraftData = require("../models/minecraftData.js"); // Asume que userModel.js está en el mismo nivel
const uitSchema = require("../schema/uit.js");
const mongoose = require("mongoose"); 

// Conexión a la base de datos secundaria para UIT
const playerCodesDB = mongoose.createConnection('mongodb://localhost:27017/PlayerCodes');
const UIT = playerCodesDB.model('uidtoken', uitSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'SuperSecret91203718237';


/**
 * Lógica de inicio de sesión. Sólo devuelve el payload del JWT si es exitoso,
 * o lanza un error si falla.
 * @returns {object} Payload del JWT (userId, username)
*/
async function loginUser(req, res) {
    try {
        const {username, password} = req.body;
        console.log(`Login attempt: {username: ${username}}, password: secret`);

        const user = await Users.findOne({username: username});
        if (!user) return { succesful: false, reason: "Usuario o contraseña incorrectos, intentelo de nuevo porfavor 😅"}
        
        const match = await user.comparePassword(password);
        if (!match) return  { succesful: false, reason: "Usuario o contraseña incorrectos, intentelo de nuevo porfavor 😅"}
        
        // Definición de las 24 horas en milisegundos (24 * 60 * 60 * 1000)
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

        // Creacion del webtoken
        const token = jwt.sign(
            { userId: user._id, username: user.username, mcAccount: user.mcAccount }, 
            JWT_SECRET, 
            { expiresIn: "24h" } // Duración del token JWT: 24 horas
        );

        // Creacion de la cookie para guardar el token login
        res.cookie("sessionId", token, { 
            httpOnly: true,
            sameSite: 'Lax',
            secure: process.env.NODE_ENV === 'production', 
            maxAge: oneDayInMilliseconds // Duración de la cookie: 24 horas en milisegundos
        });
        
        return { succesful: true, reason: "Login exitoso"}
    } catch (e) {
        return { succesful: false, reason: `${e}`}
    }
}

async function logoutUser(res) {
    res.clearCookie("sessionId"); 
}

/**
 * Lógica de registro de nuevo usuario.
 * @param {object} req - La peticion http
 */
async function registerNewUser(req) {
    try {
        const {username, mail, password, uit} = req.body;
        
        // Search database for UIT, if not found, return reason
        const uitDataBase = await UIT.findOne({uit_code: uit});
        if (!uitDataBase) return {succesful: false, reason: "Codigo UIT no encontrado! (solo se puede usar una vez, debes comprar uno)"};
        
        // Search for already existing account with same mail, username, or mcAccount 
        const same_mail = await Users.findOne({mail: mail});
        const same_username = await Users.findOne({username: username});
        const same_mcAccount = await Users.findOne({mcAccount: uitDataBase.mcAccount});
        // If any of those things already claimed, reject and inform reason
        if (same_mail) return {succesful: false, reason: "Ese correo ya esta registrado!"};
        if (same_username) return {succesful: false, reason: "Ese nombre de usuario ya esta tomado!"};
        if (same_mcAccount) return {succesful: false, reason: "La cuenta de Minecraft asociada a ese UIT ya esta registrada, contacte un administrador"};
        
        //If nothing has gone wrong yet check password validity
        if (!password || password.length <= 5) return {succesful: false, reason: "Contraseña invalida"};
        
        //If everything went right: Create New User
        await Users.create({
            username: username,
            mail: mail,
            password: password,
            uit: uit,
            mcAccount: uitDataBase.mcAccount,
            archievements: ["Joined the server!"]
        });

        // Save a mcData entry for people with a minecraft account
        if (uitDataBase.mcAccount) {
            await MinecraftData.create({
                mcAccount: uitDataBase.mcAccount
            })
        }

        // Delete the used UIT
        await UIT.deleteOne({uit_code: uit});

        return {succesful: true, reason: "Usuario registrado exitosamente, se le redirigira a login..."};

    } catch (e) {
        console.error(`${e}`);
        return {succesful: false, reason: "Error del servidor, por favor contacte la administracion"}
    }
}

module.exports = { loginUser, logoutUser, registerNewUser };
