let todosLosConstructores = [];
const constructoresReady = fetch('data/constructores.json')
    .then(r => r.json())
    .then(data => { todosLosConstructores = data; })
    .catch(e => console.error('Error cargando constructores:', e));

function getUserId() {
    try {
        const s = JSON.parse(localStorage.getItem('mom_sesion') || '{}');
        return s.id ? 'user_' + s.id : 'guest';
    } catch { return 'guest'; }
}

function obtenerFavoritos() {
    return JSON.parse(localStorage.getItem('mom_favoritos_' + getUserId()) || '[]');
}

function guardarFavoritos(lista) {
    localStorage.setItem('mom_favoritos_' + getUserId(), JSON.stringify(lista));
}

function esFavorito(id) {
    return obtenerFavoritos().some(f => f.id === id);
}

function actualizarBadgeFav() {
    const badge = document.getElementById('favBadge');
    if (!badge) return;
    const favs = obtenerFavoritos();
    if (favs.length) {
        badge.textContent = favs.length;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function toggleFavorito(id) {
    let favs = obtenerFavoritos();
    const idx = favs.findIndex(f => f.id === id);
    if (idx > -1) {
        favs.splice(idx, 1);
    } else {
        const c = todosLosConstructores.find(c => c.id === id);
        if (c) favs.push(c);
    }
    guardarFavoritos(favs);
    actualizarBadgeFav();

    const btn = document.querySelector(`.btn-favorito[data-id="${id}"]`);
    if (btn) {
        btn.classList.toggle('activo');
        btn.textContent = esFavorito(id) ? '♥' : '♡';
    }
}

function actualizarModalFavoritos() {
    const contenedor = document.getElementById('favoritosLista');
    const vacio = document.getElementById('favVacio');
    if (!contenedor || !vacio) return;

    const favs = obtenerFavoritos();

    if (!favs.length) {
        contenedor.innerHTML = '';
        vacio.style.display = 'block';
        return;
    }

    vacio.style.display = 'none';
    contenedor.innerHTML = favs.map(c => `
        <div class="favorito-item">
            <a href="constructores.html?id=${c.id}" class="fav-link">${c.nombre}</a>
            <button class="btn-eliminar-fav" onclick="toggleFavorito(${c.id})">&times;</button>
        </div>
    `).join('');
}

window.toggleFavorito = toggleFavorito;
window.actualizarModalFavoritos = actualizarModalFavoritos;

document.addEventListener('DOMContentLoaded', () => {
    actualizarBadgeFav();
    cargarCategorias();
});

async function cargarCategorias() {
    const contenedor = document.getElementById('categorias-container');
    if (!contenedor) return;

    try {
        const response = await fetch('json/presupuestos.json');
        const datos = await response.json();
        const categorias = datos.categorias || [];

        if (categorias.length === 0) {
            contenedor.innerHTML = '<p>No hay categorías disponibles</p>';
            return;
        }

        contenedor.innerHTML = categorias.map(cat => `
            <div class="categoria-card" data-categoria="${cat.id}">
                <div class="cat-icono">${cat.icono || ''}</div>
                <h4>${cat.nombre}</h4>
                <p>${cat.items.length} servicio${cat.items.length !== 1 ? 's' : ''}</p>
            </div>
        `).join('');

        document.querySelectorAll('.categoria-card').forEach(card => {
            card.addEventListener('click', () => {
                const categoria = card.getAttribute('data-categoria');
                window.location.href = `categorias.html?categoria=${categoria}`;
            });
        });

    } catch (error) {
        console.error('Error cargando categorías:', error);
        if (contenedor) {
            contenedor.innerHTML = '<p>Error al cargar las categorías.</p>';
        }
    }
}
