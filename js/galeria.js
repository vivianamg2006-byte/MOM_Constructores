// galeria.js — Galería de trabajos por constructor
// Maneja apertura de modal, carga de imágenes, lightbox, likes y eliminación.
(function () {

    const STORAGE_PREFIX = 'mom_galeria_';
    const MAX_FOTOS = 3;

    // Obtiene las fotos de galería para un constructor:
    // 1) Desde localStorage (mom_galeria_<id>)
    // 2) Desde el objeto del constructor (galeria property, para user-created)
    function obtenerGaleria(id) {
        var desdeLocal = [];
        try { desdeLocal = JSON.parse(localStorage.getItem(STORAGE_PREFIX + id) || '[]'); } catch {}
        if (desdeLocal.length > 0) return desdeLocal;
        if (typeof todosLosConstructores !== 'undefined') {
            var c = todosLosConstructores.find(function(x) { return x.id === id; });
            if (c && c.galeria && c.galeria.length > 0) return c.galeria;
        }
        return [];
    }

    // Guarda las fotos en localStorage y, si el constructor pertenece a un usuario,
    // también actualiza el objeto en mom_constructores_usuario.
    function guardarGaleria(id, fotos) {
        localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(fotos));
        if (typeof todosLosConstructores !== 'undefined') {
            var c = todosLosConstructores.find(function(x) { return x.id === id; });
            if (c && c.userId) {
                c.galeria = fotos;
                var lista = [];
                try { lista = JSON.parse(localStorage.getItem('mom_constructores_usuario') || '[]'); } catch {}
                for (var i = 0; i < lista.length; i++) {
                    if (lista[i].id === id) { lista[i].galeria = fotos; break; }
                }
                localStorage.setItem('mom_constructores_usuario', JSON.stringify(lista));
            }
        }
    }

    
    // Semillas precargadas para la galería de cada constructor (evita fetch + encoding issues en file://)
    var SEMILLAS_GALERIA = {
        "1": [
            { "src": "assets/images/construccion.jpg", "caption": "Construcción de vivienda" },
            { "src": "assets/images/cieloRaso.jpg", "caption": "Instalación de cielo raso" },
            { "src": "assets/images/fontaneria.jpg", "caption": "Trabajo de fontanería" }
        ],
        "2": [
            { "src": "assets/images/tableroElectrico.jpeg", "caption": "Tablero eléctrico residencial" },
            { "src": "assets/images/breaker.jpeg", "caption": "Instalación de breakers" },
            { "src": "assets/images/cajaElectrica.jpeg", "caption": "Caja eléctrica general" }
        ],
        "3": [
            { "src": "assets/images/perlinSoldado.jpeg", "caption": "Soldadura de perlín en techo" },
            { "src": "assets/images/techoSoldado3.jpeg", "caption": "Estructura de techo soldada" },
            { "src": "assets/images/verjas.jpeg", "caption": "Fabricación de verjas metálicas" }
        ],
        "4": [
            { "src": "assets/images/cespedSintetico.jpeg", "caption": "Instalación de césped sintético" },
            { "src": "assets/images/sistemaRiego.jpg", "caption": "Sistema de riego automático" },
            { "src": "assets/images/diseñoJardin.jpg", "caption": "Diseño de jardín residencial" }
        ],
        "5": [
            { "src": "assets/images/mamposteria.jpg", "caption": "Trabajo de mampostería" },
            { "src": "assets/images/repelloFino.jpg", "caption": "Repello fino de pared" },
            { "src": "assets/images/pegandoCeramica.jpg", "caption": "Colocación de cerámica" }
        ],
        "6": [
            { "src": "assets/images/tuberia.jpg", "caption": "Instalación de tubería" },
            { "src": "assets/images/tubosPvc.jpeg", "caption": "Tubería PVC para agua potable" },
            { "src": "assets/images/alcantarillado.jpg", "caption": "Sistema de alcantarillado" }
        ],
        "7": [
            { "src": "assets/images/esqueleto.jpg", "caption": "Estructura de madera para techo" },
            { "src": "assets/images/techoPuesto.jpg", "caption": "Techado completo" },
            { "src": "assets/images/agregacionTecho.jpg", "caption": "Agregación de techo" }
        ],
        "8": [
            { "src": "assets/images/pintandoPared.jpg", "caption": "Pintura de pared interior" },
            { "src": "assets/images/acabadoCieloRaso.jpg", "caption": "Acabado de cielo raso" },
            { "src": "assets/images/liso.jpg", "caption": "Pared con acabado liso" }
        ],
        "9": [
            { "src": "assets/images/electricidad2.jpeg", "caption": "Instalación eléctrica general" },
            { "src": "assets/images/centroDeCarga.jpeg", "caption": "Centro de carga eléctrica" },
            { "src": "assets/images/conexiones.jpeg", "caption": "Conexiones eléctricas" }
        ],
        "10": [
            { "src": "assets/images/diseñoJardin.jpg", "caption": "Diseño paisajista" },
            { "src": "assets/images/cespedSintetico.jpeg", "caption": "Colocación de césped" },
            { "src": "assets/images/armada.jpg", "caption": "Estructura para jardín" }
        ]
    };

    // Versión de las semillas: al incrementar, fuerza re-siembra y limpia datos corruptos viejos
    var SEMILLAS_VERSION = 2;
    var SEMILLAS_VERSION_KEY = 'mom_galeria_semillas_v';

    function cargarSemillasGaleria() {
        var versionGuardada = 0;
        try { versionGuardada = parseInt(localStorage.getItem(SEMILLAS_VERSION_KEY) || '0', 10); } catch {}
        if (versionGuardada < SEMILLAS_VERSION) {
            // Limpia solo las galerías de constructores predefinidos (ids 1-10) para
            // eliminar datos corruptos por mojibake de versiones anteriores; respeta galerías de usuarios
            Object.keys(SEMILLAS_GALERIA).forEach(function (id) {
                localStorage.removeItem(STORAGE_PREFIX + id);
            });
            localStorage.setItem(SEMILLAS_VERSION_KEY, String(SEMILLAS_VERSION));
        }
        // Siembra desde el objeto embebido solo donde localStorage está vacío
        Object.keys(SEMILLAS_GALERIA).forEach(function (id) {
            var idNum = parseInt(id, 10);
            var fotos = SEMILLAS_GALERIA[id];
            if (!fotos || fotos.length === 0) return;
            if (obtenerGaleria(idNum).length === 0) guardarGaleria(idNum, fotos);
        });
    }
    document.addEventListener('DOMContentLoaded', cargarSemillasGaleria);

    // Obtiene la sesión actual desde localStorage
    function obtenerSesion() {
        try { return JSON.parse(localStorage.getItem('mom_sesion') || 'null'); } catch { return null; }
    }

    // Verifica si el constructor actual es el dueño (para mostrar botón de subir/eliminar)
    function esConstructorDueno(constructorId) {
        var sesion = obtenerSesion();
        if (!sesion || sesion.rol !== 'constructor') return false;
        if (typeof todosLosConstructores === 'undefined') return false;
        var c = todosLosConstructores.find(function(x) { return x.id === constructorId; });
        if (!c) return false;
        return (c.userId && c.userId === sesion.id) || c.nombre === sesion.nombre;
    }

    function crearModal() {
        if (document.getElementById('galeriaModal')) return;
        var overlay = document.createElement('div');
        overlay.id = 'galeriaModal';
        overlay.className = 'modal-overlay';
        overlay.style.zIndex = '2500';
        overlay.innerHTML = '<div class="modal-box galeria-modal-box">'
            + '<button class="modal-close" id="galeriaModalClose">&times;</button>'
            + '<h3 id="galeriaTitulo" class="galeria-titulo">Galer\u00eda de trabajos</h3>'
            + '<p id="galeriaSubtitulo" class="galeria-subtitulo"></p>'
            + '<div id="galeriaUploadZona" class="galeria-upload-zona">'
            +   '<input id="galeriaTituloInput" type="text" placeholder="Nombre del trabajo..." maxlength="60" class="galeria-upload-input">'
            +   '<label id="galeriaUploadLabel" class="galeria-upload-label">'
            +     '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#c0392b" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'
            +     '<span class="galeria-upload-label-text">Subir fotos de trabajos</span>'
            +     '<span class="galeria-upload-label-hint">JPG, PNG o WebP \u00b7 M\u00e1x. 3 im\u00e1genes</span>'
            +     '<input id="galeriaFileInput" type="file" accept="image/*" multiple style="display:none;">'
            +   '</label>'
            +   '<p id="galeriaUploadError" class="galeria-upload-error"></p>'
            + '</div>'
            + '<div id="galeriaGrid" class="galeria-grid"></div>'
            + '<p id="galeriaVacia" class="galeria-vacia">A\u00fan no hay fotos en esta galer\u00eda.</p>'
            + '<div id="galeriaLightbox" class="galeria-lightbox">'
            +   '<button id="galeriaLightboxClose" class="galeria-lightbox-close">&times;</button>'
            +   '<img id="galeriaLightboxImg" src="" alt="" class="galeria-lightbox-img">'
            +   '<p id="galeriaLightboxCaption" class="galeria-lightbox-caption"></p>'
            + '</div>'
            + '</div>';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) cerrarModal(); });
        document.getElementById('galeriaModalClose').addEventListener('click', cerrarModal);
        document.getElementById('galeriaLightboxClose').addEventListener('click', function () {
            document.getElementById('galeriaLightbox').classList.remove('open');
        });
        document.getElementById('galeriaLightbox').addEventListener('click', function (e) {
            if (e.target === this) this.classList.remove('open');
        });
        document.getElementById('galeriaFileInput').addEventListener('change', manejarArchivos);
    }

    var idActivo = null;

    function abrirGaleriaModal(constructorId, nombre) {
        crearModal();
        idActivo = constructorId;
        document.getElementById('galeriaTitulo').textContent = 'Galer\u00eda de trabajos';
        document.getElementById('galeriaSubtitulo').textContent = nombre || '';
        document.getElementById('galeriaUploadError').style.display = 'none';
        document.getElementById('galeriaUploadZona').style.display = esConstructorDueno(constructorId) ? 'block' : 'none';
        renderGrid(constructorId);
        document.getElementById('galeriaModal').classList.add('open');
    }

    function cerrarModal() {
        var m = document.getElementById('galeriaModal');
        if (m) m.classList.remove('open');
        idActivo = null;
    }

    function renderGrid(constructorId) {
        var fotos = obtenerGaleria(constructorId);
        var grid = document.getElementById('galeriaGrid');
        var vacia = document.getElementById('galeriaVacia');
        var esDueno = esConstructorDueno(constructorId);
        grid.innerHTML = '';
        if (fotos.length === 0) { vacia.style.display = 'block'; return; }
        vacia.style.display = 'none';
        fotos.forEach(function (foto, idx) {
            var wrapper = document.createElement('div');
            wrapper.className = 'galeria-img-wrapper';
            var img = document.createElement('img');
            img.src = foto.src;
            img.alt = foto.caption || '';
            img.loading = 'lazy';
            img.className = 'galeria-img';
            img.addEventListener('click', function () { abrirLightbox(foto.src, foto.caption); });
            wrapper.appendChild(img);

            var likeBtn = document.createElement('button');
            likeBtn.className = 'galeria-like-btn';
            likeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            likeBtn.title = 'Me gusta';
            likeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                var liked = likeBtn.dataset.liked === '1';
                liked = !liked;
                likeBtn.dataset.liked = liked ? '1' : '0';
                likeBtn.innerHTML = liked
                    ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="#e74c3c" stroke="#e74c3c" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
                    : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
                likeBtn.classList.toggle('liked', liked);
            });
            wrapper.appendChild(likeBtn);

            if (esDueno) {
                var btnDel = document.createElement('button');
                btnDel.className = 'galeria-delete-btn';
                btnDel.innerHTML = '&times;';
                (function (i) {
                    btnDel.addEventListener('click', function (e) {
                        e.stopPropagation();
                        if (!confirm('\u00bfEliminar esta foto?')) return;
                        var f = obtenerGaleria(constructorId);
                        f.splice(i, 1);
                        guardarGaleria(constructorId, f);
                        renderGrid(constructorId);
                    });
                })(idx);
                wrapper.appendChild(btnDel);
            }
            if (foto.caption) {
                var cap = document.createElement('p');
                cap.textContent = foto.caption;
                cap.className = 'galeria-caption';
                wrapper.appendChild(cap);
            }
            grid.appendChild(wrapper);
        });
    }

    function abrirLightbox(src, caption) {
        document.getElementById('galeriaLightboxImg').src = src;
        document.getElementById('galeriaLightboxCaption').textContent = caption || '';
        var lb = document.getElementById('galeriaLightbox');
        lb.classList.add('open');
    }

    function manejarArchivos(e) {
        var errorEl = document.getElementById('galeriaUploadError');
        errorEl.style.display = 'none';
        var tituloInput = document.getElementById('galeriaTituloInput');
        var titulo = tituloInput ? tituloInput.value.trim() : '';
        var archivos = Array.from(e.target.files);
        if (!archivos.length) return;
        var actuales = obtenerGaleria(idActivo);
        if (actuales.length >= MAX_FOTOS) {
            errorEl.textContent = 'Ya tienes ' + MAX_FOTOS + ' im\u00e1genes. Elimina alguna para subir otra.';
            errorEl.style.display = 'block';
            e.target.value = '';
            return;
        }
        var cupo = MAX_FOTOS - actuales.length;
        if (archivos.length > cupo) {
            errorEl.textContent = 'Solo puedes subir ' + cupo + ' imagen(es) m\u00e1s (m\u00e1ximo ' + MAX_FOTOS + ').';
            errorEl.style.display = 'block';
            archivos = archivos.slice(0, cupo);
        }
        var procesados = 0, errores = [];
        archivos.forEach(function (archivo) {
            if (!archivo.type.startsWith('image/')) {
                errores.push('"' + archivo.name + '" no es imagen.');
                if (++procesados === archivos.length) finalizar(errores);
                return;
            }
            if (archivo.size > 5 * 1024 * 1024) {
                errores.push('"' + archivo.name + '" supera 5 MB.');
                if (++procesados === archivos.length) finalizar(errores);
                return;
            }
            var reader = new FileReader();
            reader.onload = function (ev) {
                var fotos = obtenerGaleria(idActivo);
                var captionFinal = titulo || archivo.name.replace(/\.[^.]+$/, '');
                fotos.push({ src: ev.target.result, caption: captionFinal, fecha: new Date().toLocaleDateString('es-CR') });
                guardarGaleria(idActivo, fotos);
                if (++procesados === archivos.length) finalizar(errores);
            };
            reader.onerror = function () {
                errores.push('Error leyendo "' + archivo.name + '".');
                if (++procesados === archivos.length) finalizar(errores);
            };
            reader.readAsDataURL(archivo);
        });
        e.target.value = '';
    }

    function finalizar(errores) {
        renderGrid(idActivo);
        var tituloInput = document.getElementById('galeriaTituloInput');
        if (tituloInput) tituloInput.value = '';
        if (errores.length) {
            var el = document.getElementById('galeriaUploadError');
            el.textContent = errores.join(' \u00b7 ');
            el.style.display = 'block';
        }
    }

    // Delegacion de eventos: captura clics en .btn-galeria aunque sean dinamicos
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.btn-galeria');
        if (!btn) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        var id = parseInt(btn.dataset.id);
        var nombre = btn.dataset.nombre || '';
        if (!id) return;
        abrirGaleriaModal(id, nombre);
    });

    document.addEventListener('DOMContentLoaded', crearModal);
    window.abrirGaleriaModal = abrirGaleriaModal;

})();
