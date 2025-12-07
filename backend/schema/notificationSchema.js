const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    // Mongoose añadirá automáticamente: _id: ObjectId
    username: { type: String, required: true},
    type: { type: String, required: true }, // Ej: 'REPORT', 'SYSTEM', 'PAYMENT'}
    title: { type: String, required: false},
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
}, { 
    // Opcional, si quieres que se muestre el _id en JSON
    _id: true 
});


module.exports = notificationSchema