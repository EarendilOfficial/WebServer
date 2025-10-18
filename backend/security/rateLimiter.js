const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 100, // Límite de 100 solicitudes por IP por ventana
  message: "Too many requests, please try again later.",

  // FUNCIÓN HANDLER PARA REGISTRAR EL BLOQUEO
  handler: (req, res, next, options) => {
    // 1. Obtener la IP del usuario que fue bloqueado
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // 2. Registrar el evento en tu terminal
    console.warn(`RATE LIMIT EXCEEDED: IP ${clientIp} bloqueada. Intentos en ${options.windowMs / 60000} min.`);
    
    // 3. Registrar otros datos de la solicitud
    console.warn(`Ruta: ${req.originalUrl}, Método: ${req.method}`);

    res.status(options.statusCode).send(options.message + options.max);
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 5000, // Límite de 5000 solicitudes por IP general
  message: "Too many requests, please try again never.",

  // FUNCIÓN HANDLER PARA REGISTRAR EL BLOQUEO
  handler: (req, res, next, options) => {
    // 1. Obtener la IP del usuario que fue bloqueado
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // 2. Registrar el evento en tu terminal
    console.warn(`RATE LIMIT EXCEEDED: IP ${clientIp} bloqueada. Intentos en ${options.windowMs / 60000} min.`);
    
    // 3. Registrar otros datos de la solicitud
    console.warn(`Ruta: ${req.originalUrl}, Método: ${req.method}`);

    res.status(options.statusCode).send(options.message);
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 20, // Límite de 20 solicitudes de ingreso por IP
  message: "Too many requests, please try again never.",

  // FUNCIÓN HANDLER PARA REGISTRAR EL BLOQUEO
  handler: (req, res, next, options) => {
    // 1. Obtener la IP del usuario que fue bloqueado
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // 2. Registrar el evento en tu terminal
    console.warn(`RATE LIMIT EXCEEDED: IP ${clientIp} bloqueada. Intentos en ${options.windowMs / 60000} min.`);
    
    // 3. Registrar otros datos de la solicitud
    console.warn(`Ruta: ${req.originalUrl}, Método: ${req.method}`);

    res.status(options.statusCode).send(options.message + options.max);
  }
});

module.exports = { apiLimiter, generalLimiter, loginLimiter };