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

    async function cargarConstructores() {
        const res = await fetch('data/constructores.json');
        return res.json();
    }

    function renderizarConstructores(lista) {
        const contenedor = document.getElementById('constructoresLista');
        if (!contenedor) return;

        if (!lista || lista.length === 0) {
            contenedor.innerHTML = '<p class="no-resultados">No hay constructores registrados aún.</p>';
            return;
        }

        lista.forEach(c => {
            const categorias = (c.categoria || '').split(',').map(s => s.trim()).filter(Boolean);
            const estrellas = '★'.repeat(Math.floor(c.calificacion || 0)) + '☆'.repeat(5 - Math.floor(c.calificacion || 0));

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
                    <span class="constructor-estado ${(c.estado === 'Disponible' ? 'disponible' : 'ocupado')}">${c.estado || ''}</span>
                    <a href="categorias.html?constructor=${c.id}" class="btn-ver-catalogo">Ver catálogo →</a>
                </div>
            `;
            contenedor.appendChild(div);
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const lista = await cargarConstructores();
            renderizarConstructores(lista);
            actualizarContador();
        } catch (e) {
            const contenedor = document.getElementById('constructoresLista');
            if (contenedor) {
                contenedor.innerHTML = '<p class="no-resultados">Error al cargar constructores.</p>';
            }
        }
    });
})();
