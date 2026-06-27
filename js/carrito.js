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

    // Obtiene el nombre del cliente desde la sesión
    function obtenerNombreCliente() {
        try {
            const s = JSON.parse(localStorage.getItem('mom_sesion') || '{}');
            return s.nombre || 'Cliente';
        } catch { return 'Cliente'; }
    }

    // Busca el teléfono/whatsapp de un constructor por ID
    function obtenerTelefonoConstructor(id) {
        if (typeof todosLosConstructores === 'undefined') return null;
        var c = todosLosConstructores.find(function(x) { return x.id === id; });
        if (!c) return null;
        return c.whatsapp || c.contacto || null;
    }

    // Renderiza el contenido del carrito en el DOM
    function renderizarCarrito() {
        const items = obtenerCarrito();
        const contenedor = document.getElementById('itemsCarrito');
        const vacio = document.getElementById('carritoVacio');
        const resumen = document.getElementById('resumen');
        const contador = document.getElementById('contadorCarrito');
        const nombreCliente = obtenerNombreCliente();

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
                grupos[key] = { nombre: item.constructorNombre || 'Sin constructor', constructorId: item.constructorId, items: [] };
            }
            grupos[key].items.push({ item, index });
        });

        const gruposHtml = [];
        for (const key in grupos) {
            const grupo = grupos[key];
            const telefono = grupo.constructorId ? obtenerTelefonoConstructor(parseInt(grupo.constructorId)) : null;
            let html = `<div class="grupo-carrito">`;
            if (key !== 'sin_constructor') {
                // Construye la lista de productos para el mensaje de WhatsApp
                var listaProductos = grupo.items.map(function(i) {
                    return i.item.cantidad + 'x ' + i.item.nombre;
                }).join(', ');
                var mensajeWhatsApp = 'Hola%2C%20mi%20nombre%20es%20' + encodeURIComponent(nombreCliente) + '%2C%20y%20me%20gustar%C3%ADa%20saber%20m%C3%A1s%20informaci%C3%B3n%20con%20respecto%20a%3A%20' + encodeURIComponent(listaProductos);
                var waLink = telefono ? 'https://wa.me/' + telefono.replace(/[^0-9]/g,'') + '?text=' + mensajeWhatsApp : null;
                html += `<div class="grupo-carrito-header">
                    <span>${grupo.nombre}</span>
                    ${waLink ? `<a href="${waLink}" target="_blank" class="btn-contactar-wa no-print" title="Contactar al vendedor">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        Contactar al vendedor
                    </a>` : ''}
                </div>`;
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

    // Imprime el presupuesto con un formato bonito y profesional
    function imprimirPresupuesto() {
        var items = obtenerCarrito();
        if (!items.length) return;

        var nombreCliente = obtenerNombreCliente();
        var fecha = new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' });
        var totalGeneral = 0;
        var html = '<html><head><meta charset=\"UTF-8\"><title>Presupuesto MOM</title>';
        html += '<style>';
        html += 'body{font-family:Arial,sans-serif;color:#333;padding:40px;max-width:800px;margin:0 auto;}';
        html += 'h1{color:#c0392b;font-size:24px;margin-bottom:4px;}';
        html += '.sub{color:#888;font-size:13px;margin-bottom:30px;}';
        html += 'table{width:100%;border-collapse:collapse;margin-bottom:20px;}';
        html += 'th{background:#c0392b;color:white;padding:10px 12px;text-align:left;font-size:13px;}';
        html += 'td{padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;}';
        html += 'tr:nth-child(even){background:#f9f9f9;}';
        html += '.total-row td{font-weight:bold;font-size:15px;border-top:2px solid #c0392b;padding-top:14px;}';
        html += '.total-row td:last-child{color:#c0392b;font-size:17px;}';
        html += '.constructor-header{font-weight:bold;color:#c0392b;font-size:15px;margin:20px 0 8px;padding:8px 12px;background:#fff5f5;border-radius:6px;}';
        html += '.footer{text-align:center;color:#aaa;font-size:12px;margin-top:40px;border-top:1px solid #eee;padding-top:20px;}';
        html += '.cliente-info{margin-bottom:20px;font-size:14px;color:#555;}';
        html += '</style></head><body>';
        html += '<h1>MOM - Presupuesto</h1>';
        html += '<div class=\"sub\">Maestro Obra Mas\u00eds &middot; Constructores Costa Rica</div>';
        html += '<div class=\"cliente-info\"><strong>Cliente:</strong> ' + nombreCliente + '<br><strong>Fecha:</strong> ' + fecha + '</div>';
        html += '<hr style=\"border:none;border-top:2px solid #c0392b;margin-bottom:20px;\">';

        var grupos = {};
        items.forEach(function(item) {
            var key = item.constructorId || 'sin_constructor';
            if (!grupos[key]) grupos[key] = { nombre: item.constructorNombre || 'General', items: [] };
            grupos[key].items.push(item);
        });

        for (var key in grupos) {
            var g = grupos[key];
            html += '<div class=\"constructor-header\">' + g.nombre + '</div>';
            html += '<table><thead><tr><th>Servicio</th><th>Categor\u00eda</th><th style=\"text-align:center;\">Cantidad</th><th>Precio unit.</th><th style=\"text-align:right;\">Subtotal</th></tr></thead><tbody>';
            var subtotalGrupo = 0;
            g.items.forEach(function(item) {
                var subtotal = item.cantidad * item.precio;
                subtotalGrupo += subtotal;
                html += '<tr><td>' + item.nombre + '</td><td>' + (item.categoria || '') + '</td><td style=\"text-align:center;\">' + item.cantidad + ' ' + (item.esPorMetro ? (item.unidad === '/ mL' ? 'mL' : 'm\u00b2') : 'und') + '</td><td>\u20a1' + item.precio.toLocaleString('es-CR') + '</td><td style=\"text-align:right;\">\u20a1' + subtotal.toLocaleString('es-CR') + '</td></tr>';
            });
            html += '<tr class=\"total-row\"><td colspan=\"4\" style=\"text-align:right;\">Subtotal ' + g.nombre + '</td><td style=\"text-align:right;\">\u20a1' + subtotalGrupo.toLocaleString('es-CR') + '</td></tr>';
            html += '</tbody></table>';
            totalGeneral += subtotalGrupo;
        }

        html += '<hr style=\"border:none;border-top:3px solid #c0392b;margin:20px 0;\">';
        html += '<div style=\"text-align:right;font-size:20px;font-weight:bold;color:#c0392b;\">Total estimado: \u20a1' + totalGeneral.toLocaleString('es-CR') + '</div>';
        html += '<div class=\"footer\">MOM &copy; ' + new Date().getFullYear() + ' &middot; Este es un presupuesto estimado, los precios pueden variar seg\u00fan el proyecto.</div>';
        html += '</body></html>';

        var ventana = window.open('', '_blank', 'width=800,height=600');
        ventana.document.write(html);
        ventana.document.close();
        ventana.print();
    }

    // Expone funciones al ámbito global
    window.limpiarCarrito = limpiarCarrito;
    window.obtenerCarrito = obtenerCarrito;
    window.guardarCarrito = guardarCarrito;
    window.formatear = formatear;
    window.imprimirPresupuesto = imprimirPresupuesto;

    // Al cargar el DOM, espera constructores y renderiza el carrito
    document.addEventListener('DOMContentLoaded', async function() {
        if (typeof constructoresReady !== 'undefined') await constructoresReady;
        renderizarCarrito();
    });
})();
