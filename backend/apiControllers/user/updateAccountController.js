const mongoose = require('mongoose')
const notificationSchema = require('../../schema/notificationSchema.js')

const NotificationDB = mongoose.createConnection('mongodb://localhost:27017/Messages')
const Notifications = NotificationDB.model("notification", notificationSchema)

const Users = require("../../models/userModel.js"); // Asume que userModel.js está en el mismo nivel

async function updateMyProfile(req, res) {
    const { username, mail, phoneNumber, mcAccount }= req.body

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

        console.log(result)
        res.status(200).json({successful: true})
    } catch (err) {
        res.status(500).json({reason: err})
    }

}

module.exports = {updateMyProfile }