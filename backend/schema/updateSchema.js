const mongoose = require("mongoose")

const updateSchema = new mongoose.Schema ({
    name: String,
    version: String,
    imageUrl: String,
    description: String,
    timestamp: { type: Date, default: Date.now }
})

module.exports = updateSchema;