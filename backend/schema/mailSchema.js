const mongoose = require("mongoose");

const mailSchema = new mongoose.Schema({
    // _id: ObjectId
    to: { type: String, required: true},
    from: { type: String, required: true},
    subject: { type: String, required: true},
    body: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['read', 'unread'], default: 'unread' }
});

module.exports = mailSchema;

