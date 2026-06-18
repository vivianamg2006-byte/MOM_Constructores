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
            const estrellas = '★'.repeat(Math.floor(c.calificacion || 0)) + '☆'.repeat(5 - Math.floor(c.calificacion || 0));
            const fav = esFavorito(c.id);

            const div = document.createElement('div');
            div.className = 'constructor-card';
            div.innerHTML = `
                <div class="constructor-foto">
                    <img src="${c.foto || 'https://placehold.co/150x150/c0392b/white?text=' + c.nombre.charAt(0)}" alt="${c.nombre}">
                </div>
                <div class="constructor-info">
                    <h3>${c.nombre}</h3>
                    <div class="constructor-calificacion">${estrellas} <span>${c.calificacion || 0}</span></div>
                    <p class="constructor-desc">${c.descripcion || ''}</p>
                    <p class="constructor-detalle"><strong>Especialidad:</strong> ${c.especialidad || ''}</p>
                    <p class="constructor-detalle"><strong>Provincia:</strong> ${c.provincia || ''}</p>
                    <p class="constructor-detalle"><strong>Contacto:</strong> ${c.contacto || ''}</p>
                    <div class="constructor-tags">
                        ${categorias.map(cat => `<span class="tag">${cat}</span>`).join('')}
                    </div>
                </div>
                <div class="constructor-accion">
                    <button class="btn-favorito ${fav ? 'activo' : ''}" data-id="${c.id}" onclick="toggleFavorito(${c.id})">${fav ? '♥' : '♡'}</button>
                    <span class="constructor-estado ${(c.estado === 'Disponible' ? 'disponible' : 'ocupado')}">${c.estado || ''}</span>
                    <a href="categorias.html?constructor=${c.id}" class="btn-ver-catalogo">Ver catálogo →</a>
                </div>
            `;
            contenedor.appendChild(div);
        });
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
})();
