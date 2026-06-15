document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
});

async function cargarCategorias() {
    const contenedor = document.getElementById('categorias-container');
    
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
                <div class="cat-icono">${cat.icono || '📦'}</div>
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