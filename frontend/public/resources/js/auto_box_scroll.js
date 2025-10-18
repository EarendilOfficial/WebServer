const form = document.querySelector('form'); // O usa document.getElementById('tuFormularioId')


// Función para mover el foco al siguiente campo de entrada
function focusNextInput(currentInput) {
    // 1. Obtener todos los campos de entrada (input, textarea, select, button)
    const inputs = Array.from(form.querySelectorAll('input, button, a'));
    
    // 2. Determinar el índice del campo actual
    const currentIndex = inputs.indexOf(currentInput);
    
    if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
        // 3. Calcular el índice del siguiente elemento
        let nextIndex = currentIndex + 1;
        let nextElement = inputs[nextIndex];

        // Opcional: Saltar enlaces si la navegación por Enter solo es para campos.
        // Mientras el siguiente elemento sea un enlace, busca el siguiente.
        while (nextElement && nextElement.tagName === 'A' && nextIndex < inputs.length - 1) {
            nextIndex++;
            nextElement = inputs[nextIndex];
        }

        // 4. Mover el foco si existe un elemento válido
        if (nextElement && (nextElement.tagName !== 'A' || nextElement.tagName !== 'BUTTON')) {
             nextElement.focus();
        } else if (nextElement && nextElement.tagName === 'BUTTON') {
             // Si el siguiente es un botón, también movemos el foco
             nextElement.focus();
        }

    } else if (currentIndex === inputs.length - 1) {
        // Si estamos en el último campo (o botón), enfocar el primer campo
        inputs[0].focus();
    }
}


form.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
        // Si el elemento actual NO es el botón de submit ni un enlace
        if (event.target.type !== 'submit' && event.target.tagName !== 'A') {
            event.preventDefault(); // Prevenir el envío del formulario
            focusNextInput(event.target); // Mover el foco
        } 
        // Si es un botón submit, permitimos el envío predeterminado (o tu lógica de click).
    }
});