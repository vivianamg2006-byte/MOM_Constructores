// js/main.js - Página de Inicio de MOM
// Carga dinámica de categorías desde el JSON

document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
});

async function cargarCategorias() {
    const contenedor = document.getElementById('categorias-container');
    
    try {
        // Usamos la ruta correcta desde la raíz donde corre el index
        const response = await fetch('data/constructores.json');
        const constructores = await response.json();
        
        // Obtener las categorías únicas del JSON
        const categoriasUnicas = [...new Set(constructores.map(c => c.categoria))];
        
        // Mapeo estético de nombres de categorías
        const nombresCategorias = {
            'construccion': 'Construcción',
            'electricidad': 'Electricistas',
            'pintura': 'Pintores',
            'soldadura': 'Soldadores',
            'fontaneria': 'Fontaneros',
            'arquitectura': 'Arquitectos',
            'techos': 'Techistas',
            'acabados': 'Acabados',
            'jardineria': 'Jardinería',
            'metal': 'Estructuras metálicas'
        };
        
        if (categoriasUnicas.length === 0) {
            contenedor.innerHTML = '<p>No hay categorías disponibles</p>';
            return;
        }
        
        // Inyectar las tarjetas dinámicamente en el contenedor
        contenedor.innerHTML = categoriasUnicas.map(categoria => `
            <div class="categoria-card" data-categoria="${categoria}">
                <h4>${nombresCategorias[categoria] || categoria}</h4>
                <p>Profesionales en ${categoria}</p>
            </div>
        `).join('');
        
        // Agregar eventos de clic para redirigir con el filtro activo
        document.querySelectorAll('.categoria-card').forEach(card => {
            card.addEventListener('click', () => {
                const categoria = card.getAttribute('data-categoria');
                window.location.href = `constructores.html?categoria=${categoria}`;
            });
        });
        
    } catch (error) {
        console.error('Error cargando categorías:', error);
        if (contenedor) {
            contenedor.innerHTML = '<p>Error al cargar las categorías. Verifica el archivo JSON.</p>';
        }
    }
}