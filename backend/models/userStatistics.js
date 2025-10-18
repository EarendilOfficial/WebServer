const mongoose = require("mongoose")

const userStatisticsSchema = new mongoose.Schema(
    {
        username: {type: String, required: true},
        last_join: {type: Date, default: Date.now},
        last_minecraft_join: {type: Date},
        chat_messages_sent: {type: Number, default: 0},
        mails_sent: {type: Number, default: 0},

        time_spent: {type},
        playtime_minutes: {type: Number, default: 0},
        events_partake: [],

        social: {
            posts_made: {type: Number, default: 0},
            comments_made: {type: Number, default: 0},
            likes_given: {type: Number, default: 0},
            dislikes_given: {type: Number, default: 0}
        },

        moderation: {
            reports_filed: {type: Number, default: 0}, // Reportes que este usuario ha hecho
            reports_received: {type: Number, default: 0}, // Reportes que ha recibido de otros
        },
        
        login_history: [{ // Para seguridad y análisis
            date: Date,
            ip_address: String
        }],

        etc: []
    },
    { timestamps: true }
)