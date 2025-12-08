const mongoose = require('mongoose')
const notificationSchema = require('../schema/notificationSchema.js')

const NotificationDB = mongoose.createConnection('mongodb://localhost:27017/Messages')
const Notifications = NotificationDB.model("notification", notificationSchema)


async function getMyNotifications(req, res) {
    const jugador = req.user.username;
    console.log(jugador)
    try {
        const notificaciones = await Notifications.find({username: jugador})
        res.status(200).json(notificaciones)

    } catch (err) {
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
}

async function setNotificationRead(req, res) {
    const { notificationId } = req.body;

    console.log("Updating notification: " + notificationId + ". As read...")

    try {
        // Lógica para modificar a leido
        await Notifications.updateOne(
            {_id: notificationId}, 
            { $set: { read : true }}
        )
        res.status(200).send()

    } catch (e) {
        console.error("Error al guardar notificaciones:", e);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    } // finally {
    //     await NotificationDB.close()
    // }
}

async function removeNotification(req, res) {
    const { notificationId } = req.body;

    console.log("Removing notification: " + notificationId + ". As read...")

    try {
        // Lógica para modificar a leido
        await Notifications.findByIdAndDelete(notificationId);
        res.status(200).send();

    } catch (e) {
        console.error("Error al eliminar notificaciones:", e);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    } // finally {
    //     await NotificationDB.close()
    // }
}

module.exports = { getMyNotifications, setNotificationRead, removeNotification}