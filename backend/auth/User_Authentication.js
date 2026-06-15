const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const firebase_admin = require('firebase-admin'); // Librería oficial de Google para Firebase (Auth Moviles)
const { getAuth } = require('firebase-admin/auth');

const Users = require("../models/userModel.js"); 
const MinecraftData = require("../models/minecraftData.js"); 
const Activity  = require("../models/activityModel.js");
const uitSchema = require("../schema/uit.js");
const mongoose = require("mongoose"); 

// Conexión a la base de datos secundaria para UIT
const { playerCodesDB } = require('../db.connection')
const UIT = playerCodesDB.model('uidtoken', uitSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'SuperSecret91203718237';

// Inicializar Firebase Admin
// El archivo .json de credenciales se descarga desde la consola de Firebase
const serviceAccount = require("./firebase-key.json");
firebase_admin.initializeApp({
  credential: firebase_admin.cert(serviceAccount)
});

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
        if (!user) return { successful: false, reason: "Usuario o contraseña incorrectos, intentelo de nuevo porfavor 😅"}
        
        const match = await user.comparePassword(password);
        if (!match) return  { successful: false, reason: "Usuario o contraseña incorrectos, intentelo de nuevo porfavor 😅"}
        
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
        
        return { successful: true, reason: "Login exitoso", token: token, username: user.username }
    } catch (e) {
        return { successful: false, reason: `${e}`}
    }
}

/**
 * Autenticación e Inicio de Sesión / Registro Automático con Google
 * @param {object} req - Petición HTTP conteniendo { idToken }
 */
async function loginGoogleUser(req, res) {
    try {
        const { idToken } = req.body; // El token que te mandó Android desde Firebase
        if (!idToken) return { successful: false, reason: "Falta el ID Token de Firebase." };

        // 1. Verificar el token con Firebase Admin
        let decodedToken;
        try {
            decodedToken = await getAuth().verifyIdToken(idToken);
        } catch (error) {
            console.error("Token de Firebase inválido:", error.message);
            return { successful: false, reason: "Autenticación de Firebase fallida." };
        }

        // Firebase nos da directamente los datos limpios del usuario
        const { email, name } = decodedToken;

        // 2. Buscar o Crear el usuario en tu MongoDB (Misma lógica de antes)
        let user = await Users.findOne({ mail: email, $nor: [{ deletedAccount: true }] });

        if (!user) {
            let baseUsername = name ? name.replace(/\s+/g, '_') : email.split('@')[0];
            let username = baseUsername;
            let count = 1;
            while (await Users.findOne({ username })) {
                username = `${baseUsername}_${count}`;
                count++;
            }

            // Crear el usuario en tu base de datos si no existía
            user = await Users.create({
                username: username,
                mail: email,
                password: crypto.randomBytes(16).toString('hex'), // Clave aleatoria por cumplir el esquema
                achievements: ["Joined via Firebase!"],
                isAdmin: false
            });
        }

        // 3. Crear tu propio JWT para las sesiones de tu servidor / Android
        const token = jwt.sign(
            { userId: user._id, username: user.username, mcAccount: user.mcAccount }, 
            JWT_SECRET, 
            { expiresIn: "24h" } 
        );

        const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
        res.cookie("sessionId", token, { 
            httpOnly: true,
            sameSite: 'Lax',
            secure: process.env.NODE_ENV === 'production', 
            maxAge: oneDayInMilliseconds 
        });

        return { 
            successful: true, 
            reason: "Login exitoso con Firebase", 
            token: token, 
            username: user.username 
        };

    } catch (e) {
        console.error(e);
        return { successful: false, reason: "Error interno del servidor." };
    }
}

async function logoutUser(res) {
    res.clearCookie("sessionId");
    return { successful: true };
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
        if (!password || password.length <= 5) return {successful: false, reason: "Contraseña invalida"};

        // 2. Buscar si ya existen cuentas con el mismo mail o username
        const same_mail = await Users.findOne({mail: mail});
        const same_username = await Users.findOne({username: username});
        if (same_mail) return {successful: false, reason: "Ese correo ya esta registrado!"};
        if (same_username) return {successful: false, reason: "Ese nombre de usuario ya esta tomado!"};

        // 3. Si mandó cuenta de Minecraft, validar que no esté registrada ya
        if (mcAccount) {
            const same_mcAccount = await Users.findOne({mcAccount: mcAccount});
            if (same_mcAccount) return {successful: false, reason: "La cuenta de Minecraft ya esta registrada, contacte un administrador"};
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
            successful: true, 
            reason: `Usuario registrado exitosamente. Tu código de acceso obligatorio es: ${nuevoCodigoUit}. ¡Guárdalo bien! Se le redirigira a login...`
        };

    } catch (e) {
        console.error(`${e}`);
        return {successful: false, reason: "Error del servidor, por favor contacte la administracion"}
    }
}

module.exports = { loginUser, loginGoogleUser, logoutUser, registerNewUser };