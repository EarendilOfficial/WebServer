const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
    userThatReported: { type: String, required: true },
    player: { type: String, required: true, trim: true },
    reasonId: {type: Number, required: true},
    details: {type: String, required: false},
    registration_date: {type: Date, default: Date.now}
})

module.exports = { reportSchema }