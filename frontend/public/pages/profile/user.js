const estadoDeCuentaSpan = document.getElementById("account-state");
const unreadCountSpan = document.getElementById('unread-count');
const weeklyActivityGraph = document.getElementsByClassName("weekly-activity-graph")[0]
const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
let minecraftData = []
let userData = []
let activity = []
let notifications = []
let unreadCount = 0;




///On page ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        minecraftData = await getMinecraftData()
        userData = await getUserData()
        activity = await getActivity()
        notifications = await getNotifications()
        
    } finally {
        updateStats();
    }

})


// -------------------------------------------------------------------
// Funciones
// -------------------------------------------------------------------


async function getMinecraftData() {
    const request = await fetch('/api/get_minecraft_data', {
        method: "GET"
    }) 

    const data =  await request.json()
    return data;
}

async function getUserData() {
    const request = await fetch('/api/get_my_data', {
        method: "GET"
    }) 

    let user =  await request.json()
    return user;
}

async function getActivity() {
    const request = await fetch('/api/get_my_activity', {
        method: "GET"
    }) 

    const activityData =  await request.json()
    return activityData;
}

async function getNotifications() {
    const request = await fetch('/api/get_my_notifications', {
        method: "GET"
    })
    
    return await request.json()
}

// Actualiza parte de las finanzas, la actividad semanal, las estadisticas de minecraft, y el estado de la cuenta
function updateStats() {
    updateFinances()
    renderWeeklyActivity(weeklyActivityGraph, activity.weeklyActivity)
    getPlayerData()
    setAcccountStatus()
    renderNotifications(notifications)
}

function renderNotifications(_notificaciones) {
    
    // Referencia al contenedor y al contador de no leídas
    const container = document.getElementById('notifications-container');
    
    // Limpiar el contenedor antes de renderizar
    if (!container) return console.error("El contenedor de notificaciones (ID: notifications-container) no fue encontrado.");
    container.innerHTML = '';
    
    // 4. Comprobar si hay notificaciones
    if (_notificaciones.length === 0) {
        container.innerHTML = '<p class="section-subtitle">No tienes notificaciones nuevas.</p>';
        unreadCountSpan.textContent = 0;
        return;
    }
    
    // 5. Ordenar las notificaciones por fecha (más recientes primero)
    // Es buena práctica asegurarse de que los timestamps son objetos Date.
    _notificaciones.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));


    // 6. Iterar y renderizar
    _notificaciones.forEach(notif => {
        
        // Crear div de notificacion
        const item = document.createElement('div');
        item.classList.add('notification-item');
        
        //Mostrar Notificacion
        
        // Si no esta leida, añadir un event listener para cuando se le presiona
        item.addEventListener('click', async () => {
            // Pasamos el _id único del subdocumento
            showNotificationDetail(notif, item);
            
            if (!notif.read) {
                await markNotificationAsRead(notif._id, item);
                notif.read = true
            }
        });
        
        // 6b. Formatear la fecha
        const notifDate = new Date(notif.timestamp);
        const formattedDate = notifDate.toLocaleDateString('es-ES', { 
            month: 'short', day: 'numeric', year: 'numeric' 
        });
        
        // 6c. Crear el elemento de notificación
        
        // Aplicar clase para notificaciones no leídas
        if (!notif.read) {
            unreadCount++;    
            item.classList.add('unread');
        }
        
        // 6d. Rellenar el contenido
        item.innerHTML = `
            <div class="notif-header">
                <span class="notif-status">${notif.read ? 'Leído' : 'NUEVO'}</span>
                <span class="notif-date">${formattedDate}</span>
            </div>
            <p class="notif-message">${notif.title || notif.message || notif.type}</p>
        `;

        container.appendChild(item);
    });

    // 7. Actualizar el contador
    unreadCountSpan.textContent = unreadCount;
}

function showNotificationFunction() {

}

async function markNotificationAsRead(notifId, itemElement) {
    
    // Deshabilitar la interacción mientras se espera la respuesta del servidor
    itemElement.style.pointerEvents = 'none';

    try {
        const response = await fetch('/api/set_notification_read', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notificationId: notifId })
        });

        if (response.ok) {
            // 1. Actualización Visual: Remover la clase 'unread'
            itemElement.classList.remove('unread');

            
            // 2. Actualización de Texto: Marcar como 'Leído'
            const statusSpan = itemElement.querySelector('.notif-status');
            if (statusSpan) statusSpan.textContent = 'Leído';
            
            unreadCount--;
            unreadCountSpan.textContent = unreadCount;
            
            console.log(`Notificación ${notifId} marcada como leída con éxito.`);

        } else {
            const errorData = await response.json();
            console.error('Error al marcar como leída:', errorData.reason || 'Fallo desconocido.');
            // Opcional: Mostrar un showAlert() aquí
        }

    } catch (error) {
        console.error('Error de red al marcar notificación:', error);
    } finally {
        // Restaurar la interacción, incluso si hubo un error (para que el usuario pueda reintentar)
        itemElement.style.pointerEvents = 'auto'; 
    }
}

function setAcccountStatus() {
    const financesDiv = document.getElementById("finances")
    
    //crear elementos del html
    const row = document.createElement("div")
    row.classList.add("stat-row")

    const rowlabel = document.createElement("span")
    rowlabel.classList.add("stat-label")
    rowlabel.textContent = "Acceso al servidor:"
    
    const rowValue = document.createElement("span")
    
    const msg = document.createElement("p")
    msg.classList.add("section-subtitle")
    
    if (minecraftData.activeAccess) {
        rowValue.classList.add("stat-value");
        rowValue.classList.add("status-active")
        rowValue.textContent = "Habilitado"
        msg.textContent = "Podras acceder al servidor con normalidad, siempre que no se encuentre en mantenimiento"
    } else {    
        rowValue.classList.add("stat-label")
        rowValue.textContent = "Deshabilitado"
        msg.textContent = "Tu acceso al servidor se encuentra deshabilitado, ya sea por falta de pago o moderacion"
    }


    financesDiv.appendChild(row)
    financesDiv.appendChild(msg)
    row.appendChild(rowlabel)
    row.appendChild(rowValue)
}


function updateFinances() {
    let debtMonths = userData.payement.debtMonths;
    if (debtMonths.length > 0){
        estadoDeCuentaSpan.textContent = "Tienes una deuda"
        estadoDeCuentaSpan.classList.add("debt-warning")
    } 
}


// Renderiza el contenido de la seccion de barras de actividad
function renderWeeklyActivity(containerElement, weeklyActivity) {
    
    // 1. Limpiar el contenedor antes de renderizar
    containerElement.innerHTML = '';

    // 2. Comprobar si hay datos válidos
    if (!weeklyActivity || weeklyActivity.length === 0) {
        // Mostrar mensaje si no hay actividad
        containerElement.innerHTML = '<h1>No hay datos de actividad.</h1>';
        containerElement.style.justifyContent = 'center'; // Centrar el mensaje
        return;
    }
    
    // 3. Iterar sobre los datos y construir el HTML
    weeklyActivity.forEach((percentage, index) => {
        console.log(percentage)

        // Asegurar que el porcentaje sea un número y esté en el rango 0-100
        const safePercentage = Math.max(0, Math.min(100, Math.round(percentage)));

        // --- Creación de Elementos ---

        // <div class="day-bar-wrapper">
        const dayBarWrapper = document.createElement('div');
        dayBarWrapper.classList.add('day-bar-wrapper');
        
        // <p class="day-label">Día</p>
        const dayLabel = document.createElement('p');
        dayLabel.classList.add('day-label');
        dayLabel.textContent = daysOfWeek[index];

        // <div class="bar-container-vertical">
        const barContainer = document.createElement('div');
        barContainer.classList.add('bar-container-vertical');
        barContainer.title = `${safePercentage}% Jugado`; // Tooltip
        
        // <div class="bar-fill" style="height: X%;"></div>
        const barFill = document.createElement('div');
        barFill.classList.add('bar-fill');
        
        // Porcentaje de altura
        barFill.style.height = `${safePercentage}%`; 
        
        // --- Ensamblaje ---
        barContainer.appendChild(barFill);
        
        dayBarWrapper.appendChild(dayLabel);
        dayBarWrapper.appendChild(barContainer);

        containerElement.appendChild(dayBarWrapper);
    });

}


async function getPlayerData() {
    // const player_name = document.getElementsByClassName('player-name')[0];
    const player_info_card = document.getElementsByClassName('player-info-card')[0];
    const player_level = document.getElementById('player-level');
    const player_rank = document.getElementById('player-rank');
    const player_ringcoins = document.getElementById('player-ringcoins');
    const player_reputation = document.getElementById('player-reputation');
    const player_clan = document.getElementById('player-clan');
    const player_finished_missions = document.getElementById('player-finishedMissions');
    const player_killcount = document.getElementById('player-killcount');

    

    if (!minecraftData.mcAccount) {
        player_info_card.innerHTML = "Registra tu cuenta de Minecraft para ver tus estadisticas!!"
        return;
    }

    // player_name.innerHTML = data.mcAccount;
    player_clan.innerHTML = minecraftData.clan || "Ninguno";
    player_ringcoins.innerHTML = minecraftData.ringcoins;

    const stats = minecraftData.stats;
    player_level.innerHTML = stats.playerlevel;
    player_rank.innerHTML = stats.rank;
    player_reputation.innerHTML = stats.reputation.title;
    player_killcount.innerHTML = stats.kills;
    player_finished_missions.innerHTML = stats.missionsDone;
}

