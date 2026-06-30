// constructores.js — Listado y tarjetas de constructores
// Renderiza cards con datos, favoritos, calificación por estrellas y enlaces a catálogo/galería.
// Las calificaciones se persisten en localStorage bajo la clave 'mom_ratings'.
(function () {
    const STORAGE_KEY = 'carrito_presupuesto';

    function obtenerCarrito() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }

    function actualizarContador() {
        const span = document.getElementById('contadorCarrito');
        if (span) {
            const total = obtenerCarrito().reduce((s, i) => s + i.cantidad, 0);
            span.textContent = total;
        }
    }
function normalizar(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function coincide(constructor, query) {
    const q = normalizar(query);
    return (
        normalizar(constructor.nombre).includes(q) ||
        normalizar(constructor.especialidad).includes(q) ||
        normalizar(constructor.categoria).includes(q) ||
        normalizar(constructor.provincia).includes(q) ||
        normalizar(constructor.descripcion).includes(q)
    );
}

    function renderizarConstructores(lista) {
        const contenedor = document.getElementById('constructoresLista');
        if (!contenedor) return;

        if (!lista || lista.length === 0) {
            contenedor.innerHTML = '<p class="no-resultados">No hay constructores registrados aún.</p>';
            return;
        }

        contenedor.innerHTML = '';

        function capitalizar(str) {
            return str.split(/[_\s]+/).map(function(p) {
                return p.charAt(0).toUpperCase() + p.slice(1);
            }).join(' ');
        }

        lista.forEach(c => {
            const categorias = (c.categoria || '').split(',').map(s => s.trim()).filter(Boolean);
            const ratingVal = obtenerRatingConstructor(c.id);
            const estrellasLlenas = '★'.repeat(Math.round(ratingVal));
            const estrellasVacias = '☆'.repeat(5 - Math.round(ratingVal));
            const fav = esFavorito(c.id);

            const div = document.createElement('div');
            div.className = 'constructor-card';
            div.innerHTML = `
                <div class="constructor-foto">
                    <img src="${c.foto || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 150'%3E%3Crect fill='%23c0392b' width='150' height='150'/%3E%3Ctext x='75' y='92' text-anchor='middle' fill='white' font-size='68' font-weight='bold' font-family='sans-serif'%3E" + encodeURIComponent(c.nombre.charAt(0)) + "%3C/text%3E%3C/svg%3E"}" alt="${c.nombre}">
                </div>
                <div class="constructor-info">
                    <h3>${c.nombre}</h3>
                    <div class="constructor-calificacion" data-constructor-id="${c.id}">
                        <span class="rating-stars">${estrellasLlenas}${estrellasVacias}</span>
                        <span class="rating-num">${ratingVal > 0 ? ratingVal.toFixed(1) : 'Sin calificar'}</span>
                    </div>
                    <p class="constructor-desc">${c.descripcion || ''}</p>
                    <p class="constructor-detalle"><strong>Especialidad:</strong> ${c.especialidad || ''}</p>
                    <p class="constructor-detalle"><strong>Provincia:</strong> ${c.provincia || ''}</p>
                    <p class="constructor-detalle"><strong>Contacto:</strong> ${c.contacto || ''}</p>
                    <div class="constructor-tags">
                        ${categorias.map(cat => `<span class="tag">${capitalizar(cat)}</span>`).join('')}
                    </div>
                </div>
                <div class="constructor-accion">
                    <button class="btn-favorito ${fav ? 'activo' : ''}" data-id="${c.id}" onclick="toggleFavorito(${c.id})">${fav
    ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
    : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'}</button>
                    <span class="constructor-estado ${(c.estado === 'Disponible' ? 'disponible' : 'ocupado')}">${c.estado || ''}</span>
                    ${(c.whatsapp || c.contacto) ? `<a href="https://wa.me/${(c.whatsapp || c.contacto).replace(/[^0-9]/g,'')}?text=Hola%2C%20me%20gustar%C3%ADa%20contratar%20un%20servicio." target="_blank" class="btn-whatsapp-const" title="Contactar por WhatsApp">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        WhatsApp
                    </a>` : ''}
                    <a href="categorias.html?constructor=${c.id}" class="btn-ver-catalogo">Ver catálogo →</a>
                    <button type="button" class="btn-galeria" data-id="${c.id}" data-nombre="${c.nombre}">Galería de trabajos</button>
                </div>
            `;
            contenedor.appendChild(div);
        });

        initRatingEstrellas();
    }

    function filtrarPorQuery(query) {
        if (!query) {
            renderizarConstructores(todosLosConstructores);
            return;
        }
        const filtrados = todosLosConstructores.filter(c => coincide(c, query));
        renderizarConstructores(filtrados);
    }

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            await constructoresReady;

            const params = new URLSearchParams(window.location.search);
            const query = params.get('buscar') || '';
            const idParam = params.get('id');

            if (idParam) {
                // Modo "vista individual": muestra solo un constructor
                const c = todosLosConstructores.find(c => c.id == idParam);
                if (c) {
                    renderizarConstructores([c]);
                    const headerInput = document.getElementById('searchInput');
                    if (headerInput) headerInput.value = c.nombre;
                }
                actualizarContador();
                return;
            }

            const headerInput = document.getElementById('searchInput');
            if (headerInput && query) {
                headerInput.value = query;
            }

            filtrarPorQuery(query);
            actualizarContador();
        } catch (e) {
            const contenedor = document.getElementById('constructoresLista');
            if (contenedor) {
                contenedor.innerHTML = '<p class="no-resultados">Error al cargar constructores.</p>';
            }
        }
    });

    function obtenerRatingConstructor(id) {
        try {
            const ratings = JSON.parse(localStorage.getItem('mom_ratings') || '{}');
            return ratings[id] || 0;
        } catch { return 0; }
    }

    function guardarRatingConstructor(id, valor) {
        try {
            const ratings = JSON.parse(localStorage.getItem('mom_ratings') || '{}');
            ratings[id] = valor;
            localStorage.setItem('mom_ratings', JSON.stringify(ratings));
        } catch {}
    }

    // initRatingEstrellas — Agrega un modal flotante a cada tarjeta para calificar.
    function initRatingEstrellas() {
        // Elimina modales previos para evitar duplicados al re-renderizar
        document.querySelectorAll('.rating-modal').forEach(m => m.remove());

        document.querySelectorAll('.constructor-calificacion').forEach(container => {
            const id = container.dataset.constructorId;
            if (!id) return;

            const starsSpan = container.querySelector('.rating-stars');
            if (!starsSpan) return;

            const ratingVal = obtenerRatingConstructor(id);

            // Actualiza la visualización de estrellas y el texto numérico
            function renderStars(valor) {
                const llenas = '★'.repeat(Math.round(valor));
                const vacias = '☆'.repeat(5 - Math.round(valor));
                starsSpan.textContent = llenas + vacias;
                const numSpan = container.querySelector('.rating-num');
                if (numSpan) {
                    numSpan.textContent = valor > 0 ? valor.toFixed(1) : 'Sin calificar';
                }
            }

            starsSpan.style.cursor = 'pointer';
            starsSpan.title = 'Haz clic para calificar';

            // Crea el modal de calificación con 5 botones de estrella
            const modal = document.createElement('div');
            modal.className = 'rating-modal';
            modal.innerHTML = `
                <div class="rating-modal-box">
                    <h3 class="rating-modal-title">Califica a este constructor</h3>
                    <div class="rating-select">
                        ${[1,2,3,4,5].map(v => `<button data-val="${v}" class="rating-star-btn" style="color:${v <= Math.round(ratingVal) ? '#f1c40f' : '#ddd'};">★</button>`).join('')}
                    </div>
                    <button class="btn-rating-cerrar">Cerrar</button>
                </div>
            `;
            document.body.appendChild(modal);

            // Abre el modal al hacer clic en las estrellas
            starsSpan.addEventListener('click', function(e) {
                e.stopPropagation();
                modal.classList.add('open');
            });

            // Maneja clics y hover en cada botón de estrella
            const selectDiv = modal.querySelector('.rating-select');
            selectDiv.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', function() {
                    const val = parseInt(this.dataset.val);
                    guardarRatingConstructor(id, val);
                    renderStars(val);
                    modal.classList.remove('open');
                    selectDiv.querySelectorAll('button').forEach(b => {
                        b.style.color = parseInt(b.dataset.val) <= val ? '#f1c40f' : '#ddd';
                    });
                });
                btn.addEventListener('mouseenter', function() {
                    const val = parseInt(this.dataset.val);
                    selectDiv.querySelectorAll('button').forEach(b => {
                        b.style.color = parseInt(b.dataset.val) <= val ? '#f1c40f' : '#ddd';
                    });
                });
            });

            // Al salir del área de selección, restaura el color según la calificación guardada
            selectDiv.addEventListener('mouseleave', function() {
                const current = obtenerRatingConstructor(id);
                selectDiv.querySelectorAll('button').forEach(b => {
                    b.style.color = parseInt(b.dataset.val) <= Math.round(current) ? '#f1c40f' : '#ddd';
                });
            });

            // Cierra el modal con el botón "Cerrar" o clic en el fondo
            modal.querySelector('.btn-rating-cerrar').addEventListener('click', function() {
                modal.classList.remove('open');
            });

            modal.addEventListener('click', function(e) {
                if (e.target === modal) modal.classList.remove('open');
            });
        });
    }
})();
