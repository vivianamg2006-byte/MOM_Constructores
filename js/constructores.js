// js/constructores.js - Página de Constructores Completa
let constructoresOriginales = [];
let favoritos = [];
let carritoPresupuestos = []; // Para cumplir con la funcionalidad de "Agregar al carrito"

document.addEventListener('DOMContentLoaded', () => {
    cargarFavoritos();
    cargarCarrito();
    cargarConstructores(); // Se ejecuta después de cargar favoritos para marcar las tarjetas correctamente
    
    // Listeners de filtros dinámicos
    document.getElementById('busqueda').addEventListener('input', filtrarConstructores);
    document.getElementById('filtro-provincia').addEventListener('change', filtrarConstructores);
    document.getElementById('presupuesto-min').addEventListener('input', filtrarConstructores);
    document.getElementById('presupuesto-max').addEventListener('input', filtrarConstructores);
    
    // Listener para cerrar el modal al hacer clic en la X o fuera de él
    const modal = document.getElementById('constructor-modal');
    if (modal) {
        modal.querySelector('.close-modal').addEventListener('click', cerrarModal);
        window.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });
    }
});

async function cargarConstructores() {
    try {
        // Ajusta la ruta según tu estructura de carpetas (ej: 'data/constructores.json')
        const response = await fetch('data/constructores.json');
        constructoresOriginales = await response.json();
        
        // Verificar si venimos desde el Index con un filtro de categoría en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const categoriaSeleccionada = urlParams.get('categoria');
        
        if (categoriaSeleccionada) {
            document.getElementById('busqueda').value = categoriaSeleccionada;
            filtrarConstructores();
        } else {
            mostrarConstructores(constructoresOriginales);
        }
        
        mostrarFavoritos(); // Pintar la lista persistente al iniciar
    } catch (error) {
        console.error('Error cargando JSON:', error);
        document.getElementById('constructores-container').innerHTML = '<p>Error al cargar los constructores.</p>';
    }
}

function mostrarConstructores(constructores) {
    const contenedor = document.getElementById('constructores-container');
    
    if (constructores.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-state">
                <h3>No se encontraron constructores</h3>
                <p>Intenta con otros filtros de búsqueda.</p>
            </div>`;
        return;
    }
    
    contenedor.innerHTML = constructores.map(constructor => {
        const esFavorito = favoritos.includes(constructor.id);
        
        return `
            <article class="constructor-card" data-id="${constructor.id}">
                <span class="card-label">${esFavorito ? '⭐ Favorito' : '👍 Recomendado'}</span>
                <figure>
                    <img src="${constructor.foto}" alt="${constructor.nombre}" loading="lazy">
                    <figcaption>${constructor.especialidad}</figcaption>
                </figure>
                <div class="constructor-card-content">
                    <span class="constructor-categoria">${constructor.categoria.toUpperCase()}</span>
                    <h3>${constructor.nombre}</h3>
                    <p><strong>📍 ${constructor.provincia}</strong></p>
                    <p><strong>💰 ₡${constructor.presupuestoBase.toLocaleString()}</strong> por m²</p>
                    
                    <div class="card-actions-grid">
                        <button class="btn-card btn-ver-mas" onclick="abrirModal(${constructor.id})">🔍 Ver más</button>
                        <button class="btn-card btn-favorito" data-id="${constructor.id}">
                            ${esFavorito ? '❌ Quitar' : '⭐ Favorito'}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
    
    asignarEventosFavoritos();
}

function asignarEventosFavoritos() {
    document.querySelectorAll('.btn-favorito').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            alternarFavorito(id);
        });
    });
}

function alternarFavorito(id) {
    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(fid => fid !== id);
    } else {
        favoritos.push(id);
    }
    guardarFavoritos();
    mostrarFavoritos();
    // En lugar de volver a renderizar todo el DOM con filtrarConstructores, 
    // actualizamos estéticamente los botones de las tarjetas existentes
    actualizarBotonesFavoritos(); 
}

function filtrarConstructores() {
    const busqueda = document.getElementById('busqueda').value.toLowerCase();
    const provincia = document.getElementById('filtro-provincia').value;
    const presupuestoMin = parseInt(document.getElementById('presupuesto-min').value) || 0;
    const presupuestoMax = parseInt(document.getElementById('presupuesto-max').value) || Infinity;
    
    const filtrados = constructoresOriginales.filter(constructor => {
        const coincideBusqueda = constructor.nombre.toLowerCase().includes(busqueda) ||
                                 constructor.especialidad.toLowerCase().includes(busqueda) ||
                                 constructor.categoria.toLowerCase().includes(busqueda);
        
        const coincideProvincia = provincia === 'todas' || constructor.provincia === provincia;
        
        const coincidePresupuesto = constructor.presupuestoBase >= presupuestoMin &&
                                    constructor.presupuestoBase <= presupuestoMax;
        
        return coincideBusqueda && coincideProvincia && coincidePresupuesto;
    });
    
    mostrarConstructores(filtrados);
}

// Ventana Emergente (Modal) Requerido en Requerimientos
function abrirModal(id) {
    const constructor = constructoresOriginales.find(c => c.id === id);
    if (!constructor) return;

    const modal = document.getElementById('constructor-modal');
    
    // Construir la galería de trabajos previos dinámicamente desde el array del JSON
    const fotosPreviasHTML = constructor.trabajosPrevios && constructor.trabajosPrevios.length > 0
        ? constructor.trabajosPrevios.map(foto => `<img src="img/${foto}" alt="Trabajo previo" class="modal-galeria-img">`).join('')
        : '<p>No hay fotos disponibles de trabajos anteriores.</p>';

    // Inyectar la información en el cuerpo del modal
    document.getElementById('modal-body-content').innerHTML = `
        <div class="modal-profile">
            <img src="${constructor.foto}" alt="${constructor.nombre}" class="modal-avatar">
            <div>
                <h2>${constructor.nombre}</h2>
                <p class="especialidad-tag">${constructor.especialidad}</p>
                <p><strong>Ubicación:</strong> 📍 ${constructor.provincia}</p>
                <p><strong>Presupuesto Base:</strong> ₡${constructor.presupuestoBase.toLocaleString()} por m²</p>
                <p><strong>Contacto Directo:</strong> 📞 <a href="https://wa.me/${constructor.contacto.replace('-','')}" target="_blank">${constructor.contacto}</a></p>
            </div>
        </div>
        <div class="modal-section">
            <h3>📂 Galería de Trabajos Previos</h3>
            <div class="modal-galeria-grid">
                ${fotosPreviasHTML}
            </div>
        </div>
        <div class="modal-foot-actions">
            <button class="btn-modal-action btn-carrito" onclick="agregarAlCarrito(${constructor.id})">🛒 Agregar Presupuesto al Carrito</button>
        </div>
    `;

    modal.classList.add('modal-active');
}

function cerrarModal() {
    document.getElementById('constructor-modal').classList.remove('modal-active');
}

// LocalStorage y Sección Persistente de Favoritos
function cargarFavoritos() {
    const guardados = localStorage.getItem('mom_favoritos');
    if (guardados) favoritos = JSON.parse(guardados);
}

function guardarFavoritos() {
    localStorage.setItem('mom_favoritos', JSON.stringify(favoritos));
}

function mostrarFavoritos() {
    const contenedor = document.getElementById('favoritos-container');
    if (!contenedor) return;
    
    const constructoresFavoritos = constructoresOriginales.filter(c => favoritos.includes(c.id));
    
    if (constructoresFavoritos.length === 0) {
        contenedor.innerHTML = '<p class="no-favs-text">No tienes constructores favoritos guardados.</p>';
        return;
    }
    
    contenedor.innerHTML = constructoresFavoritos.map(c => `
        <div class="favorito-item">
            <div class="fav-info">
                <strong>${c.nombre}</strong>
                <span>${c.especialidad}</span>
            </div>
            <button class="btn-eliminar-fav" onclick="alternarFavorito(${c.id})">✖</button>
        </div>
    `).join('');
}

function actualizarBotonesFavoritos() {
    document.querySelectorAll('.constructor-card').forEach(card => {
        const id = parseInt(card.dataset.id);
        const btn = card.querySelector('.btn-favorito');
        const label = card.querySelector('.card-label');
        const esFav = favoritos.includes(id);

        if (btn) btn.textContent = esFav ? '❌ Quitar' : '⭐ Favorito';
        if (label) label.textContent = esFav ? '⭐ Favorito' : '👍 Recomendado';
    });
}

// Lógica para el Carrito de Presupuestos (LocalStorage)
function cargarCarrito() {
    const guardado = localStorage.getItem('mom_carrito');
    if (guardado) carritoPresupuestos = JSON.parse(guardado);
}

function agregarAlCarrito(id) {
    const constructor = constructoresOriginales.find(c => c.id === id);
    if (!constructor) return;

    // Verificar si ya está en el carrito para no duplicarlo
    if (carritoPresupuestos.some(item => item.id === id)) {
        alert('Este presupuesto ya se encuentra agregado en tu carrito.');
        return;
    }

    carritoPresupuestos.push({
        id: constructor.id,
        nombre: constructor.nombre,
        especialidad: constructor.especialidad,
        presupuestoBase: constructor.presupuestoBase
    });

    localStorage.setItem('mom_carrito', JSON.stringify(carritoPresupuestos));
    alert(`Presupuesto de ${constructor.nombre} agregado al carrito exitosamente.`);
    cerrarModal();
}