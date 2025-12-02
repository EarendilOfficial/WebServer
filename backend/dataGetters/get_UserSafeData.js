const Users = require('../models/userModel.js')
const minecraftData = require('../models/minecraftData.js');

async function fgetUserSafeData(username) {
    const users = await Users.findOne({username: username, $nor: [{deletedAccount: true}]}).select('username mcAccount moderation groups friends achievements registration_date isAdmin').exec();    
}

async function fgetUsersSafeData() {
    try {
        const users = await Users.find({$nor: [{deletedAccount: true}]}).select('username mcAccount moderation groups friends achievements registration_date isAdmin').exec();
        
        if (!users || users.length == 0) {
            return {}
        }

        return users;
        
    } catch(err) {
        console.log("{ERROR} - Error getting users safeData: ", err)
    }
}

module.exports = { fgetUserSafeData, fgetUsersSafeData}