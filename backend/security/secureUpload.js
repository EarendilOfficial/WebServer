const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// 1. Definir tipos de archivos permitidos (MIME types y extensiones)
// NOTA: Excluimos explícitamente el formato SVG (.svg) por defecto. 
// Las imágenes SVG son archivos XML y pueden contener etiquetas <script> que ejecutan XSS en el navegador.
const ALLOWED_MIME_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp']
};

// 2. Configurar el almacenamiento (Storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Asegúrate de que esta carpeta exista
    },
    filename: (req, file, cb) => {
        // NUNCA uses el nombre original del archivo (file.originalname) provisto por el usuario.
        // Puede contener ataques de Path Traversal (ej. ../../../etc/passwd) o caracteres extraños.
        
        // Generamos un nombre completamente aleatorio e impredecible (Hash de 16 bytes)
        const randomName = crypto.randomBytes(16).toString('hex');
        
        // Extraemos la extensión del archivo original de forma segura y en minúsculas
        const originalExt = path.extname(file.originalname).toLowerCase();
        
        // Validamos que la extensión coincida con el MIME type real detectado por Multer
        const allowedExtensions = ALLOWED_MIME_TYPES[file.mimetype];
        const finalExt = (allowedExtensions && allowedExtensions.includes(originalExt)) 
            ? originalExt 
            : '.jpg'; // Fallback seguro si hay discrepancias

        cb(null, `${randomName}${finalExt}`);
    }
});

// 3. Filtro de archivos (File Filter)
const fileFilter = (req, file, cb) => {
    // Verificar si el MIME type está en nuestra lista blanca
    const allowedExtensions = ALLOWED_MIME_TYPES[file.mimetype];
    
    if (!allowedExtensions) {
        // Rechazar el archivo enviando un error controlado
        return cb(new Error('LIMIT_FILE_TYPE'), false);
    }

    // Verificar adicionalmente que la extensión declarada parezca segura
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error('LIMIT_FILE_TYPE'), false);
    }

    cb(null, true); // Archivo aprobado
};

// 4. Inicializar Multer con límites estrictos de tamaño
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Límite estricto: 5 Megabytes (evita Denial of Service por espacio en disco)
        files: 1 // Solo permitir un archivo por solicitud
    }
});

module.exports = upload;