const mongoose = require("mongoose")
const { htmlContentDB : htmlDB } = require('../db.connection')
const updateSchema = require("../schema/updateSchema")
const Update = htmlDB.model("updates", updateSchema);

if (htmlDB.readyState === 1) console.log('La base de datos esta conectada')

async function getLatestUpdate() {
    try {
        const latestUpdate = await Update.findOne().sort({ timestamp: -1 });
        return latestUpdate
    } catch (error) {
        console.log(error)
        return {}
    }
    
} 

module.exports = getLatestUpdate