const logout_link = document.getElementById('logout_link');
const firstLogin = localStorage.getItem('isFirstLogin')

logout_link.addEventListener('click', async ()=>{
    const response = await fetch('/logout', {
        method: 'POST',
        headers: {
            // Indica al servidor que el cuerpo es JSON
            'Content-Type': 'application/json'
        },
    });

    window.location.href = '/';
})



document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const loading_overlay = document.getElementById('loading-overlay');
    const scrollThreshold = 180; // Distancia en píxeles antes de que el logo se mueva

    // Esto hace que el icono de carga no aparezca de nuevo
    if (firstLogin === 'true') {
        loading_overlay.classList.remove("shown");
        localStorage.setItem('isFirstLogin', 'false')
    } else {
        loading_overlay.innerHTML = ''
    }


    function handleScroll() {
        // Verifica si el scroll vertical (scrollY) ha superado el umbral
        if (window.scrollY > scrollThreshold) {
            // Estado Final: Logo se mueve al header
            header.classList.add('scrolled');
        } else {
            // Estado Inicial: Logo grande y flotante
            header.classList.remove('scrolled');
        }
    }

    // Inicializa la función al cargar la página (en caso de que la página se cargue scrolleada)
    handleScroll(); 

    // Añade el detector de eventos de scroll
    window.addEventListener('scroll', handleScroll);

    obtenerUltimosAnuncios();
    
    // Muestra informacion general del perfil de usuario de minecraft 
    getPlayerData();
    
    // Cargar otros datos laterales
    getPlayerCount()
    getLatestUpdate();
    getActiveEvents();
});

async function obtenerUltimosAnuncios() {
    // limpiar el contenedor
    const announcementContainer = document.querySelector('.latest-content');
    announcementContainer.innerHTML = '';

    const response = await fetch('/api/get_content_latest', {
        method: 'GET'
    });

    let data = await response.json()
    console.log(data);

    if (Array.isArray(data.posts)) {
        data.posts.forEach(post => {
            const postElement = renderAnnouncement(post);
            announcementContainer.appendChild(postElement);
        });
    } else {
        announcementContainer.innerHTML = '<p class="error-text">No hay anuncios disponibles en este momento.</p>';
    }
}

async function getPlayerData() {
    const player_name = document.getElementsByClassName('player-name')[0];
    const player_info_card = document.getElementsByClassName('player-info-card')[0];
    const player_level = document.getElementById('player-level');
    const player_rank = document.getElementById('player-rank');
    const player_ringcoins = document.getElementById('player-ringcoins');
    const player_reputation = document.getElementById('player-reputation');
    const player_clan = document.getElementById('player-clan');
    const player_finished_missions = document.getElementById('player-finishedMissions');
    const player_killcount = document.getElementById('player-killcount');

    const response = await fetch('/api/get_minecraft_data', {
        method: 'GET'
    });
    const data = await response.json(); 

    if (!data.mcAccount) {
        player_info_card.innerHTML = "Registra tu cuenta de Minecraft para ver tus estadisticas!!"
        return;
    }

    player_name.innerHTML = data.mcAccount;
    player_clan.innerHTML = data.clan || "Ninguno";
    player_ringcoins.innerHTML = data.ringcoins;

    const stats = data.stats;
    player_level.innerHTML = stats.playerlevel;
    player_rank.innerHTML = stats.rank;
    player_reputation.innerHTML = stats.reputation.title;
    player_killcount.innerHTML = stats.kills;
    player_finished_missions.innerHTML = stats.missionsDone;
}

async function getPlayerCount() {
    active_players = document.getElementById('active_players');

    const response = await fetch('/api/get_user_count', {
        method: 'GET'
    });

    const data = await response.json();
    console.log("Active players:", data.number)
    active_players.innerHTML = data.number
}

async function getLatestUpdate() {
    const updateTitle = document.querySelector('.latest-update h3');
    const updateImage = document.querySelector('.latest-update .update-image');
    const updateDesc = document.querySelector('.latest-update .description');
    const serverVersion = document.querySelector('.latest-update .version');

    try {
        const response = await fetch('/api/get_latest_update', { method: 'GET' });
        
        // Verifica si la respuesta es exitosa antes de parsear JSON
        if (!response.ok) {
            updateTitle.textContent = "Última Actualización: Desconocida";
            updateImage.src = '/resources/icons/sections/report_icon2.png';
            serverVersion.innerHTML = "Versión del Servidor: **N/A**";
            return;
        }

        const data = await response.json(); 

        if (data && data.versionName) {
            updateTitle.textContent = `Última Actualización: ${data.versionName}`;
            updateImage.src = data.imageUrl || '/resources/icons/default_update.png';
            updateDesc.textContent = data.description || ""
            serverVersion.innerHTML = `Versión del Servidor: **${data.serverVersion || 'Desconocida'}**`;
        } else {
            updateTitle.textContent = "Última Actualización: Información no disponible";
            serverVersion.innerHTML = "Versión del Servidor: **N/A**";
        }
    } catch (e) {
        console.error("Error fetching latest update:", e);
        updateTitle.textContent = "Error de conexión";
    }
}

async function getActiveEvents() {
    const eventList = document.querySelector('.event-list');
    eventList.innerHTML = ''; // Limpiar la lista existente

    try {
        const response = await fetch('/api/get_active_events', { method: 'GET' });
        
        if (!response.ok) {
             eventList.innerHTML = '<li class="error-text">Error al cargar eventos.</li>';
             return;
        }

        const data = await response.json(); 

        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
            data.events.forEach(event => {
                const li = document.createElement('li');
                
                switch (event.rank) {
                    case 'epic':
                        li.classList.add("epic")
                        break;
                    case 'legendary':
                        li.classList.add("legendary")
                        break;
                    case 'christmas':
                        li.classList.add("christmas")
                        break;
                    default: break; 
                }

                // Formateo simple del tiempo
                const endTime = new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endDate = new Date(event.endTime);
                const endDay = endDate.toLocaleDateString('es-ES', {day: "numeric", weekday: 'long' }); // Ej: lun, mar, mié, etc.

                li.innerHTML = `<strong>${event.title}</strong> <p class='description'>${event.description ?? ''}</p> <p class=date>[Finaliza: ${endTime} ${endDay}] </p>`;
                li.title = `${event.description || "Evento"} - Ubicación: ${event.location}`; // Tooltip
                eventList.appendChild(li);
            });
        } else {
            eventList.innerHTML = '<li class="no-events">No hay eventos programados.</li>';
        }

    } catch (e) {
        console.error("Error fetching active events:", e);
        eventList.innerHTML = '<li class="error-text">Fallo al conectar con el servidor de eventos.</li>';
    }
}