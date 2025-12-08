const saveChangesButton = document.getElementById('save-changes');

const h_currentPassword = document.getElementById('password');
const h_newPassword = document.getElementById('new-password');
const h_newPassword2 = document.getElementById('new-password-again');



saveChangesButton.addEventListener('click', async () => {
    const currentPassword = h_currentPassword.value.trim(); 
    const newPassword = h_newPassword.value.trim(); 
    const newPassword2 = h_newPassword2.value.trim(); 

    if(newPassword.length < 6) return showAlert("Tu contraseña es demasiado pequeña", "Contraseña pequeña", false)

    if(newPassword2 !== newPassword) return showAlert("Tus contraseñas no coinciden", "Contraseña equivocada", false)

    saveNewPassword(newPassword, currentPassword);
})

async function saveNewPassword(newPassword, password) {
    try {
        const result = await fetch("/api/user/change_password", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({password: password, newPassword: newPassword})
        })

        // Si se cambio la contraseña:
        if(result.ok) {
            showAlert("Tu contraseña se ha cambiado exitosamente! *Debes iniciar sesion con la nueva contraseña", "Contraseña cambiada", true, false)
            setTimeout(()=> {
                window.location.href = '/'
            }, 3000)
            
            return;
        }

        const data = await result.json() 

        console.log(data)

        // Si no salio bien:
        showAlert("Error: " + await data.reason)
        return;

    } catch (err) {
        showAlert("Error: " + err)
    }
}