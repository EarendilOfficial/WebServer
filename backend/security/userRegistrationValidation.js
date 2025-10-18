const { body, validationResult } = require('express-validator');

// Reglas de validación y sanitización para el registro
const registerValidationRules = () => {
    return [
        // 1. Username: Limpieza y Reglas
        body('username')
            .trim() // <-- SANITIZACIÓN: Elimina espacios en blanco al inicio/final
            .escape() // <-- SANITIZACIÓN: Convierte <, >, &, ' y " a entidades HTML (&lt;, &gt;, etc.)
            .isLength({ min: 3, max: 20 }).withMessage('El nombre de usuario debe tener entre 3 y 20 caracteres.')
            .isAlphanumeric().withMessage('El nombre de usuario solo debe contener letras y números.'),
        
        // 2. Mail: Limpieza y Reglas
        body('mail')
            .trim()
            .normalizeEmail() // <-- SANITIZACIÓN: Normaliza el correo (ej. mayúsculas a minúsculas)
            .isEmail().withMessage('El correo electrónico es inválido.'),
        
        // 3. Password: Reglas (NO SANITIZAR, ya que el hash se encarga)
        body('password')
            .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),

        // 4. UIT: Limpieza y Reglas
        body('uit')
            .trim()
            .escape()
            .isLength({ min: 6, max: 14 }).withMessage('El código UIT es inválido.'), // Asume una longitud específica

    ];
};

// Middleware para manejar los errores de validación
const validate = (req, res, next) => {
    console.log("[Register] - Validando nuevo registro...");

    const errors = validationResult(req);
    if (errors.isEmpty()) {
        // Si no hay errores, pasa al siguiente middleware (el controlador)
        return next();
    }
    
    // Si hay errores, devuelve un 400 Bad Request
    const extractedErrors = errors.array().map(err => ({ [err.param]: err.msg }));
    const reason = extractedErrors[0][Object.keys(extractedErrors[0])];

    console.log("[Register] - Registro RECHAZADO: ", reason);
    
    return res.status(400).json({
        succesful: false,
        reason: reason || 'Datos de registro inválidos.',
        errors: extractedErrors,
    });
};

module.exports = {
    registerValidationRules,
    validate,
};