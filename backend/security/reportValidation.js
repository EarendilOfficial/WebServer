const { body, validationResult } = require('express-validator');

// Reglas de validación y sanitización para el envío de reportes
const reportValidationRules = () => {
    return [
        // 1. selectedPlayer: Debe existir y ser sanitizado.
        body('selectedPlayer')
            .trim()        // Elimina espacios en blanco innecesarios
            .escape()      // <-- SANITIZACIÓN CLAVE: Convierte caracteres peligrosos a entidades HTML
            .notEmpty().withMessage('Debe seleccionar un jugador a reportar.'),
        
        // 2. reason: Debe existir, ser numérico y estar en un rango válido.
        body('reason')
            .isInt({ min: 1, max: 5 }).withMessage('La razón de reporte es inválida.')
            .toInt(),      // Convierte a número entero para la lógica de negocio
        
        // 3. details: Opcional, pero debe ser sanitizado para prevenir XSS.
        body('details')
            .optional({ checkFalsy: true }) // Permite que esté vacío
            .trim()
            .escape()      // <-- SANITIZACIÓN: Protege contra inyección de HTML/scripts
            .isLength({ max: 500 }).withMessage('Los detalles no deben exceder los 500 caracteres.'),
    ];
};

// Middleware para manejar los errores de validación y devolver un 400
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        // Si no hay errores, el req.body ya está limpio y validado
        return next();
    }
    
    // Devuelve un error 400 (Bad Request) con el primer mensaje encontrado
    const errorMessages = errors.array().map(err => err.msg);
    return res.status(400).json({
        success: false,
        message: errorMessages[0] || 'Datos de reporte inválidos.',
    });
};

module.exports = {
    reportValidationRules,
    validateReport : validate
};