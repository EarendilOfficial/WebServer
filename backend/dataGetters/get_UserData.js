const MinecraftData = require("../models/minecraftData.js"); // Asume que userModel.js está en el mismo nivel
const Users = require('../models/userModel.js')

async function getMyUserData(req, res, next) {
    const username_ = req.user.username;

    const userData = await Users.findOne({username: username_}).select('username mail mcAccount payement groups friends archievements uit deletedAccount balance registration_date');

    if (userData) {
        req.userData = userData;
        return next();
    }

    res.status(500).send({message: "Unable to fetch data"})
}

async function getMinecraftData(req, res, next) {
    const accountName = req.user.mcAccount;
    
    const data = await MinecraftData.findOne({mcAccount: accountName});
    
    if (data) {
        req.minecraftData = data;
        return next()
    }

    return res.status(500).send({message: "Could not get your minecraft data (your mc account is not registered??)"});
}


module.exports = { getMinecraftData, getMyUserData };