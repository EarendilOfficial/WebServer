const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path'); // ✅ SOLUCIÓN 1: Módulo 'path' importado

// Importar auth check
const { isAuthCheck, isAdminCheck } = require("./auth/Auth_Middleware.js");
const { getMinecraftData, getMyUserData, getMyActivity } = require("./dataGetters/get_UserData.js")

// Importar controladores y funciones
const { saveAnnouncementHandler, getLatestAnnouncementsHandler } = require('./apiControllers/dashboard/anouncementsController.js');
const { fgetActiveUserCount } = require('./dataGetters/get_activeUserCount.js');
const { fgetUsersSafeData } = require('./dataGetters/get_UserSafeData.js');
const { sendReportHandler } = require('./apiControllers/reports/playerReportController.js');
const { reportValidationRules, validateReport } = require('./security/reportValidation.js');
const { reportLimiter } = require('./security/rateLimiter.js');
const { getActiveEvents } = require('./dataGetters/get_activeEvents.js');
const createEventsHandler = require('./apiControllers/dashboard/eventsController.js');
const getLatestUpdate = require('./dataGetters/get_lastUpdate.js');
const { setNotificationRead, getMyNotifications, removeNotification } = require('./apiControllers/notificationController.js');
const { updateMyProfile, changePassword } = require('./apiControllers/user/updateAccountController.js');
const { getMyMails, createMail, deleteMail, markMailRead } = require('./apiControllers/mailController.js');

// Cambiado a 'Post' para mantener concordancia con tus consultas internas
const Post = require('./models/postModel.js'); 

// El chequeo de autenticacion se aplica a todas las rutas
router.use('/uploads', express.static('uploads'));
router.use(isAuthCheck);
router.use(express.json({
    limit: '5kb'
})); 

// Configurar dónde se guardarán las fotos que suba Android
const storage = multer.diskStorage({
    destination: 'uploads/', 
    filename: (req, file, cb) => {
        cb(null, `post-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });



// ---------------- ARCHIVOS --------------- //

router.post('/posts/create', upload.single('image'), async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ successful: false, reason: "Campos incompletos" });
        }

        // Modificado para que guarde el prefijo /api que declaraste en tu MainServer
        const imageUrl = req.file ? `/api/uploads/${req.file.filename}` : null;

        const newPost = await Post.create({
            title: title,
            description: description,
            author: req.user.username, 
            imageUrl: imageUrl
        });

        return res.json({ successful: true, reason: "Publicación creada con éxito!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ successful: false, reason: "Error interno del servidor" });
    }
});

// ✅ SOLUCIÓN 2: Cambiado de postModel a Post
router.get('/posts', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const posts = await Post.find(query).sort({ createdAt: -1 }); 
        return res.json({ successful: true, posts: posts });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ successful: false, reason: "Error al obtener publicaciones" });
    }
});

router.put('/posts/:id', async (req, res) => {
    try {
        const { description } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ successful: false, reason: "Publicación no encontrada" });
        
        if (post.author !== req.user.username && !req.user.isAdmin) {
            return res.status(403).json({ successful: false, reason: "No tienes permiso para editar esto" });
        }

        post.description = description;
        await post.save();

        return res.json({ successful: true, reason: "Publicación actualizada" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ successful: false, reason: "Error del servidor" });
    }
});

router.delete('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ successful: false, reason: "Publicación no encontrada" });

        if (post.author !== req.user.username && !req.user.isAdmin) {
            return res.status(403).json({ successful: false, reason: "No tienes permiso para borrar esto" });
        }

        await post.deleteOne();
        return res.json({ successful: true, reason: "Publicación eliminada" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ successful: false, reason: "Error al eliminar" });
    }
});


// ---------------- RUTAS GENERALES --------------- //
router.get('/get_content_latest', getLatestAnnouncementsHandler)

router.get('/get_minecraft_data', getMinecraftData, (req, res) => {
    return res.status(200).json(req.minecraftData);
})

router.get('/get_my_data', getMyUserData, (req, res) => {
    return res.status(200).json(req.userData);
})

router.get('/get_my_activity', getMyActivity, (req, res) => {
    return res.status(200).json(req.activity);
})

router.get("/get_my_notifications", getMyNotifications)
router.put("/set_notification_read", setNotificationRead)
router.post("/delete_notification", removeNotification)

// Mails
router.get('/mails', getMyMails);
router.post('/mails', createMail);
router.delete('/mails/:id', deleteMail);
router.post('/mails/:id/mark-read', markMailRead);

// Perfil
router.post("/user/update_profile", updateMyProfile)
router.post("/user/change_password", changePassword)

router.get('/get_user_count', async (req, res) => {
    const playerCount = await fgetActiveUserCount();
    return res.status(200).json({ number: playerCount });
})

router.get('/get_player_names', async (req, res) => {
    let playersData = await fgetUsersSafeData();
    playersData = playersData.map((user) => {
        return user.mcAccount || user.username;
    })
    return res.status(200).json({ playersData: playersData })
})

router.get('/get_latest_update', async (req, res) => {
    try {
        return res.json(await getLatestUpdate() || latestUpdate);
    } catch (e) {
        return res.status(500).json({ error: 'Fallo al obtener actualización' });
    }
});

router.get('/get_active_events', async (req, res) => {
    try {
        const activeEvents = await getActiveEvents();
        return res.json({ events: activeEvents });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ error: 'Fallo al obtener eventos' });
    }
});

router.post(
    '/sendReport', reportLimiter,
    reportValidationRules(), 
    validateReport,          
    sendReportHandler        
);

// Administrador
router.post('/save_announcement', isAdminCheck, saveAnnouncementHandler);
router.post('/add_event', isAdminCheck, createEventsHandler);

module.exports = router;