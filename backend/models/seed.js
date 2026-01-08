//CODE for database seeding

const mongoose = require('mongoose');
const uitSchema = require('../schema/uit');
const notificationSchema = require('../schema/notificationSchema');

const sampleAttendance = [
    { studentId: 'student123', date: new Date('2025-09-19T12:00:00Z'), status: 'present' },
    { studentId: 'student123', date: new Date('2025-09-21T12:00:00Z'), status: 'absent' },
    { studentId: 'student123', date: new Date('2025-09-24T12:00:00Z'), status: 'present' }
];

const uitSample = { uit_code: "5555-5555-5555", mcAccount: "Khalid"};

const TARGET_USERNAME = "Khalid"; // 🔑
const newNotifications = [
    {
        username: TARGET_USERNAME,
        type: 'SYSTEM',
        title: "titulo de prueba aaaa",
        message: "¡La versión 1.21 fue lanzada! Nuevas mecánicas y biomas.",
        read: false, // NO LEÍDA
        timestamp: new Date()
    },
    {
        username: TARGET_USERNAME,
        type: 'REPORT',
        title: "Titulo de prueba DOS aaaa",
        message: "Tu reporte de 'Griefing' ha sido recibido y está en revisión.",
        read: false, // NO LEÍDA
        timestamp: new Date(Date.now() - 86400000) // Hace 1 día
    },
    {
        username: TARGET_USERNAME,
        type: 'PAYMENT',
        message: "Tu suscripción premium de Eärendil ha sido renovada con éxito.",
        read: true, // LEÍDA
        timestamp: new Date(Date.now() - 3 * 86400000) // Hace 3 días
    },
    {
        username: TARGET_USERNAME,
        type: 'EVENT',
        message: "¡Evento Especial! La caza del Wither comienza el 24 de Diciembre. ¡Prepárate!",
        read: false, // NO LEÍDA
        timestamp: new Date(Date.now() - 5 * 86400000) // Hace 5 días
    },
    {
        // Notificación para probar la funcionalidad de marcar como leída
        username: TARGET_USERNAME,
        type: 'TEST',
        message: "Haz clic en esta notificación para marcarla como LEÍDA.",
        read: false,
        timestamp: new Date(Date.now() - 7 * 86400000) // Hace 7 días
    }
];

async function seedUIT() {
    await mongoose.connect('mongodb://localhost:27017/PlayerCodes');
    const UIT = mongoose.model('uidtokens', uitSchema);
    
    await UIT.insertOne(uitSample);
    mongoose.disconnect();
    console.log("Seeded the database succesfully!");
}


async function seedNotifications() {
    console.log("--- Iniciando siembra de notificaciones ---");

    try {
        // Conectar a la base de datos principal
        await mongoose.connect("mongodb://localhost:27017/Messages");
        console.log("Conectado a MongoDB.");
        const NOTIF = mongoose.model("notification", notificationSchema)


        // --- Añadir las nuevas notificaciones al DB ---
        const result = await NOTIF.insertMany(newNotifications)
        
        // Se usa $push con $each para añadir múltiples elementos de una vez
        // Se usa $addToSet si quisieras evitar duplicados, pero $push es común para notificaciones
        

        console.log(`✅ ${newNotifications.length} notificaciones añadidas a ${TARGET_USERNAME}.`);
        console.log(`Documentos modificados: ${result.length}`);

    } catch (error) {
        console.error("❌ Fallo durante el proceso de siembra:", error);
    } finally {
        // Desconectar Mongoose
        await mongoose.disconnect();
        console.log("Conexión cerrada.");
    }
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
// seedNotifications();
seedUIT();