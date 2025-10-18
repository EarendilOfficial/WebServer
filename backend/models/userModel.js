const mongoose = require("mongoose")
const bcrypt = require("bcrypt");

const userModelSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true},
        password: { type: String, required: true },
        mail: {type: String, required: false, unique: true, sparse: true},
        phoneNumber: {type: String, required: false},
        mcAccount: {type: String, required: false, unique: true, sparse: true},
        
        balance: { type: Number },
        payement: {
            paidMonths: [],
            debtMonths: []
        },

        moderation: {
            is_blocked: {type: Boolean, default: false},
            from_what: [],
            block_reason: {type: String}
        },
        
        groups: [],
        friends: [],
        archievements: [],

        uit: {type: String},
        isAdmin: {type: Boolean, required: false},
        deletedAccount: {type: Boolean, default: false},
        registration_date: {type: Date, default: Date.now}
    }
)

userModelSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    if (this.isNew) {
        this.balance = 0;
    }
    next();
});

// Method to compare passwords
userModelSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
}

module.exports = mongoose.model('User', userModelSchema);
