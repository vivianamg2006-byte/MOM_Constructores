(function () {
    const STORAGE_KEY = 'carrito_presupuesto';

    function obtenerCarrito() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }

    function actualizarContador() {
        const span = document.getElementById('contadorCarrito');
        if (span) {
            const total = obtenerCarrito().reduce((s, i) => s + i.metros, 0);
            span.textContent = total;
        }
    }

    function coincide(constructor, query) {
        const q = query.toLowerCase();
        return (
            (constructor.nombre || '').toLowerCase().includes(q) ||
            (constructor.especialidad || '').toLowerCase().includes(q) ||
            (constructor.categoria || '').toLowerCase().includes(q) ||
            (constructor.provincia || '').toLowerCase().includes(q) ||
            (constructor.descripcion || '').toLowerCase().includes(q)
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
                    <img src="${c.foto || 'https://placehold.co/150x150/c0392b/white?text=' + c.nombre.charAt(0)}" alt="${c.nombre}">
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
                        ${categorias.map(cat => `<span class="tag">${cat}</span>`).join('')}
                    </div>
                </div>
                <div class="constructor-accion">
                    <button class="btn-favorito ${fav ? 'activo' : ''}" data-id="${c.id}" onclick="toggleFavorito(${c.id})">${fav
    ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
    : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'}</button>
                    <span class="constructor-estado ${(c.estado === 'Disponible' ? 'disponible' : 'ocupado')}">${c.estado || ''}</span>
                    <a href="categorias.html?constructor=${c.id}" class="btn-ver-catalogo">Ver catálogo →</a>
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

    function initRatingEstrellas() {
        document.querySelectorAll('.constructor-calificacion').forEach(container => {
            const id = container.dataset.constructorId;
            if (!id) return;

            const starsSpan = container.querySelector('.rating-stars');
            if (!starsSpan) return;

            const ratingVal = obtenerRatingConstructor(id);

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

            const modal = document.createElement('div');
            modal.className = 'rating-modal';
            modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:3000;justify-content:center;align-items:center;';
            modal.innerHTML = `
                <div style="background:white;padding:28px;border-radius:16px;text-align:center;min-width:260px;box-shadow:0 10px 30px rgba(0,0,0,0.3);">
                    <h3 style="color:#c0392b;margin-bottom:16px;font-size:1.1rem;">Califica a este constructor</h3>
                    <div class="rating-select" style="display:flex;gap:6px;justify-content:center;margin-bottom:16px;">
                        ${[1,2,3,4,5].map(v => `<button data-val="${v}" style="background:none;border:none;font-size:2.2rem;cursor:pointer;color:${v <= Math.round(ratingVal) ? '#f1c40f' : '#ddd'};transition:color 0.15s;padding:0 3px;">★</button>`).join('')}
                    </div>
                    <button class="btn-rating-cerrar" style="background:#c0392b;color:white;border:none;padding:8px 24px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:0.9rem;">Cerrar</button>
                </div>
            `;
            document.body.appendChild(modal);

            starsSpan.addEventListener('click', function(e) {
                e.stopPropagation();
                modal.style.display = 'flex';
            });

            const selectDiv = modal.querySelector('.rating-select');
            selectDiv.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', function() {
                    const val = parseInt(this.dataset.val);
                    guardarRatingConstructor(id, val);
                    renderStars(val);
                    modal.style.display = 'none';
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

            selectDiv.addEventListener('mouseleave', function() {
                const current = obtenerRatingConstructor(id);
                selectDiv.querySelectorAll('button').forEach(b => {
                    b.style.color = parseInt(b.dataset.val) <= Math.round(current) ? '#f1c40f' : '#ddd';
                });
            });

            modal.querySelector('.btn-rating-cerrar').addEventListener('click', function() {
                modal.style.display = 'none';
            });

            modal.addEventListener('click', function(e) {
                if (e.target === modal) modal.style.display = 'none';
            });
        });
    }
})();
