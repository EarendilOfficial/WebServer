const mongoose = require("mongoose");

const minecraftDataSchema = new mongoose.Schema(
    {
        activeAccess: {type: Boolean, required: true, default: true},
        mcAccount: {type: String, required: true, unique:true},
        ringcoins: {type: Number, default: 0},
        clan: {type: String},
        specialRanks: [],
        archievements: [],
        activeMissions: [],
        activeQuests: [],
        
        stats: {
            playerlevel: {type: Number, default: 0},
            rank: {type: String, default: "Plebeyo"},
            reputation: {
                title: {type: String, default: "Neutral"},
                value: {type: Number, default: 0}
            },
            kills: {type: Number, default: 0},
            missionsDone: {type: Number, default: 0},
        }
    }
);



module.exports = mongoose.model('minecraftData', minecraftDataSchema);