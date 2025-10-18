const mongoose = require("mongoose");

const uitModelSchema = new mongoose.Schema(
    {
        uit_code: {type: String, required: true, unique: true},
        mcAccount: {type: String, required: false, unique: true, sparse: true},
        registration_date: {type: Date}
    }
)

uitModelSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.registration_date = new Date(Date.now());
    }
    next();
});

module.exports = uitModelSchema;
