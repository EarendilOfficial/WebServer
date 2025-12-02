const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    rank: { type: String, required: true },
    title: { type: String, required: true }, 
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true }, 
    location: { type: String}, 
    description: { type: String },
    text: { type: String }
})

module.exports = eventSchema;