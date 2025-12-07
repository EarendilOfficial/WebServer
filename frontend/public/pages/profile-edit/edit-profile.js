// --- Elementos de Botón ---
const editProfileButton = document.getElementById('edit-profile');
const changePasswordButton = document.getElementById('change-password');

// --- Campos a Editar (Simulados para el ejemplo) ---
const editableFields = [
    { id: 'user-mail', selector: '.user-info-card .stat-value:nth-child(2)' }, // Ejemplo de selección, mejor usar IDs directos
    { id: 'user-phone', selector: '.user-info-card .stat-value:nth-child(4)' }
    // Asumiendo que has puesto IDs únicos en los <span> de stat-value que quieres editar
];

// --- Contenedores del Formulario ---
const userInfoCard = document.querySelector('.user-info-card');
let isEditing = false; // Estado para rastrear si estamos en modo edición

function toggleEditMode() {
    isEditing = !isEditing;
    
    // 1. Alternar texto del botón principal
    editProfileButton.textContent = isEditing ? 'Guardar Cambios' : 'Editar Perfil';
    editProfileButton.classList.toggle('save-mode', isEditing);
    
    const fieldsToModify = [
        document.getElementById("mail-value"), // Mail
        document.getElementById('phone-value')  // Phone Number
    ];

    fieldsToModify.forEach(span => {
        if (!span) return;
        
        if (isEditing) {
            // CONVERTIR A INPUT
            const currentValue = span.textContent.trim();
            const input = document.createElement('input');
            
            input.type = span.classList.contains('mc-account-tag') ? 'text' : 
                         (span.textContent.includes('@') ? 'email' : 'text');
            
            input.value = currentValue;
            input.classList.add('editing-input');
            input.setAttribute('data-original-value', currentValue); // Guardar valor original
            
            span.parentNode.replaceChild(input, span);
            
        } else {
            // CONVERTIR DE NUEVO A SPAN (Lógica de guardado)
            const input = span;
            const newValue = input.value.trim();
            const originalSpan = document.createElement('span');
            
            originalSpan.classList.add('stat-value');
            // Mantener las clases de color originales
            originalSpan.classList.add(...input.className.split(' ').filter(cls => cls !== 'editing-input')); 
            
            originalSpan.textContent = newValue;
            
            input.parentNode.replaceChild(originalSpan, input);
        }
    });
}

// --- Event Listeners ---

editProfileButton.addEventListener('click', () => {
    console.log("Navegando a la página de editar perfil...");
    window.location.href = '/user/edit-profile'; 
});


changePasswordButton.addEventListener('click', () => {
    console.log("Navegando a la página de cambio de contraseña...");
    window.location.href = '/user/change-password'; 
});


/**
 * Recolecta y envía los datos editados al servidor.
 */
async function saveProfileChanges() {
    // 1. Recolectar datos
    const inputs = userInfoCard.querySelectorAll('input.editing-input');
    const updates = {};
    let shouldProceed = true;

    inputs.forEach(input => {
        const fieldName = input.getAttribute('name') || (input.type === 'email' ? 'mail' : 
                                                          input.type === 'tel' ? 'phoneNumber' : 
                                                          'username'); // Asignar nombres de schema
        
        const newValue = input.value.trim();
        const originalValue = input.getAttribute('data-original-value');
        
        // Solo enviar si el valor ha cambiado
        if (newValue !== originalValue) {
            updates[fieldName] = newValue;
        }
        
        // Validación básica
        if (fieldName === 'mail' && newValue && !newValue.includes('@')) {
            alert("Por favor, introduce un correo electrónico válido.");
            shouldProceed = false;
        }
    });

    if (!shouldProceed || Object.keys(updates).length === 0) {
        if (shouldProceed) {
            console.log("No hay cambios para guardar.");
        }
        toggleEditMode(); // Volver al modo visual si no hay cambios
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

        if (response.ok && result.succesful) {
            // Éxito:
            console.log("Perfil actualizado con éxito!");
            // Volver al modo visual (se recargará con los nuevos datos si es necesario)
            toggleEditMode(); 
        } else {
            // Fallo:
            alert(`Error al actualizar: ${result.reason}`);
        }

    } catch (e) {
        alert("Error de red al conectar con el servidor.");
    }
    
    // 3. Volver al modo visual si el envío falló o tuvo éxito
    if (isEditing) {
        // Si el servidor falla, es mejor mantenerlo en modo edición para que no pierda los datos
        // Pero para simplificar, lo regresaremos:
        toggleEditMode(); 
    }
}