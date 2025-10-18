// Obtener referencias del modal
const customAlert = document.getElementById('custom-alert');
const alertTitle = document.getElementById('alert-title');
const alertMessage = document.getElementById('alert-message');
const alertCloseButton = document.getElementById('alert-close');
const alertContent = document.querySelector('.alert-content');

let allowToClose = true;

function showAlert(message, title = "Aviso", isSuccess = false, _allowToClose = true) {
    
    // Asignar contenido
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    allowToClose = _allowToClose; 
    
    // Aplicar estilos temáticos
    if (isSuccess) {
        alertTitle.style.color = '#7CFC00'; // Verde para éxito
        alertContent.style.borderColor = '#878787';
    } else {
        alertTitle.style.color = '#FF8C00'; // Naranja para error/advertencia
        alertContent.style.borderColor = '#878787';
    }
    
    // Mostrar el modal
    customAlert.classList.add('visible');
}

// Lógica para cerrar el modal
function closeAlert() {
    if (!allowToClose) return;
    customAlert.classList.remove('visible');
}

// Asignar evento de cierre
alertCloseButton.addEventListener('click', closeAlert);
customAlert.addEventListener('click', (e) => {
    // Cierra si se hace clic fuera del contenido del modal
    if (e.target.id === 'custom-alert') {
        closeAlert();
    }
});