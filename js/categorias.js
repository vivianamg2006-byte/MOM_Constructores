(function () {
    const STORAGE_KEY = 'carrito_presupuesto';

    function obtenerCarrito() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }

    function guardarCarrito(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function actualizarContador() {
        const span = document.getElementById('contadorCarrito');
        if (span) {
            const total = obtenerCarrito().reduce((s, i) => s + i.metros, 0);
            span.textContent = total;
        }
    }

    function formatear(num) {
        return num.toLocaleString('es-CR');
    }

    function obtenerUnidad(item) {
        if (item.precio_m2) return '/ m²';
        if (item.precio_mL) return '/ mL';
        return '';
    }

    function obtenerPrecioBase(item) {
        return item.precio_m2 || item.precio_mL || item.precio || 0;
    }

    let datosCompletos = null;
    let categoriaActiva = null;

    async function cargarPresupuestos() {
        const res = await fetch('data/presupuestos.json');
        return res.json();
    }

    function renderizarCategorias(datos) {
        const grilla = document.getElementById('categoriasGrilla');
        if (!grilla) return;

        grilla.innerHTML = '';
        datos.categorias.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'categoria-card';
            div.dataset.categoriaId = cat.id;
            div.innerHTML = `
                <div class="categoria-icono">${cat.icono || '📦'}</div>
                <div class="categoria-nombre">${cat.nombre}</div>
                <div class="categoria-cantidad">${cat.items.length} servicio${cat.items.length !== 1 ? 's' : ''}</div>
            `;
            div.addEventListener('click', () => mostrarCatalogo(cat.id));
            grilla.appendChild(div);
        });
    }

    function mostrarCatalogo(categoriaId) {
        categoriaActiva = categoriaId;
        const cat = datosCompletos.categorias.find(c => c.id === categoriaId);
        if (!cat) return;

        document.getElementById('categoriasGrilla').style.display = 'none';
        document.getElementById('catalogoSeccion').style.display = 'block';
        document.getElementById('breadcrumbCategoria').textContent = cat.nombre;
        document.getElementById('breadcrumbCategoria').style.cursor = 'pointer';
        document.getElementById('catalogoTitulo').textContent = cat.nombre;
        document.getElementById('catalogoConstructor').textContent = 'Constructor: ' + datosCompletos.constructorNombre;

        const contenedor = document.getElementById('catalogoItems');
        contenedor.innerHTML = '';

        cat.items.forEach(item => {
            const precio = obtenerPrecioBase(item);
            const unidad = obtenerUnidad(item);
            const esPorMetro = !!(item.precio_m2 || item.precio_mL);

            const div = document.createElement('div');
            div.className = 'catalogo-item';
            div.innerHTML = `
                <div class="catalogo-img">
                    <img src="${item.imagen}" alt="${item.nombre}">
                </div>
                <div class="catalogo-body">
                    <h3>${item.nombre}</h3>
                    <p>${item.descripcion}</p>
                    <div class="catalogo-precio">₡${formatear(precio)} ${unidad}</div>
                    ${esPorMetro ? `
                    <div class="catalogo-controles">
                        <button class="btn-decremento" type="button">−</button>
                        <input type="number" class="input-metros" value="10" min="1" max="1000" step="1">
                        <button class="btn-incremento" type="button">+</button>
                        <span class="m2-label">m²</span>
                    </div>
                    <button class="btn-agregar">Agregar al presupuesto</button>
                    ` : `
                    <div class="catalogo-controles" style="visibility:hidden;height:0;margin:0;overflow:hidden;">
                        <input type="number" class="input-metros" value="1" min="1" max="100">
                    </div>
                    <button class="btn-agregar" data-fijo="1">Agregar al presupuesto</button>
                    `}
                </div>
            `;

            if (esPorMetro) {
                const input = div.querySelector('.input-metros');
                div.querySelector('.btn-decremento').addEventListener('click', () => {
                    let v = parseInt(input.value) || 1;
                    if (v > 1) input.value = v - 1;
                });
                div.querySelector('.btn-incremento').addEventListener('click', () => {
                    let v = parseInt(input.value) || 1;
                    if (v < 1000) input.value = v + 1;
                });
            }

            div.querySelector('.btn-agregar').addEventListener('click', function () {
                const cantidad = esPorMetro
                    ? (parseInt(div.querySelector('.input-metros').value) || 1)
                    : 1;
                agregarAlCarrito(item, cantidad, cat.nombre);
            });

            contenedor.appendChild(div);
        });

        window.scrollTo({ top: document.getElementById('catalogoSeccion').offsetTop - 170, behavior: 'smooth' });
    }

    function volverCategorias() {
        categoriaActiva = null;
        document.getElementById('categoriasGrilla').style.display = 'grid';
        document.getElementById('catalogoSeccion').style.display = 'none';
        window.scrollTo({ top: document.getElementById('categoriasGrilla').offsetTop - 170, behavior: 'smooth' });
    }

    function agregarAlCarrito(item, cantidad, categoriaNombre) {
        const carrito = obtenerCarrito();
        const existente = carrito.find(i => i.id === `cat_${item.id}`);
        if (existente) {
            existente.cantidad += cantidad;
        } else {
            carrito.push({
                id: `cat_${item.id}`,
                itemId: item.id,
                nombre: item.nombre,
                categoria: categoriaNombre,
                precio: obtenerPrecioBase(item),
                unidad: obtenerUnidad(item),
                cantidad: cantidad,
                esPorMetro: !!(item.precio_m2 || item.precio_mL)
            });
        }
        guardarCarrito(carrito);
        actualizarContador();

        const toast = document.getElementById('toastConfirmacion');
        if (toast) {
            const texto = cantidad > 1
                ? `Agregados ${cantidad} ${item.precio_m2 ? 'm²' : 'mL'} de ${item.nombre}`
                : `Agregado ${item.nombre} al presupuesto`;
            toast.textContent = texto;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const params = new URLSearchParams(window.location.search);
        const constructorId = params.get('constructor');

        document.getElementById('breadcrumbCategoria').addEventListener('click', volverCategorias);

        try {
            datosCompletos = await cargarPresupuestos();

            if (constructorId) {
                const constr = datosCompletos;
                document.getElementById('catalogoConstructor').textContent = 'Constructor: ' + constr.constructorNombre;
            }

            renderizarCategorias(datosCompletos);
            actualizarContador();

            const catParam = params.get('categoria');
            if (catParam && datosCompletos.categorias.find(c => c.id === catParam)) {
                mostrarCatalogo(catParam);
            }
        } catch (e) {
            const grilla = document.getElementById('categoriasGrilla');
            if (grilla) grilla.innerHTML = '<p class="no-resultados">Error al cargar categorías.</p>';
        }
    });
})();
