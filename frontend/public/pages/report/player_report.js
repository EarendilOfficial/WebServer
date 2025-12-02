console.log("El script esta ejecutando correctamente...")

// Variables
let playerListData = [];
let selectedPlayer = null;

let reason = null;
let details = null;

const playerListContainer = document.getElementById("player-list")

function selectPlayer(username, element) {
    // 1. Quitar la clase 'selected' de todos los elementos previamente seleccionados
    const currentSelected = document.querySelector('#player-list .selected');
    if (currentSelected) {
        currentSelected.classList.remove('selected');
    }

    // 2. Aplicar la clase 'selected' al nuevo elemento
    element.classList.add('selected');

    // 3. Actualizar jugador seleccionado
    selectedPlayer = username;
    console.log(`Jugador seleccionado: ${selectedPlayer}`);
}

function renderPlayerList(playerList, filterText = "") {
    playerListContainer.innerHTML = ''; // Limpiar el contenedor
    const lowerCaseFilter = filterText.toLowerCase();


    // Mostrar cada uno de los jugadores en la barra
    playerList.forEach(playerName => {
        // Aplica el filtro si el nombre de usuario incluye el texto de búsqueda
        if (playerName.toLowerCase().includes(lowerCaseFilter)) {
            // Crea el elemento div con la estructura HTML necesaria
            const playerItem = document.createElement('div');
            playerItem.classList.add('player-item');
            playerItem.setAttribute('data-username', playerName);
            playerItem.textContent = playerName;

            // Agrega el evento de clic para seleccionar al jugador
            playerItem.addEventListener('click', () => selectPlayer(playerName, playerItem));

            // Si este jugador ya estaba seleccionado previamente, mantener la clase 'selected'
            if (selectedPlayer === playerName) {
                playerItem.classList.add('selected');
            }

            playerListContainer.appendChild(playerItem);
        }
    });

    // Si no hay jugadores que coincidan con la lista
    if (playerListContainer.innerHTML == "") {
        playerListContainer.innerHTML = "No hay jugadores con ese nombre"
    }
}

async function getUsersData(){
    if (!playerListContainer) return;

    // Get all playernames
    const response = await fetch("/api/get_player_names", {
        method: "GET"
    })
    const data = await response.json()
    playerListData = data.playersData;
    
    renderPlayerList(playerListData)

}

getUsersData()

// Actualiza la barra de jugadores con el jugador que buscas 
const playerSearch = document.querySelector("#player-search")
if (playerSearch) {
    playerSearch.addEventListener('input', (event) => {
        const textoDeLaBusqueda = event.target.value;
        renderPlayerList(playerListData, textoDeLaBusqueda)
    })
}

// Botones para seleccionar la razón del reporte
const botonLenguajeOfensivo = document.querySelector("a[data-reason-id='1']");
const botonGriefing = document.querySelector("a[data-reason-id='2']");
const botonUsoDeHacks = document.querySelector('a[data-reason-id="3"]');
const botonPublicacionesInapropiadas = document.querySelector('a[data-reason-id="4"]');
const botonOtroMotivo = document.querySelector('a[data-reason-id="5"]');

// Asignacion de eventos a botones
botonLenguajeOfensivo.addEventListener('click', selectReason)
botonGriefing.addEventListener('click', selectReason)
botonUsoDeHacks.addEventListener('click', selectReason)
botonPublicacionesInapropiadas.addEventListener('click', selectReason)
botonOtroMotivo.addEventListener('click', selectReason)

function selectReason(event) {
    // borrar el color de cualquier otro evento seleccionado
    const lastSelectedItem = document.querySelector('.reason-choose-list .selected');
    if (lastSelectedItem) lastSelectedItem.classList.remove('selected')
    
    // asignarse el color
    event.target.parentElement.classList.add('selected')

    // asignar la variable de reason con su id
    reason = event.target.getAttribute("data-reason-id")
}

// Enviar el Reporte
const botonEnviar = document.getElementById("submit-report-btn");
botonEnviar.addEventListener('click', ()=> {
    const detallesReporte = document.getElementById('report-details')
    details = detallesReporte.value

    // Ya que obtivimos los detalles y todo, validamos la entrada
    if (selectedPlayer == null) {
        showAlert("Te falta elegir un jugador!!", "Campos Faltantes")
        return;
    } 

    if (reason == null) {
        showAlert("Te falta elegir una razón!", "Campos Faltantes")
        return;
    }

    //Si todo va bien, mandamos el reporte
    const dataToSend = {
        selectedPlayer,
        reason,
        details
    }
    
    sendReport(dataToSend);
})

async function sendReport(payload) {
    try {
        let response = await fetch('/api/sendReport', {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(payload)
        })

        // Si el status del reporte no es el correcto, avisar al usuario que su reporte no se mandó 
        let status = await response.status;
        if (status != 201) {
            showAlert("Tu mensaje no pudo ser enviado", "ERROR");
            return;
        }
        
        showAlert("Los administradores revisaran tu reporte de inmediato!", "Reporte enviado", true)
        limpiarCamposSeleccionados()
    } catch (err) {
        showAlert("No se pudo enviar tu reporte", "Error Del Servidor")
    }
}

function limpiarCamposSeleccionados() {
    const lastSelectedItem = document.querySelector('.reason-choose-list .selected');
    if (lastSelectedItem) lastSelectedItem.classList.remove('selected')
    reason = null;

    const selPlayer = document.querySelector('#player-list .selected');
    if (selPlayer) selPlayer.classList.remove('selected');
    selectedPlayer = null;

    const detallesReporte = document.getElementById('report-details')
    detallesReporte.value = "";
    details = null;
}