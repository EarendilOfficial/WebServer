// attendanceModel.js

const mongoose = require('mongoose');

// 1. Define the Schema
// The schema defines the fields (e.g., studentId, date, status)
// and their data types, constraints, and validation rules.
const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true, // This field is mandatory
        trim: true, // Removes whitespace from the string
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['present', 'absent', 'late'], // The value must be one of these options
    },
    // Optional: You can add other fields like a timestamp for when the record was created
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// 2. Create the Model
// The model is a wrapper around the schema that provides an API for
// database operations (e.g., find(), create(), update(), delete()).
const Attendance = mongoose.model('Attendance', attendanceSchema);

// 3. Export the Model
// This makes the 'Attendance' model available for other files to use.
module.exports = Attendance;