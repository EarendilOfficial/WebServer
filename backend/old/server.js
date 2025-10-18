// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
 
// 1. Serve the static frontend files first
// This MUST come before any other routes that might conflict
// like the catch-all route.
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// 2. Connect to MongoDB (Database logic comes after static file serving)
mongoose.connect("mongodb://localhost:27017/Main")
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// 3. Define Mongoose Schema and Model
const attendanceSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'late'], required: true }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

// 4. Define API Routes
app.get('/api/attendance/:studentId', async (req, res) => {
    // ... API logic here ...
    try {
        const { studentId } = req.params;
        const { month, year } = req.query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const attendanceRecords = await Attendance.find({
            studentId,
            date: { $gte: startDate, $lte: endDate }
        });
        console.log('Fetched attendance records:', attendanceRecords);
        res.json(attendanceRecords);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching attendance', error: err.message });
    }
});

app.post('/api/attendance', async (req, res) => {
    // ... API logic here ...
    try {
        const newRecord = new Attendance(req.body);
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(400).json({ message: 'Error creating attendance record', error: err.message });
    }
});

// 5. Catch-all route for any other requests
// This should be the very LAST route defined.
app.get('/*frontend', (req, res) => {
    // Prevent API routes from being handled by the frontend
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});


// 6. Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});