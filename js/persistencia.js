// Datos semilla de constructores precargados para la aplicación
const SEED_CONSTRUCTORES = [
  {
    "id": 1,
    "nombre": "Juan Masís Calero",
    "especialidad": "Maestro de obra",
    "categoria": "Construccion, Fontaneria, Electricidad, Soldadura, Repello, Cielo Raso, Jardineria, Ceramica",
    "provincia": "Alajuela",
    "presupuestoBase": 500000,
    "estado": "Disponible",
    "contacto": "8732-4339",
    "foto": "assets/images/juanMasis.jpg",
    "descripcion": "Más de 25 años de experiencia en remodelaciones, construcción de viviendas, instalaciones eléctricas y más.",
    "experiencia": 25,
    "calificacion": 0
  },
  {
    "id": 2,
    "nombre": "Daniel Masís Calero",
    "especialidad": "Electricista",
    "categoria": "Electricidad, Soldadura",
    "provincia": "Guanacaste",
    "presupuestoBase": 400000,
    "estado": "Disponible",
    "contacto": "88978427",
    "foto": "assets/images/IMG-20260607-WA0035.jpg",
    "descripcion": "Más de 15 años de experiencia en instalaciones eléctricas y soldador.",
    "experiencia": 15,
    "calificacion": 0
  }
];

// Constantes para la base de datos IndexedDB de persistencia
const PERSISTENCIA_DB = 'mom_persistencia';
const PERSISTENCIA_STORE = 'handles';
const PERSISTENCIA_KEY = 'dirHandle';

// Abre (o crea) la base de datos IndexedDB para almacenar el handle del directorio
function abrirDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(PERSISTENCIA_DB, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(PERSISTENCIA_STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// Guarda el FileSystemDirectoryHandle en IndexedDB para uso futuro
async function guardarHandle(handle) {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(PERSISTENCIA_STORE, 'readwrite');
        tx.objectStore(PERSISTENCIA_STORE).put(handle, PERSISTENCIA_KEY);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}

// Recupera el FileSystemDirectoryHandle guardado desde IndexedDB
async function obtenerHandle() {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(PERSISTENCIA_STORE, 'readonly');
        const req = tx.objectStore(PERSISTENCIA_STORE).get(PERSISTENCIA_KEY);
        req.onsuccess = () => { db.close(); resolve(req.result); };
        req.onerror = () => { db.close(); reject(req.error); };
    });
}

// Verifica y solicita permisos de lectura/escritura para el directorio guardado
async function obtenerDirectorio() {
    let handle = await obtenerHandle();
    if (!handle) return null;
    try {
        const opts = { mode: 'readwrite' };
        if ((await handle.queryPermission(opts)) !== 'granted') {
            if ((await handle.requestPermission(opts)) !== 'granted') return null;
        }
        return handle;
    } catch {
        return null;
    }
}

// Navega por subdirectorios hasta llegar al archivo en la ruta especificada
async function navegarA(dirHandle, ruta) {
    const parts = ruta.replace(/\\/g, '/').split('/');
    let current = dirHandle;
    for (const part of parts.slice(0, -1)) {
        current = await current.getDirectoryHandle(part);
    }
    return await current.getFileHandle(parts[parts.length - 1]);
}

// Lee y parsea el archivo constructores.json desde el directorio persistente
async function leerConstructores() {
    const dir = await obtenerDirectorio();
    if (!dir) throw new Error('DIRECTORIO_NO_CONECTADO');
    const fh = await navegarA(dir, 'data/constructores.json');
    const file = await fh.getFile();
    return await file.json();
}

// Escribe el arreglo de constructores en el archivo JSON del directorio persistente
async function escribirConstructores(data) {
    const dir = await obtenerDirectorio();
    if (!dir) throw new Error('DIRECTORIO_NO_CONECTADO');
    const fh = await navegarA(dir, 'data/constructores.json');
    const writable = await fh.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
}

// Obtiene los datos de la sesión actual desde localStorage; devuelve null si no existe
function obtenerSesion() {
    try { return JSON.parse(localStorage.getItem('mom_sesion') || 'null'); } catch { return null; }
}

const persistenciaAPI = {
    // Solicita al usuario seleccionar un directorio y guarda su handle
    async pedirDirectorio() {
        const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
        await guardarHandle(handle);
        return handle;
    },

    // Verifica si hay un directorio persistente con permisos concedidos
    async estaConectado() {
        return !!(await obtenerDirectorio());
    },

    // Asegura que los constructores semilla estén presentes en la lista
    asegurarSeed(lista) {
        const idsSeed = new Set(SEED_CONSTRUCTORES.map(s => s.id));
        for (const seed of SEED_CONSTRUCTORES) {
            if (!lista.some(c => c.id === seed.id)) {
                lista.push({ ...seed });
            }
        }
        return lista;
    },

    // Guarda o actualiza la tarjeta del usuario en el archivo JSON persistente
    async guardarMiTarjeta(datos) {
        const sesion = obtenerSesion();
        const userId = sesion ? sesion.id : 'anon_' + Date.now();

        let lista = await leerConstructores();
        if (!Array.isArray(lista)) lista = [];

        lista = this.asegurarSeed(lista);

        const idx = lista.findIndex(c => c.userId === userId);

        // Construye el objeto del constructor con los datos del formulario
        const entrada = {
            userId,
            nombre: datos.nombre || '',
            especialidad: datos.especialidad || '',
            categoria: datos.especialidad || '',
            provincia: datos.provincia || '',
            presupuestoBase: 0,
            estado: datos.estado || 'Disponible',
            contacto: datos.contacto || '',
            foto: datos.foto || '',
            descripcion: datos.descripcion || '',
            experiencia: 0,
            calificacion: 0,
            instagram: datos.instagram || '',
            facebook: datos.facebook || '',
            whatsapp: datos.whatsapp || '',
        };

        if (idx >= 0) {
            entrada.id = lista[idx].id;
            entrada.calificacion = lista[idx].calificacion || 0;
            lista[idx] = entrada;
        } else {
            const maxId = lista.reduce((m, c) => Math.max(m, c.id || 0), 0);
            entrada.id = maxId + 1;
            lista.push(entrada);
        }

        await escribirConstructores(lista);
        return entrada;
    },

    // Carga la tarjeta del usuario desde el archivo JSON según su sesión
    async cargarMiTarjeta() {
        const sesion = obtenerSesion();
        if (!sesion) return null;
        const lista = await leerConstructores();
        if (!Array.isArray(lista)) return null;
        return lista.find(c => c.userId === sesion.id) || null;
    },
};
