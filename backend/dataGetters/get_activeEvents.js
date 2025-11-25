const mongoose = require("mongoose")
const eventSchema = require("../schema/eventSchema");

async function getActiveEvents() {
    const EventsDB = await mongoose.createConnection("mongodb://localhost:27017/HtmlContent");
    const Events = EventsDB.model("eventos", eventSchema);

    const result = await Events.find({ startTime: { $lt: new Date() }, endTime: { $gt: new Date() } });
    if (!result || result.length == 0) {
        return [];
    }
    
    return result;
}


module.exports = { getActiveEvents }