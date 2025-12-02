const logout_link = document.getElementById('logout_link');

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

    loading_overlay.classList.remove("shown");

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

    getLatestContent();
    getPlayerData();
    getPlayerCount()
});

async function getLatestContent() {
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