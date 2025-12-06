const Activity  = require("../models/activityModel.js");
const MinecraftData = require("../models/minecraftData.js"); // Asume que userModel.js está en el mismo nivel
const Users = require('../models/userModel.js')

async function getMyUserData(req, res, next) {
    const username_ = req.user.username;

    const userData = await Users.findOne({username: username_}).select('-password -__v -_id');

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

async function fgetMinecraftData(req) {
    const accountName = req.user.mcAccount;
    
    const data = await MinecraftData.findOne({mcAccount: accountName}).exec();

    if (data) {
        return data;
    }
    return [];
}

async function getMyActivity(req, res, next) {
    const accountName = req.user.mcAccount;
    const data = await Activity.findOne({player: accountName});

    if (data) {
        req.activity = data;
        return next()
    }

    return res.status(500).send({message: "Could not get your activity"});
}

async function fgetMyActivity(req) {
    const accountName = req.user.mcAccount;
    const data = await Activity.findOne({player: accountName});

    if (data) {
        return data;
    }

    return [];
}


module.exports = { getMinecraftData, getMyUserData, fgetMinecraftData, getMyActivity, fgetMyActivity};