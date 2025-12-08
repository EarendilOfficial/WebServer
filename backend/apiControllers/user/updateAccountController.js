const mongoose = require('mongoose')
const notificationSchema = require('../../schema/notificationSchema.js')

const NotificationDB = mongoose.createConnection('mongodb://localhost:27017/Messages')
const Notifications = NotificationDB.model("notification", notificationSchema)

const Users = require("../../models/userModel.js"); // Asume que userModel.js está en el mismo nivel
const Activity = require("../../models/activityModel.js"); // Asume que userModel.js está en el mismo nivel
const MinecraftData = require("../../models/minecraftData.js");

async function updateMyProfile(req, res) {
    const { username, mail, phoneNumber, mcAccount }= req.body

    // Checar si el nombre de usuario ya esta ocupado
    try {
        const result = await Users.findOne({ username: username})
        console.log(result)
        if (result) res.status(500).json({reason: "Ese nombre de usuario ya esta ocupado"})
    } catch (error) {
        res.status(500).json({reason: err})
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
        res.status(500).json({reason: err})
    }

}

module.exports = {updateMyProfile }