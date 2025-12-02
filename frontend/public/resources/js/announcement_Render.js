function renderAnnouncement(data) {
    const content = document.createElement('div');
    
    const title = data.title;
    const textContent = data.textContent;
    const selectedPreset = data.stylePreset;
    const selectedMedia = data.media.type;
    const mediaURL = data.media.url;
    const author = data.author;

    if (textContent === '') {
        content.innerHTML = '<p class="placeholder-text" style="color: red;">El campo de Contenido no puede estar vacío.</p>';
        saveButton.disabled = true;
        return;
    }

    // 1. Aplicar Preajuste de Estilo
    content.className = `${selectedPreset}`; // Cambia la clase CSS
    
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

    // 4. Renderizar el resultado final en la vista previa
    content.innerHTML = `
        <h2 style="margin-top:0;">${title}</h3>
        ${mediaHTML}
        <div class="message-content">
        ${bodyHTML}
        </div>
        <p class="signature" style="text-align: right; font-style: italic; opacity: 0.8;">- Autor del post: ${author}</p>
    `;

    return content;
}

function textToHtml(text) {
    // Escapa HTML básico para prevenir XSS simple
    let escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    // Simula Markdown básico: Negrita (**) y saltos de línea, tambien imagenes y links
    escapedText = escapedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    escapedText = escapedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    escapedText = escapedText.replace(/\^\^(.*?)\^\^/g, '<img src="$1" alt="$1"></img>');
    escapedText = escapedText.replace(/\^(.*?)\^/g, '<a href="$1">$1</a>');
    
    // Convierte saltos de línea en <br> y envuelve en <p>
    const paragraphs = escapedText.split('\n').filter(p => p.trim() !== '');
    return paragraphs.map(p => `<p>${p}</p>`).join('');
}