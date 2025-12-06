//CODE for database seeding

const mongoose = require('mongoose');
const uitSchema = require('../schema/uit');

const sampleAttendance = [
    { studentId: 'student123', date: new Date('2025-09-19T12:00:00Z'), status: 'present' },
    { studentId: 'student123', date: new Date('2025-09-21T12:00:00Z'), status: 'absent' },
    { studentId: 'student123', date: new Date('2025-09-24T12:00:00Z'), status: 'present' }
];

const uitSample = { uit_code: "7777-7777-7777", mcAccount: "Khalid"};


async function seedUIT() {
    await mongoose.connect('mongodb://localhost:27017/PlayerCodes');
    const UIT = mongoose.model('uidtokens', uitSchema);
    
    await UIT.insertOne(uitSample);
    mongoose.disconnect();
    console.log("Seeded the database succesfully!");
}


async function seedDatabase() {
    await mongoose.connect('mongodb://localhost:27017/Main');
    console.log('Connected to MongoDB');

    // Clear existing data (optional)
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    // Insert new data
    await Attendance.insertMany(sampleAttendance);
    console.log('Sample data inserted!');

    mongoose.disconnect();
}

// seedDatabase();
seedUIT();