// IIFE: encapsula el módulo del carrito
(function () {
    // Clave para guardar/leer el carrito desde localStorage
    const STORAGE_KEY = 'carrito_presupuesto';

    // Obtiene el carrito del localStorage
    function obtenerCarrito() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }

    // Guarda el carrito en localStorage
    function guardarCarrito(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    // Formatea un número a moneda local (CRC)
    function formatear(num) {
        return num.toLocaleString('es-CR');
    }

    // Renderiza el contenido del carrito en el DOM
    function renderizarCarrito() {
        const items = obtenerCarrito();
        const contenedor = document.getElementById('itemsCarrito');
        const vacio = document.getElementById('carritoVacio');
        const resumen = document.getElementById('resumen');
        const contador = document.getElementById('contadorCarrito');

        if (contador) {
            const total = items.reduce((s, i) => s + i.cantidad, 0);
            contador.textContent = total;
        }

        if (items.length === 0) {
            if (vacio) vacio.style.display = 'block';
            if (contenedor) contenedor.style.display = 'none';
            if (resumen) resumen.style.display = 'none';
            return;
        }

        if (vacio) vacio.style.display = 'none';
        if (contenedor) contenedor.style.display = 'block';
        if (resumen) resumen.style.display = 'block';

        contenedor.innerHTML = '';
        let totalCantidad = 0;
        let totalPrecio = 0;

        // Agrupa los items por constructor
        const grupos = {};
        items.forEach((item, index) => {
            const key = item.constructorId || 'sin_constructor';
            if (!grupos[key]) {
                grupos[key] = { nombre: item.constructorNombre || 'Sin constructor', items: [] };
            }
            grupos[key].items.push({ item, index });
        });

        const gruposHtml = [];
        for (const key in grupos) {
            const grupo = grupos[key];
            let html = `<div class="grupo-carrito">`;
            if (key !== 'sin_constructor') {
                html += `<div class="grupo-carrito-header">${grupo.nombre}</div>`;
            }
            // Genera el HTML para cada item del grupo
            grupo.items.forEach(({ item, index }) => {
                const subtotal = item.cantidad * item.precio;
                totalCantidad += item.cantidad;
                totalPrecio += subtotal;

                const unidadLabel = item.esPorMetro
                    ? (item.unidad === '/ mL' ? 'mL' : 'm²')
                    : 'unidad';

                html += `
                    <div class="item-carrito">
                        <div class="item-carrito-info">
                            <div class="item-carrito-nombre">${item.nombre}</div>
                            <div class="item-carrito-precio">
                                ₡${formatear(item.precio)} ${item.unidad}
                                ${item.categoria ? '<span class="item-carrito-categoria"> · ' + item.categoria + '</span>' : ''}
                            </div>
                        </div>
                        <div class="item-carrito-cantidad">
                            <button class="btn-cambio" data-index="${index}" data-cambio="-1">−</button>
                            <input type="number" class="input-metros-item" value="${item.cantidad}" min="1" max="1000" data-index="${index}">
                            <button class="btn-cambio" data-index="${index}" data-cambio="1">+</button>
                            <span class="m2-label">${unidadLabel}</span>
                        </div>
                        <div class="item-carrito-subtotal">
                            ₡${formatear(subtotal)}
                        </div>
                        <button class="btn-eliminar" data-index="${index}">&times;</button>
                    </div>
                `;
            });
            html += '</div>';
            gruposHtml.push(html);
        }

        contenedor.innerHTML = gruposHtml.join('');

        // Actualiza los totales en el DOM
        document.getElementById('totalMetros').textContent = formatear(totalCantidad);
        document.getElementById('totalPrecio').textContent = formatear(totalPrecio);

        // Event listeners para botones de cambio de cantidad (+/−)
        document.querySelectorAll('.btn-cambio').forEach(btn => {
            btn.addEventListener('click', function () {
                const idx = parseInt(this.dataset.index);
                const cambio = parseInt(this.dataset.cambio);
                const items = obtenerCarrito();
                items[idx].cantidad = Math.max(1, items[idx].cantidad + cambio);
                guardarCarrito(items);
                renderizarCarrito();
            });
        });

        // Event listeners para cambio manual de cantidad en input
        document.querySelectorAll('.input-metros-item').forEach(input => {
            input.addEventListener('change', function () {
                const idx = parseInt(this.dataset.index);
                let v = parseInt(this.value) || 1;
                if (v < 1) v = 1;
                if (v > 1000) v = 1000;
                const items = obtenerCarrito();
                items[idx].cantidad = v;
                guardarCarrito(items);
                renderizarCarrito();
            });
        });

        // Event listeners para botones de eliminar item
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', function () {
                const idx = parseInt(this.dataset.index);
                const items = obtenerCarrito();
                items.splice(idx, 1);
                guardarCarrito(items);
                renderizarCarrito();
            });
        });
    }

    // Vacía todo el carrito con confirmación
    function limpiarCarrito() {
        if (confirm('¿Vaciar todo el presupuesto?')) {
            guardarCarrito([]);
            renderizarCarrito();
        }
    }

    // Expone funciones al ámbito global
    window.limpiarCarrito = limpiarCarrito;
    window.obtenerCarrito = obtenerCarrito;
    window.guardarCarrito = guardarCarrito;
    window.formatear = formatear;

    // Al cargar el DOM, renderiza el carrito
    document.addEventListener('DOMContentLoaded', renderizarCarrito);
})();
