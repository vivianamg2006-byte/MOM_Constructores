// main.js - Página de Inicio de MOM
// Carga dinámica de categorías desde JSON

document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
});

async function cargarCategorias() {
    const contenedor = document.getElementById('categorias-container');
    
    try {
        const response = await fetch('../data/constructores.json');
        const constructores = await response.json();
        
        const categoriasUnicas = [...new Set(constructores.map(c => c.categoria))];
        
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
        
        contenedor.innerHTML = categoriasUnicas.map(categoria => `
            <div class="categoria-card" data-categoria="${categoria}">
                <h4>${nombresCategorias[categoria] || categoria}</h4>
                <p>Profesionales en ${categoria}</p>
            </div>
        `).join('');
        
        document.querySelectorAll('.categoria-card').forEach(card => {
            card.addEventListener('click', () => {
                const categoria = card.getAttribute('data-categoria');
                window.location.href = `constructores.html?categoria=${categoria}`;
            });
        });
        
    } catch (error) {
        console.error('Error cargando categorías:', error);
        contenedor.innerHTML = '<p>Error al cargar las categorías. Verifica el archivo JSON.</p>';
    }
}