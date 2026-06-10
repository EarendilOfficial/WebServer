const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // 👈 Importamos crypto para generar el código aleatorio
const Users = require("../models/userModel.js"); 
const MinecraftData = require("../models/minecraftData.js"); 
const Activity  = require("../models/activityModel.js");
const uitSchema = require("../schema/uit.js");
const mongoose = require("mongoose"); 

// Conexión a la base de datos secundaria para UIT
const { playerCodesDB } = require('../db.connection')
const UIT = playerCodesDB.model('uidtoken', uitSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'SuperSecret91203718237';

/**
 * Función auxiliar para generar un código UIT con formato "XXXX-XXXX-XXXX"
 */
function generateUitCode() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const genPart = (length) => Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${genPart(4)}-${genPart(4)}-${genPart(4)}`;
}

/**
 * Lógica de inicio de sesión. Sólo devuelve el payload del JWT si es exitoso,
 * o lanza un error si falla.
 * @returns {object} Payload del JWT (userId, username)
*/
async function loginUser(req, res) {
    try {
        const {username, password} = req.body;
        console.log(`Login attempt: {username: ${username}}, password: secret`);

        const user = await Users.findOne({username: username, $nor: [{deletedAccount: true}]});
        if (!user) return { succesful: false, reason: "Usuario o contraseña incorrectos, intentelo de nuevo porfavor 😅"}
        
        const match = await user.comparePassword(password);
        if (!match) return  { succesful: false, reason: "Usuario o contraseña incorrectos, intentelo de nuevo porfavor 😅"}
        
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

        const token = jwt.sign(
            { userId: user._id, username: user.username, mcAccount: user.mcAccount }, 
            JWT_SECRET, 
            { expiresIn: "24h" } 
        );

        res.cookie("sessionId", token, { 
            httpOnly: true,
            sameSite: 'Lax',
            secure: process.env.NODE_ENV === 'production', 
            maxAge: oneDayInMilliseconds 
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
 * Lógica de registro de nuevo usuario con generación AUTOMÁTICA de UIT.
 * @param {object} req - La peticion http
 */
async function registerNewUser(req) {
    try {
        // 👈 Ya no recibimos 'uit' desde el req.body porque se creará solo.
        // Asumo que puedes recibir 'mcAccount' (cuenta de Minecraft) opcionalmente desde el formulario.
        const { username, mail, password, mcAccount } = req.body;
        
        // 1. Validaciones previas básicas
        if (!password || password.length <= 5) return {succesful: false, reason: "Contraseña invalida"};

        // 2. Buscar si ya existen cuentas con el mismo mail o username
        const same_mail = await Users.findOne({mail: mail});
        const same_username = await Users.findOne({username: username});
        if (same_mail) return {succesful: false, reason: "Ese correo ya esta registrado!"};
        if (same_username) return {succesful: false, reason: "Ese nombre de usuario ya esta tomado!"};

        // 3. Si mandó cuenta de Minecraft, validar que no esté registrada ya
        if (mcAccount) {
            const same_mcAccount = await Users.findOne({mcAccount: mcAccount});
            if (same_mcAccount) return {succesful: false, reason: "La cuenta de Minecraft ya esta registrada, contacte un administrador"};
        }

        // 4. GENERACIÓN AUTOMÁTICA DEL CÓDIGO UIT ÚNICO
        let nuevoCodigoUit;
        let esUnico = false;
        
        // Bucle de seguridad por si el destino genera un código idéntico (es raro, pero por seguridad de la propiedad 'unique')
        while (!esUnico) {
            nuevoCodigoUit = generateUitCode();
            const existe = await UIT.findOne({ uit_code: nuevoCodigoUit });
            if (!existe) esUnico = true;
        }

        // 5. Crear el registro en la base de datos de UITs (playerCodesDB)
        await UIT.create({
            uit_code: nuevoCodigoUit,
            mcAccount: mcAccount || undefined,
            // registration_date se setea automáticamente gracias al .pre('save') de tu esquema
        });

        // 6. Crear el nuevo usuario en la DB Principal vinculando el código generado
        await Users.create({
            username: username,
            mail: mail,
            password: password,
            uit: nuevoCodigoUit, // Asignamos el código recién creado
            mcAccount: mcAccount || undefined,
            achievements: ["Joined the server!"],
            isAdmin: true
        });

        // 7. Crear colecciones secundarias necesarias
        await Activity.create({
            username: username
        });

        if (mcAccount) {
            await MinecraftData.create({
                mcAccount: mcAccount
            });
        }

        // Modificamos el mensaje de éxito para mostrarle su nuevo código en pantalla
        return {
            succesful: true, 
            reason: `Usuario registrado exitosamente. Tu código de acceso obligatorio es: ${nuevoCodigoUit}. ¡Guárdalo bien! Se le redirigira a login...`
        };

    } catch (e) {
        console.error(`${e}`);
        return {succesful: false, reason: "Error del servidor, por favor contacte la administracion"}
    }
}

module.exports = { loginUser, logoutUser, registerNewUser };