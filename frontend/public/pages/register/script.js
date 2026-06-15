const body = document.getElementById('body')
const login_link = document.getElementById('login-link')
const loading_overlay = document.getElementById('loading-overlay')
const inputElement = document.getElementById('uit');

// All form fields
const field_username = document.getElementById('username');
const field_mail = document.getElementById('mail');
const field_pass1 = document.getElementById('pass1');
const field_pass2 = document.getElementById('pass2');
const field_uit = document.getElementById('uit');
const button_send = document.getElementById('send');

window.onload = () => {   
    body.classList.remove("fade-out");
    loading_overlay.classList.remove("shown");
};

login_link.addEventListener('click', ()=> {
    body.classList.add('fade-out');

    // Disable animation
    localStorage.setItem('skip_animation', 'true')
    
    // Add loading animation
    loading_overlay.classList.add('shown');
    
    setTimeout(() => {
        // Dirección a la que voy
        const destinationURL = '/'; 
        window.location.href = destinationURL; 
    }, 500); // 500 milisegundos = 0.5 segundos (debe coincidir con la duración de la transición CSS)
})

inputElement.addEventListener('input', (event) => {
    let value = event.target.value.replace(/[^a-zA-Z0-9]/g, ''); // Remove non-alphanumeric characters
    let formattedValue = '';

    for (let i = 0; i < value.length; i++) {
        // Add a hyphen after every 4 characters
        if (i > 0 && i % 4 === 0) {
            formattedValue += '-';
        }
        formattedValue += value[i];
    }

    // Limit the total length to the desired format (12 characters + 2 hyphens)
    if (formattedValue.length > 14) {
        formattedValue = formattedValue.slice(0, 14);
    }
    
    event.target.value = formattedValue.toUpperCase(); // Ensure uppercase output
});

window.addEventListener("pageshow", function(event) {
    if (event.persisted) {
        // Handle page restore from cache (e.g., back button)
        window.location.reload();
    }
});

button_send.addEventListener('click', (event)=>{
    event.preventDefault();

    console.log("BUTTON");

    if (!field_username.value) {
        console.log("Error");
        showAlert("Escriba un nombre de usuario", "Faltan campos"); return;
    }

    if (!field_mail.value) {
        showAlert("Escriba un correo electronico", "Faltan campos"); return;
    }

    if (field_pass1.value.length <= 5) {
        showAlert("La contraseña es demasiado corta", "Info"); return;
    }

    if (field_uit.value.length < 12) {
        showAlert("El UIT debe estar completo para funcionar", "Error"); return;
    }

    if (field_pass1.value !== field_pass2.value) {
        //Show error message and return
        showAlert("Las contraseñas no coinciden", "Error");
        return;
    }

    loading_overlay.classList.add('shown');
    register_user(field_username.value, field_pass1.value, field_mail.value, field_uit.value);
    setTimeout(()=>{
        loading_overlay.classList.remove('shown')
    }, 500);
})

async function register_user(username, password, mail, uit) {
    const payload = {
        username: username,
        password: password,
        mail: mail,
        uit: uit
    }

    try {
        const response = await fetch('/usr-new-register', {
            method: 'POST',
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();

        if (result.successful) {
            // Mostrar resultado de exito
            showAlert('Su cuenta fue creada exitosamente!', 'Cuenta Registrada', true, false);
            
            setTimeout(()=>{
                // Redirigir al usuario
                window.location.href = "/"; // TODO: testing
            }, 3000);
        } else {
            // Mostrar mensaje de error de registro
            showAlert(result.reason, "Error");
        }

    } catch (e) {
        console.error('Error al conectar con el servidor:', e);
        alert('No se pudo conectar con el servidor. Inténtelo más tarde.');
    }
}