const Users = require("../models/userModel");


async function fgetActiveUserCount() {
    try {
        const count = await Users.countDocuments({
            $nor: [{deletedAccount: true}]
        });

        return count;
        
    } catch(err) {
        console.log("{ERROR} - Error getting active users count!! : ", err)
    }
}

module.exports = { fgetActiveUserCount}