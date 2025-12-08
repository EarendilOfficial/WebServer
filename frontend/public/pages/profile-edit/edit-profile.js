// --- Elementos de Botón ---
const saveChangesButton = document.getElementById('save-changes');
const username = document.getElementById('username');
const mail = document.getElementById('mail');
const phoneNumber = document.getElementById('phoneNumber');
const mcAccount = document.getElementById('mcAccount');

// --- Event Listeners ---
saveChangesButton.addEventListener('click', () => {
    console.log("Guardando cambios...");
    saveProfileChanges(); 
});

/**
 * Recolecta y envía los datos editados al servidor.
 */
async function saveProfileChanges() {
    // Recolectar los datos de los campos
    const updates = {
        username: username.value.trim(),
        mail: mail.value.trim(),
        phoneNumber: phoneNumber.value.trim(),
        mcAccount: mcAccount.value.trim()
    };
    
    // Validación de los datos
    if (!updates.username || !updates.mcAccount) {
        showAlert("Por favor, complete el usuario y la cuenta de minecraft.");
        return;
    }

    // Validación de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updates.mail)) {
        showAlert("Por favor, ingrese un correo electrónico válido.");
        return;
    }

    // 2. Envío a la API
    try {
        const response = await fetch('/api/user/update_profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        const result = await response.json();

        if (response.ok && result.successful) {
            // Éxito:
            showAlert("Cambios exitosos!!", "Exito", true, false)
            setTimeout(()=> {
                window.location.href = '/'; 
            }, 2000)
        } else {
            // Fallo:
            showAlert(`Error al actualizar: ${result.reason}`, "Error", false);
        }

    } catch (e) {
        alert("Error de red al conectar con el servidor.");
        console.error("Detalles del error:", e);
    }
}
