document.addEventListener('DOMContentLoaded', () => {
    // Lógica del Menú Barritas
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav_links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            // Alterna la clase 'open' para deslizar el menú
            navLinks.classList.toggle('open');
            // Opcional: Alternar un icono de "X" en el botón (No implementado requiere más CSS)
            menuToggle.classList.toggle('active');
        });
        
        // Cerrar el menú si se hace clic en cualquier enlace
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                menuToggle.classList.remove('active');
            });
        });
    }
});