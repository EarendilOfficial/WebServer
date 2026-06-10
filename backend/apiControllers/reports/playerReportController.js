const mongoose = require('mongoose')
//schema de reporte
const { reportSchema } = require('../../schema/reportSchema')
const { feedbackDB } = require('../../db.connection')


// reportController.js
async function sendReportHandler(req, res) {
    // Datos del reporte
    const { selectedPlayer, reason, details } = req.body; // <-- ¡Ya sanitizados!
    //Conexion a la DB
    const PlayerReports = feedbackDB.model("Report", reportSchema)

    // TODO: Mandar mensaje a los moderadores
    // TODO: Tomar accion inmediata en caso 4, o en caso de ofensas repetidas

    try {
        // Lógica para guardar en la base de datos
        await PlayerReports.create({ userThatReported: req.user.username, player: selectedPlayer, reasonId: reason, details: details });

        console.log(`Reporte de ${req.user.username} recibido y limpiado. Jugador: ${selectedPlayer}, Razón: ${reason}`);

        res.status(201).json({ success: true, message: 'Reporte enviado exitosamente.' });
        console.log(details)
    } catch (e) {
        console.error("Error al guardar reporte:", e);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
}

module.exports = { sendReportHandler }