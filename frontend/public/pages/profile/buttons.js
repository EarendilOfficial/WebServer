// --- Elementos de Botón ---
const editProfileButton = document.getElementById('edit-profile');
const changePasswordButton = document.getElementById('change-password');

// --- Event Listeners ---

editProfileButton.addEventListener('click', () => {
    console.log("Navegando a la página de editar perfil...");
    window.location.href = '/user/edit-profile'; 
});


changePasswordButton.addEventListener('click', () => {
    console.log("Navegando a la página de cambio de contraseña...");
    window.location.href = '/user/change-password'; 
});
