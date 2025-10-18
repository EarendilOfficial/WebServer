const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
const imageContainer = document.getElementById('image-container');
const body = document.getElementById('body')
const register_link = document.getElementById("register-link")
let centerImage = document.getElementById('center-image');
const loading_overlay = document.getElementById('loading-overlay')
const skip_animation = localStorage.getItem('skip_animation');

// boton de login, que manda la info al server
const login_submit = document.getElementById("login-submit");
const field_username = document.getElementById("username");
const field_password = document.getElementById("password");

window.onload = () => {   
    body.classList.remove("fade-out");
    loading_overlay.classList.remove('shown');
};

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

// Variables para almacenar la posición central de la imagen
let imageCenterX = width / 2;
let imageCenterY = height / 2;

// Ajusta el tamaño al cambiar la ventana
window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
});

// --- CLASE PARTÍCULA ---
class Particle {
    constructor(x, y, dx, dy, decay, color) {
        this.x = x;
        this.y = y;
        this.decay = decay;
        this.radius = Math.random() * 10 + 1;
        this.color = color || 'white';
        // Usa las velocidades iniciales calculadas
        this.dx = dx;
        this.dy = dy;
        this.alpha = 1;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
    
    update() {
        // Aplica fricción y mueve la partícula
        this.dx *= FRICTION;
        this.dy *= FRICTION;
        this.x += this.dx;
        this.y += this.dy;
        
        // Reducción de opacidad y tamaño
        this.alpha -= 0.0018 * ( this.decay || 1); 
        this.radius -= 0.004 * ( this.radius * this.decay/1.5 || 1); 
        if (this.radius < 0) this.radius = 0;
    }

    launch(force) {
        this.dx *= force;
        this.dy *= force;
    }
}


// --- BUCLE DE ANIMACIÓN ---
let particles = [];
const centerX = width / 2;
const centerY = height / 2;
let circleOfParticles_active = true;

// Constantes de la animación
const GENERATION_RADIUS = 150; // Radio del círculo desde donde nacen las partículas (en píxeles)
const MAX_PARTICLES = 400;     // Límite de partículas en pantalla
const PARTICLE_SPEED = 2;      // Velocidad base de la explosión
const FRICTION = 0.999;         // Desaceleración


// Función para crear una ráfaga de partículas (ejecutar en un evento, como un click)
const particleCount = 10; // Cantidad de partículas a crear por "explosión"
function createExplosion(x, y, decay, particleAmount, color) {
    for (let i = 0; i < (particleAmount || particleCount); i++) {
        const angle = Math.random() * Math.PI * 2;
        const dx = Math.cos(angle) * PARTICLE_SPEED;
        const dy = Math.sin(angle) * PARTICLE_SPEED;
        particles.push(new Particle(x, y, dx, dy, decay, color));
    }
}

// Función para calcular la posición central de la imagen
function updateImagePosition() {

    if (centerImage == undefined) {
        centerImage = document.getElementById('center-image');
    }

    // getBoundingClientRect da la posición y tamaño del elemento
    const rect = centerImage.getBoundingClientRect();

    // El centro de la imagen es la esquina superior izquierda + la mitad del ancho/alto
    imageCenterX = rect.left + rect.width / 2;
    imageCenterY = rect.top + rect.height / 2;
}

// --- FUNCIÓN PARA MOVER Y MOSTRAR ---
function showForm() {
    // 1. Mueve el logo
    body.classList.add("background")
    imageContainer.classList.add('moved');

    // Acelerar las particulas y desactivar el circulo
    circleOfParticles_active = false
    for (let i = 0; i < particles.length; i++) {
        particles[i].launch(4)
    }
    
    // 2. Muestra el formulario después de un breve retraso
    setTimeout(() => {
        const formContainer = document.getElementById('form-container');
        // Oculta la imagen con opacidad para que el formulario pueda aparecer
        // centerImage.classList.add('hide-logo'); 
        
        // 🚨 CAMBIO CLAVE: Muestra el formulario con la clase 'visible'
        // Esto activa la transición de opacidad (opacity: 0 a 1)
        formContainer.classList.remove('hidden');
        formContainer.classList.add('visible'); 
    }, 500); // Espera 500ms (la duración de la transición CSS)

    centerImage.removeEventListener('click', showForm);
}

function createCircularParticle(speed) {
    // 1. Elegir un ángulo aleatorio (0 a 2*PI)
    const angle = Math.random() * Math.PI * 2;

    // 2. Calcular la posición inicial (punto en la circunferencia)
    const startX = imageCenterX + GENERATION_RADIUS * Math.cos(angle);
    const startY = imageCenterY + GENERATION_RADIUS * Math.sin(angle);

    // 3. Calcular la dirección de movimiento (hacia afuera del centro)
    // El vector de velocidad apunta desde el centro hacia el punto de inicio.
    // Usamos el mismo ángulo para la dirección.
    const initialDx = Math.cos(angle) * (speed || PARTICLE_SPEED);
    const initialDy = Math.sin(angle) * (speed || PARTICLE_SPEED);

    particles.push(new Particle(startX, startY, initialDx, initialDy, 2));
}

function animate() {
    requestAnimationFrame(animate);
    
    // Rellena el canvas. Usa un color con baja opacidad para crear un efecto de "rastro" (Descartado, no sirve, deja manchas)
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'; 
    ctx.clearRect(0, 0, width, height); 

    // Actualiza y dibuja las partículas
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    
    // Elimina las partículas que ya no son visibles (fuera de la pantalla o con radio/opacidad cero)
    particles = particles.filter(p => p.alpha > 0.05 && p.radius > 0);

    // Si quieres una explosión continua o que se repita:
    if (particles.length < 400 && circleOfParticles_active) {
        // Recarga periódicamente la animación en el centro
        createCircularParticle(1)
        updateImagePosition();
    }
}

// document.addEventListener('click', (event)=>{
//     createExplosion(event.clientX, event.clientY, 15, 20, 'violet')
// })

if (skip_animation == 'true') {
    localStorage.removeItem('skip_animation'); // Asegurar que no vuelva a saltar animacion
    body.classList.add("background")
    imageContainer.classList.add('moved');
    const formContainer = document.getElementById('form-container');
    formContainer.classList.remove('hidden');
    formContainer.classList.add('visible'); 
    centerImage.removeEventListener('click', showForm);
} else {
    animate();
}


// 3. Añadir los eventos de click
// Click en imagen central
centerImage.addEventListener('click', showForm);

// Click en registrarse nueva cuenta
register_link.addEventListener('click', ()=> {
    body.classList.add('fade-out');

    // Add loading animation
    loading_overlay.classList.add('shown');

    setTimeout(() => {
        // Dirección a la que quieres ir
        const destinationURL = '/register-user'; 
        window.location.href = destinationURL; 
    }, 500); // 500 milisegundos = 0.5 segundos (debe coincidir con la duración de la transición CSS)
})

login_submit.addEventListener('click', (event) => {
    event.preventDefault(); // Detiene el envío predeterminado del formulario
    
    // 🔑 CLAVE: Usar .value en lugar de .textContent
    const username = field_username.value;
    const password = field_password.value;

    if (!username) {showAlert("Escriba el nombre de usuario", "Error"); return;};
    if (!password) {showAlert("Escriba la contraseña", "Error"); return;};
    
    // Una vez que obtienes los valores, debes enviarlos al backend (ver sección 2)
    sendLoginData(username, password);
});


window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    // La posición del logo se actualizará en animate()
});

window.addEventListener("pageshow", function(event) {
  if (event.persisted) {
    // Handle page restore from cache (e.g., back button)
    window.location.reload();
}
});

// Funcion de login
async function sendLoginData(username, password) {
    
    // 1. Prepara el cuerpo de la solicitud con los datos
    const payload = {
        username: username,
        password: password
    };

    try {
        // 2. Envía la solicitud POST a tu ruta /login
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                // Indica al servidor que el cuerpo es JSON
                'Content-Type': 'application/json'
            },
            // Convierte el objeto JavaScript a una cadena JSON
            body: JSON.stringify(payload)
        });

        // 3. Procesa la respuesta del servidor
        const result = await response.json();

        if (result.succesful) {
            // Login exitoso: redirige al usuario o actualiza la interfaz
            console.log("Login Exitoso:", result.reason);
            // Add loading animation
            body.classList.add('fade-out');
            loading_overlay.classList.add('shown');

            setTimeout(()=>{
                // Ejemplo de redirección:
                window.location.href = "/app/dashboard"; // TODO: testing
            }, 500)
        } else {
            // Login fallido: muestra el error al usuario
            console.error("Login Fallido:", result.reason);
            showAlert(result.reason, "Error"); // Muestra el mensaje de error del backend
        }

    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        showAlert('No se pudo conectar con el servidor. Inténtelo más tarde.', "404 - Error Interno");
    }
}