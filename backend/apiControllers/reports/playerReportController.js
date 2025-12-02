const mongoose = require('mongoose')
//schema de reporte
const { reportSchema } = require('../../schema/reportSchema')


// reportController.js
async function sendReportHandler(req, res) {
    const { selectedPlayer, reason, details } = req.body; // <-- ¡Ya sanitizados!
    const ReportsDB = await mongoose.createConnection('mongodb://localhost:27017/PlayerReports')
    const PlayerReports = ReportsDB.model("Report", reportSchema)

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