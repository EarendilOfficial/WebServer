// Configuración
const FECHA_OBJETIVO = new Date("January 12, 2026 00:00:00").getTime();

function actualizarTemporizador() {
    const ahora = new Date().getTime();
    const distancia = FECHA_OBJETIVO - ahora;

    if (distancia < 0) {
        document.querySelector(".timer-section").innerHTML = "<h2 class='number' style='color:var(--mc-green)'>¡EL SERVIDOR ESTÁ SIENDO ACTUALIZADO!</h2>";
        return;
    }

    const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

    document.getElementById("dias").innerText = dias.toString().padStart(2, '0');
    document.getElementById("horas").innerText = horas.toString().padStart(2, '0');
    document.getElementById("minutos").innerText = minutos.toString().padStart(2, '0');
    document.getElementById("segundos").innerText = segundos.toString().padStart(2, '0');
}

setInterval(actualizarTemporizador, 1000);
actualizarTemporizador();

// Copiar IP con feedback visual
function copiarIP() {
    const ipTexto = "chamiserv77.ddns.net";
    const ipCard = document.getElementById("server-ip");
    const originalContent = ipCard.innerHTML;

    navigator.clipboard.writeText(ipTexto).then(() => {
        ipCard.style.backgroundColor = "var(--mc-green)";
        ipCard.innerHTML = `<span class="ip-text" style="color:black">¡COPIADA CON ÉXITO!</span>`;
        
        setTimeout(() => {
            ipCard.style.backgroundColor = "";
            ipCard.innerHTML = originalContent;
        }, 2000);
    });
}

// Lógica de Música
const audio = document.getElementById('bg-music');
const musicWidget = document.querySelector('.music-widget');
const musicStatus = document.getElementById('music-status');
let isPlaying = false;

audio.volume = 0.3;

function toggleMusic() {
    if (isPlaying) {
        audio.pause();
        musicStatus.innerText = "MUSIC: OFF";
        musicWidget.classList.remove('playing');
    } else {
        audio.play();
        musicStatus.innerText = "MUSIC: ON";
        musicWidget.classList.add('playing');
    }
    isPlaying = !isPlaying;
}

// Iniciar música al primer clic
document.body.addEventListener('click', () => {
    if (!isPlaying) toggleMusic();
}, { once: true });