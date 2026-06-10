const mongoose = require('mongoose')
const notificationSchema = require('../../schema/notificationSchema.js')

const { notificationDB : NotificationDB } = require('../../db.connection')
const Notifications = NotificationDB.model("notification", notificationSchema)

const Users = require("../../models/userModel.js"); // Asume que userModel.js está en el mismo nivel
const Activity = require("../../models/activityModel.js"); // Asume que userModel.js está en el mismo nivel
const MinecraftData = require("../../models/minecraftData.js");

async function updateMyProfile(req, res) {
    const { username, mail, phoneNumber, mcAccount }= req.body

    try {
        // Checar si el nombre de usuario ya esta ocupado
        const usernameMatches = await Users.find({ username });
        
        if (usernameMatches.length === 1 && usernameMatches[0].username !== req.user.username) {
            return res.status(400).json({ reason: "Ese nombre de usuario ya está ocupado" });
        }

        if (usernameMatches[0].moderation.is_blocked) {
            return res.status(400).json({ reason: "Tu cuenta esta bloqueada" });
        }

        // Checar si el nombre de cuenta minecraft ya esta ocupado
        const mcMatches = await MinecraftData.find({ mcAccount });
    
        if (mcMatches.length === 1 && mcMatches[0].mcAccount !== req.user.mcAccount) {
            return res.status(400).json({ reason: "Ese nombre de cuenta minecraft ya está ocupado" });
        }


    } catch (error) {
        res.status(500).json({reason: error})
    }


    try {
        const result = await Users.findOneAndUpdate(
            { username: req.user.username },
            { 
                username: username,
                mail: mail,
                phoneNumber: phoneNumber, 
                mcAccount: mcAccount
            }
        )

        //Actualizar el dueño de las notificaciones
        const result2 = await Notifications.updateMany(
            { username: req.user.username },
            { username: username}
        )

        // Actualizar los datos de actividad de usuario
        const result3 = await Activity.updateOne(
            { username: req.user.username},
            { username: username }
        )

        // Actualizar los datos de la cuenta de minecraft con la nueva cuenta
        const result4 = await MinecraftData.updateOne(
            { mcAccount: req.user.mcAccount},
            { mcAccount: mcAccount }
        )


        res.status(200).json({successful: true})
    } catch (err) {
        console.log("[ERROR] - Error al actualizar el perfil de: " + req.user.username)
        res.status(500).json({reason: err})
    }

}

async function changePassword(req, res) {
    const {password, newPassword} = req.body

    try {
        // Encontrar su usuario por nombre de usuario
        const user = await Users.findOne({ username: req.user.username });

        // Rebotar intento si el usuario esta bloqueado
        if (user.moderation.is_blocked) {
            return res.status(400).json({ reason: "Tu cuenta esta bloqueada" });
        }
        
        // Compara su password para verificar su identidad
        const match = await user.comparePassword(password);
        if (!match) return res.status(500).json({ reason: "Contraseña incorrecta, intentelo de nuevo porfavor 😅"});

        // Checar longitud adecuada
        if (!newPassword || newPassword.length <= 5) return res.status(500).json({succesful: false, reason: "Contraseña nueva muy pequeña"});

        // Si todo esta bien:
        user.password = newPassword;
        await user.save();

        return res.status(200).json({reason: "Exito"})

    } catch (error) {
        res.status(500).json({reason: error})
    }
}

module.exports = {updateMyProfile, changePassword}