// registro.js - Página de Registro de Constructores
// Validaciones de formulario y almacenamiento en localStorage

// Al cargar el DOM, configura el formulario de registro y su validación
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formulario-constructor');
    const mensajeExito = document.getElementById('mensaje-exito');
    
    // Maneja el envío del formulario con validación y persistencia
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let esValido = true;
        
        const nombre = document.getElementById('nombre');
        const especialidad = document.getElementById('especialidad');
        const provincia = document.getElementById('provincia');
        const presupuesto = document.getElementById('presupuesto');
        const contacto = document.getElementById('contacto');
        
        // Validación del campo nombre
        if (!nombre.value.trim()) {
            document.getElementById('error-nombre').style.display = 'block';
            esValido = false;
        } else {
            document.getElementById('error-nombre').style.display = 'none';
        }
        
        // Validación del campo especialidad
        if (!especialidad.value) {
            document.getElementById('error-especialidad').style.display = 'block';
            esValido = false;
        } else {
            document.getElementById('error-especialidad').style.display = 'none';
        }
        
        // Validación del campo provincia
        if (!provincia.value) {
            document.getElementById('error-provincia').style.display = 'block';
            esValido = false;
        } else {
            document.getElementById('error-provincia').style.display = 'none';
        }
        
        // Validación del campo presupuesto (debe ser un número positivo)
        if (!presupuesto.value || presupuesto.value <= 0) {
            document.getElementById('error-presupuesto').style.display = 'block';
            esValido = false;
        } else {
            document.getElementById('error-presupuesto').style.display = 'none';
        }
        
        // Validación del campo contacto
        if (!contacto.value.trim()) {
            document.getElementById('error-contacto').style.display = 'block';
            esValido = false;
        } else {
            document.getElementById('error-contacto').style.display = 'none';
        }
        
        // Si todas las validaciones pasan, guarda la solicitud
        if (esValido) {
            // Construye el objeto solicitud con los datos del formulario
            const solicitud = {
                id: Date.now(),
                nombre: nombre.value,
                especialidad: especialidad.value,
                provincia: provincia.value,
                presupuestoBase: parseInt(presupuesto.value),
                contacto: contacto.value,
                descripcion: document.getElementById('descripcion').value,
                fecha: new Date().toLocaleDateString()
            };
            
            // Recupera las solicitudes existentes y agrega la nueva
            let solicitudesGuardadas = localStorage.getItem('mom_solicitudes');
            solicitudesGuardadas = solicitudesGuardadas ? JSON.parse(solicitudesGuardadas) : [];
            solicitudesGuardadas.push(solicitud);
            localStorage.setItem('mom_solicitudes', JSON.stringify(solicitudesGuardadas));
            
            // Muestra el mensaje de éxito y reinicia el formulario
            mensajeExito.style.display = 'block';
            form.reset();
            
            // Oculta el mensaje de éxito después de 3 segundos
            setTimeout(() => {
                mensajeExito.style.display = 'none';
            }, 3000);
        }
    });
});