const mongoose = require('mongoose');
// Cargar el esquema de bd de anuncios guardados
const announcementSch = require("../schema/announcementSchema");

/**
 * Controlador para obtener el anuncio más reciente y publicado.
 * Expone un endpoint /api/get_content_latest (ruta protegida por isAuthCheck).
*/
async function getLatestAnnouncementsController(req, res) {
    const HtmlContent = await mongoose.createConnection('mongodb://localhost:27017/HtmlContent');
    const Announcement = HtmlContent.model('Anuncios', announcementSch);

    try {
        // 1. Consultar la base de datos
        // Busca un anuncio que esté publicado (isPublished: true)
        // Ordena por la fecha de publicación más reciente (-1)
        const latestAnnouncement = await Announcement
            .find({ isPublished: true })
            .sort({ publishDate: -1 }) 
            .limit(6)
            .select('title textContent stylePreset media author') // Solo selecciona los campos necesarios para ahorrar ancho de banda
            .exec();

        // 2. Manejar la respuesta
        if (!latestAnnouncement || latestAnnouncement.length == 0) {
            // Si no hay anuncios publicados, enviamos un mensaje por defecto.
            return res.status(200).json({ 
                title: "Bienvenido", 
                contentHTML: "<h1>¡Bienvenido!</h1><p>Aún no tenemos anuncios recientes para mostrarte. ¡Vuelve pronto!</p>"
            });
        }

        // Si se encuentra el anuncio, devolvemos el título y el HTML.
        res.status(200).json({
            posts: latestAnnouncement
        });

    } catch (error) {
        console.error("Error fetching announcement:", error);
        // Devolvemos un 500 para errores de servidor o base de datos.
        res.status(500).json({ 
            succesful: false,
            reason: "Error interno del servidor al obtener el anuncio." 
        });
    }
}

async function saveAnnouncementController(req, res) {
    const HtmlContent =  mongoose.createConnection('mongodb://localhost:27017/HtmlContent');
    const Announcement = HtmlContent.model('Anuncios', announcementSch);
    
    // Obtener nombre de la cuenta del autor
    const authorUsername = req.user.username; 
    console.log(`Usuario Administrador ${authorUsername} acaba de crear un anuncio`)
    
    // 1. Obtener los datos del cuerpo
    const { title, textContent, stylePreset, media } = req.body;

    // 2. Usar el nombre del autor en los datos de Mongoose
    const newAnnouncementData = {
        title,
        textContent,
        stylePreset,
        media,
        author: authorUsername, // Aquí inyectas el nombre de usuario verificado
        isPublished: true, // Asumimos que quieres publicarlo inmediatamente
        // ... otros campos
    };

    // Ejemplo: Guardar en la DB (Tu lógica real)
    try {
        await Announcement.create(newAnnouncementData);
    } catch (error) {
        console.log("ERROR: " + error);
        res.status(2).json({ message: 'Error de la base de datos', id: '500' });
    }

    console.log(`Anuncio creado por: ${authorUsername}`);
    
    // 3. Respuesta
    res.status(200).json({ message: 'Anuncio guardado', id: '200' });
}

module.exports = { getLatestAnnouncementsController, saveAnnouncementController };