const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
    
    // Arreglo para almacenar la actividad semanal (ej: horas jugadas por día).
    // Debe ser un arreglo de números (Array of Number constructor).
    weeklyActivity: {
        type: [Number], // Correcto: Array de Number
        required: true, 
        default: [0, 0, 0, 0, 0, 0, 0], // Siete ceros (Lunes a Domingo)
        validate: {
            validator: (v) => v.length === 7,
            message: 'weeklyActivity debe ser un arreglo de 7 elementos.'
        }
    },
    
    // Campo que enlaza esta actividad con el jugador (su nombre o ID).
    username: { 
        type: String, 
        required: true, 
        unique: true, // Asumimos que cada jugador solo tiene un documento de actividad
        trim: true 
    }
}, {
    // Opciones del esquema: añade timestamps automáticos para created/updated
    timestamps: true
});

// Exporta el modelo (no solo el esquema) para que se pueda usar directamente
module.exports = mongoose.model('Activity', activitySchema);