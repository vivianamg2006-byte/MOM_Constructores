// Lista global de todos los constructores cargados desde el JSON
let todosLosConstructores = [];
// Promesa que precarga los constructores al iniciar la aplicación
const constructoresReady = fetch('data/constructores.json')
    .then(r => r.json())
    .then(data => { todosLosConstructores = data; })
    .catch(e => console.error('Error cargando constructores:', e));

// Obtiene el ID único del usuario desde la sesión en localStorage; devuelve 'guest' si no hay sesión
function getUserId() {
    try {
        const s = JSON.parse(localStorage.getItem('mom_sesion') || '{}');
        return s.id ? 'user_' + s.id : 'guest';
    } catch { return 'guest'; }
}

// Recupera el arreglo de favoritos del usuario desde localStorage
function obtenerFavoritos() {
    return JSON.parse(localStorage.getItem('mom_favoritos_' + getUserId()) || '[]');
}

// Persiste el arreglo de favoritos del usuario en localStorage
function guardarFavoritos(lista) {
    localStorage.setItem('mom_favoritos_' + getUserId(), JSON.stringify(lista));
}

// Retorna true si el constructor con el ID dado está en favoritos
function esFavorito(id) {
    return obtenerFavoritos().some(f => f.id === id);
}

// Actualiza el badge del menú con la cantidad de favoritos (oculta si está vacío)
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

// Agrega o elimina un constructor de favoritos y actualiza el botón y el badge
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

    // Actualiza el estado visual del botón de favorito
    const btn = document.querySelector(`.btn-favorito[data-id="${id}"]`);
    if (btn) {
        btn.classList.toggle('activo');
        btn.innerHTML = esFavorito(id)
            ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
            : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    }
}

// Renderiza la lista de favoritos dentro del modal o muestra mensaje vacío
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

// Expone funciones al ámbito global para usarlas desde el HTML
window.toggleFavorito = toggleFavorito;
window.actualizarModalFavoritos = actualizarModalFavoritos;

// Al cargar el DOM, actualiza el badge de favoritos y carga las categorías
document.addEventListener('DOMContentLoaded', () => {
    actualizarBadgeFav();
    cargarCategorias();
});

// Carga las categorías de servicios desde presupuestos.json y renderiza tarjetas clickeables
async function cargarCategorias() {
    const contenedor = document.getElementById('categorias-container');
    if (!contenedor) return;

    try {
        const response = await fetch('data/presupuestos.json');
        const datos = await response.json();
        const categorias = datos.categorias || [];

        if (categorias.length === 0) {
            contenedor.innerHTML = '<p>No hay categorías disponibles</p>';
            return;
        }

        // Renderiza cada categoría como una tarjeta
        contenedor.innerHTML = categorias.map(cat => `
            <div class="categoria-card" data-categoria="${cat.id}">
                <div class="cat-icono">${cat.icono || ''}</div>
                <h4>${cat.nombre}</h4>
                <p>${cat.items.length} servicio${cat.items.length !== 1 ? 's' : ''}</p>
            </div>
        `).join('');

        // Asigna evento de clic a cada tarjeta para redirigir a la página de categoría
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
