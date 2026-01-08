import Toast from "/resources/js/toast.js";
// filepath: /home/hiasen/Documents/WebServer/frontend/public/pages/mail/mail.js

(() => {
    // Simple mail UI controller
    const entriesEl = document.querySelector('.mail-entries');
    const titleEl = document.querySelector('.content-card .title');
    const autorEl = document.querySelector('.content-card .autor');
    const fechaEl = document.querySelector('.content-card .fecha');
    const bodyEl = document.querySelector('.mail-body');
    const replyBtn = document.querySelector('.btn.reply');
    const deleteBtn = document.querySelector('.btn.delete');
    const newMailBtn = document.querySelector('.new-mail');
    const tabLinks = document.querySelectorAll('.tab-chooser a');

    if (!entriesEl) return; // not the mail page

    let mails = []; // {id, from, to, subject, body, date, status: 'new'|'read'|'sent'}
    let selectedId = null;
    let filter = 'new';

    // utilities
    const uid = (() => {
        let i = Date.now();
        return () => (i++).toString(36);
    })();

    const formatDate = (iso) => {
        const d = new Date(iso);
        if (isNaN(d)) return iso;
        return d.toLocaleDateString('en-GB'); // Format: day / month / year
    };

    // Attempt to load from server, fallback to demo data
    async function loadMails() {
        try {
            const res = await fetch('/api/mails', { credentials: 'same-origin' });
            if (!res.ok) throw new Error('no-api');
            const data = await res.json();

            if (Array.isArray(data)) {
                mails = data.map((m) => ({ ...m, id: m.id || uid() }));
                return;
            }
        } catch (e) {
            new Toast('No se pudieron cargar los correos desde el servidor!', 5000, "toast_error");

            // fallback demo data
            mails = [
                {
                    id: uid(),
                    from: 'Monaliza',
                    to: 'you@domain',
                    subject: 'Bienvenida al servicio',
                    body: 'Hola, gracias por usar nuestro servicio. Este es un correo de demostración.',
                    date: new Date().toISOString(),
                    status: 'new'
                },
                {
                    id: uid(),
                    from: 'Soporte',
                    to: 'you@domain',
                    subject: 'Actualización importante',
                    body: 'Se han aplicado cambios al sistema. Revisa las notas de la versión.',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                    status: 'read'
                },
                {
                    id: uid(),
                    from: 'Tu mismo',
                    to: 'amigo@dom',
                    subject: 'Saludos',
                    body: 'Mensaje enviado de prueba.',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
                    status: 'sent'
                }
            ];
        }
    }

    // Render list based on current filter
    function renderList() {
        entriesEl.innerHTML = '';
        const list = mails.filter((m) => {
            if (filter === 'new') return m.status === 'new';
            if (filter === 'read') return m.status === 'read';
            if (filter === 'sent') return m.status === 'sent';
            return true;
        });

        if (list.length === 0 && selectedId === null) {
            const empty = document.createElement('article');
            empty.className = 'mail';
            empty.innerHTML = '<p>No hay correos.</p>';
            entriesEl.appendChild(empty);
            clearDisplay();
            return;
        }

        for (const m of list) {
            const art = document.createElement('article');
            art.className = 'mail';
            art.dataset.id = m.id;
            art.dataset.status = m.status;
            art.innerHTML = `
                <div class="mail-upperhander">
                    <span>Enviado por: <span class="rango-plebeyo">${escapeHtml(m.from)}</span></span>
                    <span>Fecha: <span>${formatDate(m.date)}</span></span>
                </div>
                <p>${escapeHtml(m.subject)} - ${escapeHtml(truncate(m.body, 80))}</p>
            `;
            if (m.id === selectedId) art.style.transform = 'scale(1.05)';
            entriesEl.appendChild(art);
        }
    }

    function escapeHtml(s = '') {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    function truncate(s = '', n = 80) {
        return s.length > n ? s.slice(0, n - 1) + '…' : s;
    }

    function clearDisplay() {
        titleEl.textContent = '';
        autorEl.textContent = '';
        fechaEl.textContent = '';
        bodyEl.textContent = '';
        selectedId = null;
    }

    function showMail(id) {
        const mail_to_show = mails.find((some_mail) => some_mail.id === id);
        if (!mail_to_show) return;
        selectedId = id;
        titleEl.textContent = mail_to_show.subject;
        autorEl.textContent = `Autor: ${mail_to_show.from}`;
        fechaEl.textContent = `Fecha: ${formatDate(mail_to_show.date)}`;
        bodyEl.textContent = mail_to_show.body;
        // update visual selection
        document.querySelectorAll('.mail-entries .mail').forEach((element) => {
            element.style.transform = element.dataset.id === id ? 'scale(1.05)' : '';
        });
        
        // mark read if needed
        if (mail_to_show.status === 'new') {
            mail_to_show.status = 'read';
            // try notify server
            fetch(`/api/mails/${encodeURIComponent(mail_to_show.id)}/mark-read`, { method: 'POST', credentials: 'same-origin' }).catch(() => {});
        }

        renderList(); // refresh to reflect status/filter changes
    }

    // Delete selected mail
    async function deleteSelected() {
        if (!selectedId) return;
        const idx = mails.findIndex((m) => m.id === selectedId);
        if (idx === -1) return;
        const toDelete = mails[idx];

        // attempt server delete
        try {
            await fetch(`/api/mails/${encodeURIComponent(toDelete.id)}`, { method: 'DELETE', credentials: 'same-origin' })
                .then((rest) => {
                    if (!rest.ok) throw new Error('delete-fail');
                });
        } catch (e) {
            new Toast('El correo no pudo ser eliminado del servidor!', 5000, "toast_error");
        }

        mails.splice(idx, 1);
        selectedId = null;
        renderList();
        clearDisplay();
    }

    // Composer modal
    function openComposer(opts = {}) {
        const overlay = document.createElement('div');
        overlay.classList.add("pop_up");
        const card = document.createElement('div');
        card.classList.add("pop_card")
        card.innerHTML = `
            <form class="composer" style="display:flex;flex-direction:column;gap:.5rem;">
                <label style="font-size:.85rem">Para:<input name="to" value="${escapeAttr(opts.to||'')}" required style="width:97%;padding:.4rem;border-radius:4px;border:1px solid #444"/></label>
                <label style="font-size:.85rem">Asunto:<input name="subject" value="${escapeAttr(opts.subject||'')}" style="width:97%;padding:.4rem;border-radius:4px;border:1px solid #444"/></label>
                <textarea name="body" rows="8" style="width:95%;padding:.6rem;border-radius:4px;border:1px solid #444">${escapeHtml(opts.body||'')}</textarea>
                <div style="display:flex;gap:.5rem;justify-content:flex-end;">
                    <button type="button" data-action="cancel" class="btn delete">Cancelar</button>
                    <button type="submit" class="btn send">Enviar</button>
                </div>
            </form>
        `;
        overlay.appendChild(card);
        document.body.appendChild(overlay);

        overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => overlay.remove());

        overlay.querySelector('.composer').addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const form = ev.currentTarget;
            const formData = new FormData(form);
            const mail = {
                id: uid(),
                from: 'you', // client doesn't know logged user; backend should override
                to: formData.get('to'),
                subject: formData.get('subject') || '(sin asunto)',
                body: formData.get('body') || '',
                date: new Date().toISOString(),
                status: 'sent'
            };
            
            // close composer
            overlay.remove();
            
            // try to send to server
            try {
                await fetch('/api/mails', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mail)
                }).then((res) => {
                    if (!res.ok)
                        throw new Error('send-fail');
                    return res.json();

                }).then((data) => {
                    if (data && data.id) mail.id = data.id; // server may assign real id
                    if (data.name) mail.from = data.name; // in case server wants to override sender name
                    addMail(mail);
                })
            } catch (e) {
                // ignore errors, kept locally
                new Toast('No se pudo enviar el correo al servidor!', 3000, "toast_error");
            }
        });
    }

    function addMail(mail) {
        mails.unshift(mail);
        renderList();
    }

    function escapeAttr(s = '') {
        return String(s).replace(/"/g, '&quot;');
    }

    // Event handling
    entriesEl.addEventListener('click', (ev) => {
        const art = ev.target.closest('.mail');
        if (!art) return;
        const id = art.dataset.id;
        if (!id) return;
        showMail(id);
    });

    replyBtn && replyBtn.addEventListener('click', () => {
        if (!selectedId) return openComposer();
        const m = mails.find((x) => x.id === selectedId);
        if (!m) return;
        openComposer({ to: m.from, subject: `Re: ${m.subject}`, body: `\n\n---\n${m.body}` });
    });

    deleteBtn && deleteBtn.addEventListener('click', () => {
        if (!selectedId) return;
        if (!confirm('Eliminar correo?')) return;
        deleteSelected();
    });

    newMailBtn && newMailBtn.addEventListener('click', () => openComposer());

    tabLinks.forEach((a) => {
        a.addEventListener('click', (ev) => {
            ev.preventDefault();
            if (a.classList.contains('new')) filter = 'new';
            else if (a.classList.contains('read')) filter = 'read';
            else if (a.classList.contains('sent')) filter = 'sent';
            tabLinks.forEach((t) => t.style.boxShadow = '');
            a.style.boxShadow = '0 0 6px 2px rgba(255,255,255,0.2)';
            renderList();
            clearDisplay();
        });
    });

    // initial load
    (async function init() {
        await loadMails();
        // default highlight tab
        document.querySelector('.tab-chooser a.new')?.dispatchEvent(new Event('click'));
        renderList();
    })();
})();