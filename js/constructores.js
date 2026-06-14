// constructores.js - Página de Constructores
// Carga JSON, búsqueda, filtros, localStorage favoritos

let constructoresOriginales = [];
let favoritos = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarConstructores();
    cargarFavoritos();
    
    document.getElementById('busqueda').addEventListener('input', filtrarConstructores);
    document.getElementById('filtro-provincia').addEventListener('change', filtrarConstructores);
    document.getElementById('presupuesto-min').addEventListener('input', filtrarConstructores);
    document.getElementById('presupuesto-max').addEventListener('input', filtrarConstructores);
});

async function cargarConstructores() {
    try {
        const response = await fetch('../data/constructores.json');
        const response = await fetch('data/constructores.json');
        constructoresOriginales = await response.json();
        mostrarConstructores(constructoresOriginales);
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
    
    const estadoTexto = {
        'disponible': { texto: '✅ Disponible', clase: 'state-success' },
        'ocupado': { texto: '⏳ Ocupado', clase: 'state-warning' }
    };
    
    contenedor.innerHTML = constructores.map(constructor => {
        const estado = estadoTexto[constructor.estado] || { texto: '📋 Consultar', clase: 'state-success' };
        const esFavorito = favoritos.includes(constructor.id);
        
        return `
            <article class="constructor-card" data-id="${constructor.id}">
                <span class="card-label">${esFavorito ? '⭐ Favorito' : '👍 Recomendado'}</span>
                <figure>
                    <img src="${constructor.foto}" alt="${constructor.nombre}" loading="lazy">
                    <figcaption>${constructor.especialidad}</figcaption>
                </figure>
                <div class="constructor-card-content">
                    <span class="constructor-categoria">${constructor.categoria}</span>
                    <h3>${constructor.nombre}</h3>
                    <p><strong>📍 ${constructor.provincia}</strong></p>
                    <p><strong>💰 ₡${constructor.presupuestoBase.toLocaleString()}</strong> (base)</p>
                    <p>📞 ${constructor.contacto}</p>
                    <p>${constructor.descripcion.substring(0, 80)}...</p>
                    <p class="state-box ${estado.clase}">${estado.texto}</p>
                    <button class="btn-card btn-favorito" data-id="${constructor.id}">
                        ${esFavorito ? '❌ Quitar de favoritos' : '⭐ Guardar en favoritos'}
                    </button>
                </div>
            </article>
        `;
    }).join('');
    
    document.querySelectorAll('.btn-favorito').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            if (favoritos.includes(id)) {
                favoritos = favoritos.filter(fid => fid !== id);
            } else {
                favoritos.push(id);
            }
            guardarFavoritos();
            actualizarBotonesFavoritos();
            mostrarFavoritos();
            filtrarConstructores();
        });
    });
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

function cargarFavoritos() {
    const guardados = localStorage.getItem('mom_favoritos');
    if (guardados) {
        favoritos = JSON.parse(guardados);
    }
}

function guardarFavoritos() {
    localStorage.setItem('mom_favoritos', JSON.stringify(favoritos));
}

function actualizarBotonesFavoritos() {
    document.querySelectorAll('.btn-favorito').forEach(btn => {
        const id = parseInt(btn.dataset.id);
        if (favoritos.includes(id)) {
            btn.textContent = '❌ Quitar de favoritos';
        } else {
            btn.textContent = '⭐ Guardar en favoritos';
        }
    });
    
    document.querySelectorAll('.constructor-card').forEach(card => {
        const id = parseInt(card.dataset.id);
        const label = card.querySelector('.card-label');
        if (favoritos.includes(id)) {
            label.textContent = '⭐ Favorito';
        } else {
            label.textContent = '👍 Recomendado';
        }
    });
}

function mostrarFavoritos() {
    const contenedor = document.getElementById('favoritos-container');
    const constructoresFavoritos = constructoresOriginales.filter(c => favoritos.includes(c.id));
    
    if (constructoresFavoritos.length === 0) {
        contenedor.innerHTML = '<p>No tienes favoritos guardados.</p>';
        return;
    }
    
    contenedor.innerHTML = constructoresFavoritos.map(c => `
        <div class="favorito-item">
            <span>${c.nombre} - ${c.especialidad}</span>
            <button class="btn-eliminar" data-id="${c.id}">✖</button>
        </div>
    `).join('');
    
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            favoritos = favoritos.filter(fid => fid !== id);
            guardarFavoritos();
            mostrarFavoritos();
            filtrarConstructores();
        });
    });
}