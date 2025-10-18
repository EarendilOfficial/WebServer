const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
    // 1. Metadatos de Contenido
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },

    textContent: { 
        type: String, 
        required: true,
    },
    
    stylePreset: {
        type: String,
        required: true,
        default: 'default', // 'default', 'warning', 'event', 'hotfix', etc.
        enum: ['default', 'yellow', 'green', 'hotfix', 'purple', 'lore', 'color1', 'color2', 'color3'] // Limita los valores posibles
    },
    
    // 3. Contenido Embebido (Imágenes/Video)
    media: {
        type: new mongoose.Schema({
            type: {
                type: String,
                enum: ['image', 'video_embed', 'none'],
                default: 'none'
            },
            // URL de la imagen, o el ID/URL del video embebido (ej. de YouTube)
            url: {
                type: String,
                trim: true,
                required: function() { return this.type !== 'none'; } // Requerido si el tipo no es 'none'
            },
            // Opcional: descripción de la imagen para accesibilidad
            altText: {
                type: String,
                trim: true,
                maxlength: 150
            }
        }, {_id: false}), // No necesitamos un _id para este sub-documento
        default: { type: 'none', url: '' }
    },

    // 4. Metadatos y Estado (Ajustado)
    author: {
        type: String,
        required: true,
        default: "Administración",
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    publishDate: {
        type: Date,
        default: Date.now,
    },
    
    // 5. Fechas de Mantenimiento (Mantenido)
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true }); // Mongoose puede manejar createdAt y updatedAt automáticamente

module.exports = announcementSchema;