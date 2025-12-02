const mongoose = require("mongoose")
const eventSchema = require("../../schema/eventSchema")

async function createEventsHandler(req, res) {
    const { rank, title, startTime, endTime, location, description, text } = req.body;

    const Database = await mongoose.createConnection("mongodb://localhost:27017/HtmlContent");
    const Event = Database.model("eventos", eventSchema);

    const newEvent = {
        rank, title, startTime, endTime, location, description, text
    }

    try {
        Event.create(newEvent)
    } catch (error) {
        res.status(500).json({ message: 'Error de la base de datos'});
    }
    
    res.status(200).json({ message: "Exito, evento añadido con exito"})
}

module.exports = createEventsHandler;