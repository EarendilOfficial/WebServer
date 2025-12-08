// Referencia global al contenedor de la consola
const consoleScreen = document.querySelector('.console-screen');
//Entrada de comandos
const commandInput = document.getElementById('command-input');

let mcData = []

// boton de envio
const sendCommandButton = document.getElementById('send-command-btn');
// Enviar comando al hacer clic en el botón
sendCommandButton.addEventListener('click', handleCommandSend);

document.addEventListener('DOMContentLoaded', async ()=> {
    mcData = await getMinecraftData()
})

// 1. Enviar comando al presionar Enter
commandInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault(); // Prevenir el envío de formularios si existe
        handleCommandSend();
    }
});

async function getMinecraftData() {
    const request = await fetch('/api/get_minecraft_data', {
        method: "GET"
    }) 

    const data =  await request.json()
    return data;
}

/**
 * Procesa y envía el comando escrito por el usuario.
*/
function handleCommandSend() {
    const commandText = commandInput.value.trim();
    
    if (!commandText) {
        return; // No hacer nada si está vacío
    }
    
    // 1. Añadir el comando del usuario a la pantalla
    addConsoleMessage(`${mcData.mcAccount || "Usuario"}: ${commandText}`, 'input');
    
    // 2. Aquí iría la lógica de envío al servidor (API POST: /api/command)
    // sendCommandToServer(commandText);
    
    // 3. Limpiar la entrada
    commandInput.value = '';
    
    // 4. Devolver un log de simulación/respuesta (puedes borrar esto cuando uses el backend real)
    setTimeout(() => {
        addConsoleMessage(`Sistema: Comando '${commandText.split(' ')[0]}' procesado. Esperando respuesta del servidor...`, 'info');
    }, 500);
}



//Enfocar el input al abrir la consola
if (commandInput) {
    commandInput.focus();
}

/**
 * Añade un mensaje al terminal de la consola.
 * Tipo de mensaje ('info', 'warn', 'error', 'admin').
 */
function addConsoleMessage(message, type = 'info') {
    if (!consoleScreen) return;

    const messageElement = document.createElement('p');
    messageElement.classList.add('console-message', `log-${type}`);

    // Crear el timestamp estilo [HH:MM:SS]
    const now = new Date();
    const timestamp = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });

    // Añadir el contenido
    messageElement.innerHTML = `[${timestamp}] > ${message}`;

    // 1. Añadir el nuevo mensaje al contenedor
    consoleScreen.appendChild(messageElement);

    // 2. 🔑 CLAVE: Mantener el scroll al fondo (como un terminal real)
    consoleScreen.scrollTop = consoleScreen.scrollHeight;
}



// Ejemplo 1: Mensaje de Bienvenida
addConsoleMessage("Bienvenido, Administrador Khalid. Cargando logs de sesión...", 'admin');

// Ejemplo 2: Un error simulado
setTimeout(() => {
    addConsoleMessage("ERROR: No se pudo conectar al chunk 'Nether_Spawn' (Timeout)", 'error');
}, 1000);

// Ejemplo 3: Un comando exitoso
setTimeout(() => {
    addConsoleMessage("Sistema: Comando 'reload' ejecutado con éxito por el usuario.", 'info');
    addConsoleMessage("Sistema: Comando 'reload' ejecutado con éxito por el usuario.", 'info');
    addConsoleMessage("Sistema: Comando 'reload' ejecutado con éxito por el usuario.", 'info');
    addConsoleMessage("Sistema: Comando 'reload' ejecutado con éxito por el usuario.", 'info');
    addConsoleMessage("Sistema: Comando 'reload' ejecutado con éxito por el usuario.", 'info');
    addConsoleMessage("Sistema: Comando 'reload' ejecutado con éxito por el usuario.", 'info');
    addConsoleMessage("Sistema: Comando 'reload' ejecutado con éxito por el usuario.", 'info');
    addConsoleMessage("Sistema: Comando 'reload' ejecutado con éxito por el usuario.", 'info');
    addConsoleMessage("Sistema: Comando 'reload' ejecutado con éxito por el usuario.", 'info');
    addConsoleMessage("Sistema: Comando 'reload' ejecutado con éxito por el usuario.", 'info');
    addConsoleMessage("Sistema: Comando 'reload' ejecutado con éxito por el usuario.", 'info');
}, 2500);


