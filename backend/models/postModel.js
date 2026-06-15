const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    author: { type: String, required: true }, // Guardaremos el username del JWT
    imageUrl: { type: String, default: null }, // Ruta de la foto en tu servidor
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);