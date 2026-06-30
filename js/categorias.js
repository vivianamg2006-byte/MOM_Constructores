// categorias.js — Catálogo de servicios por constructor
// Muestra categorías, items y control de cantidades (m², mL, unidades).
// El carrito se persiste en localStorage bajo la clave 'carrito_presupuesto'.
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
            const total = obtenerCarrito().reduce((s, i) => s + i.cantidad, 0);
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
    let constructorActivo = null;

    function normalizarCat(nombre) {
        return nombre.toLowerCase().trim().replace(/\s+/g, '_')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function obtenerCategoriasConstructor(c) {
        if (!c || !c.categoria) return [];
        return c.categoria.split(',').map(s => normalizarCat(s)).filter(Boolean);
    }

    // Renderiza chips de selección de constructor (favoritos al inicio)
    function renderizarSelectorConstructores() {
        const contenedor = document.getElementById('selectorConstructores');
        if (!contenedor || !todosLosConstructores) return;

        const favs = typeof obtenerFavoritos === 'function' ? obtenerFavoritos() : [];
        const idsFav = new Set(favs.map(f => f.id));

        const ordenados = [...todosLosConstructores].sort((a, b) => {
            const aFav = idsFav.has(a.id) ? 0 : 1;
            const bFav = idsFav.has(b.id) ? 0 : 1;
            if (aFav !== bFav) return aFav - bFav;
            return (a.nombre || '').localeCompare(b.nombre || '');
        });

        let html = '';

        const favsList = ordenados.filter(c => idsFav.has(c.id));
        if (favsList.length > 0) {
            html += '<div class="fav-section"><span class="fav-label">⭐ Mis favoritos</span><div class="constructor-chips">';
            favsList.forEach(c => {
                const inicial = c.nombre ? c.nombre.charAt(0).toUpperCase() : '?';
                const foto = c.foto || "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 40 40%27%3E%3Crect fill=%27%23c0392b%27 width=%2740%27 height=%2740%27/%3E%3Ctext x=%2720%27 y=%2726%27 text-anchor=%27middle%27 fill=%27white%27 font-size=%2718%27 font-weight=%27bold%27 font-family=%27sans-serif%27%3E" + encodeURIComponent(inicial) + "%3C/text%3E%3C/svg%3E";
                const activo = constructorActivo && constructorActivo.id === c.id;
                html += `<button class="chip-constructor ${activo ? 'activo' : ''}" data-id="${c.id}">
                    <img src="${foto}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 40 40%27%3E%3Crect fill=%27%23c0392b%27 width=%2740%27 height=%2740%27/%3E%3Ctext x=%2720%27 y=%2726%27 text-anchor=%27middle%27 fill=%27white%27 font-size=%2718%27 font-weight=%27bold%27 font-family=%27sans-serif%27%3E${inicial}%3C/text%3E%3C/svg%3E'">
                    <span>${c.nombre}</span>
                </button>`;
            });
            html += '</div></div>';
        }

        html += '<div class="todos-section"><span class="fav-label">Todos los constructores</span><div class="constructor-chips">';
        ordenados.forEach(c => {
            const inicial = c.nombre ? c.nombre.charAt(0).toUpperCase() : '?';
            const foto = c.foto || "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 40 40%27%3E%3Crect fill=%27%23c0392b%27 width=%2740%27 height=%2740%27/%3E%3Ctext x=%2720%27 y=%2726%27 text-anchor=%27middle%27 fill=%27white%27 font-size=%2718%27 font-weight=%27bold%27 font-family=%27sans-serif%27%3E" + encodeURIComponent(inicial) + "%3C/text%3E%3C/svg%3E";
            const activo = constructorActivo && constructorActivo.id === c.id;
            html += `<button class="chip-constructor ${activo ? 'activo' : ''}" data-id="${c.id}">
                <img src="${foto}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 40 40%27%3E%3Crect fill=%27%23c0392b%27 width=%2740%27 height=%2740%27/%3E%3Ctext x=%2720%27 y=%2726%27 text-anchor=%27middle%27 fill=%27white%27 font-size=%2718%27 font-weight=%27bold%27 font-family=%27sans-serif%27%3E${inicial}%3C/text%3E%3C/svg%3E'">
                <span>${c.nombre}</span>
            </button>`;
        });
        html += '</div></div>';

        contenedor.innerHTML = html;

        contenedor.querySelectorAll('.chip-constructor').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const c = todosLosConstructores.find(c => c.id === id);
                if (c) seleccionarConstructor(c);
            });
        });
    }

    function seleccionarConstructor(c) {
        constructorActivo = c;
        categoriaActiva = null;

        const url = new URL(window.location);
        url.searchParams.set('constructor', c.id);
        window.history.pushState({}, '', url);

        const header = document.getElementById('catalogoConstructor');
        if (header) header.textContent = 'Servicios de ' + c.nombre;

        document.getElementById('categoriasGrilla').style.display = 'grid';
        document.getElementById('catalogoSeccion').style.display = 'none';
        document.getElementById('breadcrumbCategoria').textContent = 'Categorías';

        renderizarSelectorConstructores();
        renderizarCategorias(datosCompletos);
    }

    function cargarPresupuestos() {
        return fetchJSON('data/presupuestos.json');
    }

    function renderizarCategorias(datos) {
        const grilla = document.getElementById('categoriasGrilla');
        if (!grilla) return;

        let catsPermitidas = null;
        if (constructorActivo) {
            catsPermitidas = new Set(obtenerCategoriasConstructor(constructorActivo));
        }

        grilla.innerHTML = '';
        const cats = constructorActivo
            ? datos.categorias.filter(cat => catsPermitidas.has(cat.id))
            : datos.categorias;

        if (cats.length === 0) {
            grilla.innerHTML = '<p class="no-resultados">Este constructor no tiene categorías disponibles.</p>';
            return;
        }

        cats.forEach(cat => {
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

    // Muestra el catálogo de items de una categoría
    function mostrarCatalogo(categoriaId) {
        categoriaActiva = categoriaId;
        const cat = datosCompletos.categorias.find(c => c.id === categoriaId);
        if (!cat) return;

        document.getElementById('categoriasGrilla').style.display = 'none';
        document.getElementById('catalogoSeccion').style.display = 'block';
        document.getElementById('breadcrumbCategoria').textContent = cat.nombre;
        document.getElementById('breadcrumbCategoria').style.cursor = 'pointer';
        document.getElementById('catalogoTitulo').textContent = cat.nombre;
        document.getElementById('catalogoConstructorLabel').textContent = 'Constructor: ' + (constructorActivo ? constructorActivo.nombre : '');

        const contenedor = document.getElementById('catalogoItems');
        contenedor.innerHTML = '';

        cat.items.forEach(item => {
            const precio = obtenerPrecioBase(item);
            const unidad = obtenerUnidad(item);
            const esPorMetro = !!(item.precio_m2 || item.precio_mL);

            const unidLabel = esPorMetro ? (item.precio_mL ? 'mL' : 'm²') : 'unidad';

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
                    <div class="catalogo-controles">
                        <button class="btn-decremento" type="button">−</button>
                        <input type="number" class="input-metros" value="1" min="1" max="${esPorMetro ? 1000 : 100}">
                        <button class="btn-incremento" type="button">+</button>
                        <span class="m2-label">${unidLabel}</span>
                    </div>
                    <button class="btn-agregar">Agregar al presupuesto</button>
                </div>
            `;

            const input = div.querySelector('.input-metros');
            div.querySelector('.btn-decremento').addEventListener('click', () => {
                let v = parseInt(input.value) || 1;
                if (v > 1) input.value = v - 1;
            });
            div.querySelector('.btn-incremento').addEventListener('click', () => {
                let v = parseInt(input.value) || 1;
                const max = esPorMetro ? 1000 : 100;
                if (v < max) input.value = v + 1;
            });

            div.querySelector('.btn-agregar').addEventListener('click', function () {
                const cantidad = parseInt(div.querySelector('.input-metros').value) || 1;
                agregarAlCarrito(item, cantidad, cat.nombre);
            });

            contenedor.appendChild(div);
        });

        window.scrollTo({ top: document.getElementById('catalogoSeccion').offsetTop - 170, behavior: 'smooth' });
    }

    window.volverCategorias = function () {
        categoriaActiva = null;
        document.getElementById('categoriasGrilla').style.display = 'grid';
        document.getElementById('catalogoSeccion').style.display = 'none';
        window.scrollTo({ top: document.getElementById('categoriasGrilla').offsetTop - 170, behavior: 'smooth' });
    };

    function agregarAlCarrito(item, cantidad, categoriaNombre) {
        const sesion = JSON.parse(localStorage.getItem('mom_sesion') || 'null');
        if (!sesion) {
            const toast = document.getElementById('toastConfirmacion');
            if (toast) {
                toast.textContent = 'Debes iniciar sesión o registrarte para agregar al presupuesto.';
                toast.style.background = '#c0392b';
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                    toast.style.background = '';
                }, 3000);
            }
            setTimeout(function() { window.location.href = 'login.html'; }, 1200);
            return;
        }
        const carrito = obtenerCarrito();
        const constructorId = constructorActivo ? constructorActivo.id : null;
        const constructorNombre = constructorActivo ? constructorActivo.nombre : '';
        const existente = carrito.find(i => i.id === `cat_${item.id}` && i.constructorId === constructorId);
        if (existente) {
            existente.cantidad += cantidad;
        } else {
            carrito.push({
                id: `cat_${item.id}`,
                itemId: item.id,
                constructorId: constructorId,
                constructorNombre: constructorNombre,
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
                    ? `Agregados ${cantidad} ${item.precio_m2 ? 'm²' : (item.precio_mL ? 'mL' : '')} de ${item.nombre}`
                : `Agregado ${item.nombre} al presupuesto`;
            toast.textContent = texto;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await constructoresReady;

        const params = new URLSearchParams(window.location.search);
        const constructorId = params.get('constructor');

        document.getElementById('breadcrumbCategoria').addEventListener('click', volverCategorias);

        try {
            datosCompletos = await cargarPresupuestos();

            if (constructorId) {
                const c = todosLosConstructores.find(c => c.id == constructorId);
                if (c) {
                    constructorActivo = c;
                    const header = document.getElementById('catalogoConstructor');
                    if (header) header.textContent = 'Servicios de ' + c.nombre;
                }
            }

            renderizarSelectorConstructores();
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
