// --- Lógica de la interfaz de administración (v2) ---

// Función simple para simular la conversión de texto a HTML.
// Esto podría ser reemplazado por una librería de Markdown como 'marked'.


document.addEventListener('DOMContentLoaded', () => {
    const loading_overlay = document.getElementById('loading-overlay');
    loading_overlay.classList.remove("shown");

    const titleInput = document.getElementById('announcement-title');
    const contentInput = document.getElementById('content-input');
    const stylePreset = document.getElementById('style-preset');
    const mediaType = document.getElementById('media-type');
    const mediaUrlGroup = document.querySelector('.media-url-group');
    const mediaUrlInput = document.getElementById('media-url');
    
    const previewButton = document.getElementById('preview-button');
    const saveButton = document.getElementById('save-button');
    const previewOutput = document.getElementById('preview-output');
    const saveStatus = document.getElementById('save-status');

    // Muestra/oculta el campo de URL basado en la selección de tipo de medio
    mediaType.addEventListener('change', () => {
        if (mediaType.value !== 'none') {
            mediaUrlGroup.classList.remove('hidden');
            mediaUrlInput.required = true;
        } else {
            mediaUrlGroup.classList.add('hidden');
            mediaUrlInput.required = false;
        }
    });
    
    // --- MANEJO DE VISTA PREVIA ---
    previewButton.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const textContent = contentInput.value.trim();
        const selectedPreset = stylePreset.value;
        const selectedMedia = mediaType.value;
        const mediaURL = mediaUrlInput.value.trim();

        if (textContent === '') {
            previewOutput.innerHTML = '<p class="placeholder-text" style="color: red;">El campo de Contenido no puede estar vacío.</p>';
            saveButton.disabled = true;
            return;
        }

        // 1. Aplicar Preajuste de Estilo
        previewOutput.className = `${selectedPreset}`; // Cambia la clase CSS
        
        let mediaHTML = '';
        
        // 2. Generar HTML para el Contenido Multimedia
        if (selectedMedia !== 'none' && mediaURL) {
            if (selectedMedia === 'image') {
                mediaHTML = `<img src="${mediaURL}" alt="${title}" style="max-width:100%; height:auto; margin-bottom: 15px;">`;
            } else if (selectedMedia === 'video_embed') {
                // Generar un iframe simple para la vista previa
                mediaHTML = `<div style="margin-bottom: 15px;"><iframe width="100%" height="315" src="${mediaURL}" frameborder="0" allowfullscreen></iframe></div>`;
            }
        }
        
        // 3. Generar HTML del cuerpo del texto
        const bodyHTML = textToHtml(textContent);
        console.log(bodyHTML);

        // 4. Renderizar el resultado final en la vista previa
        previewOutput.innerHTML = `
            <h2 style="margin-top:0;">${title}</h3>
            ${mediaHTML}
            <div class="message-content">
            ${bodyHTML}
            </div>
            <p class="signature" style="text-align: right; font-style: italic; opacity: 0.8;">- Administración</p>
        `;
        
        saveButton.disabled = false;
        saveStatus.textContent = '';
    });

    // --- MANEJO DE GUARDADO (POST a Backend) ---
    saveButton.addEventListener('click', async () => {
        saveButton.disabled = true;
        saveStatus.textContent = 'Guardando...';

        const dataToSave = {
            title: titleInput.value.trim(),
            textContent: contentInput.value.trim(),
            stylePreset: stylePreset.value,
            media: {
                type: mediaType.value,
                url: mediaUrlInput.value.trim(),
                altText: titleInput.value.trim() // Usar el título como texto alternativo simple
            }
            // TODO: isPublished se puede manejar aquí si tienes un checkbox para publicar inmediatamente
        };
        
        // Limpieza final de datos (por si acaso)
        if (dataToSave.media.type === 'none') {
            dataToSave.media.url = '';
        }

        if (dataToSave.textContent === '') {
            saveStatus.textContent = 'Error: Contenido de texto vacío.';
            saveButton.disabled = false;
            return;
        }

        try {
            // El backend se encarga de guardar en MongoDB usando el nuevo esquema
            const response = await fetch('/api/save_announcement', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSave)
            });

            if (response.ok) {
                const result = await response.json();
                saveStatus.textContent = `✅ Publicado con éxito. ID: ${result.id || 'N/A'}`;
                // Opcional: limpiar los campos del formulario aquí
            } else {
                saveStatus.textContent = `❌ Error al publicar: ${response.status} ${response.statusText}`;
            }

        } catch (error) {
            console.error('Error de red/servidor:', error);
            saveStatus.textContent = `❌ Error de conexión: ${error.message}`;
        } finally {
            setTimeout(() => {
                saveButton.disabled = false;
            }, 2000); 
        }
    });
});