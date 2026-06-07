// registro.js - Página de Registro
// Validaciones y localStorage

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formulario-constructor');
    const mensajeExito = document.getElementById('mensaje-exito');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let esValido = true;
        
        const nombre = document.getElementById('nombre');
        const especialidad = document.getElementById('especialidad');
        const provincia = document.getElementById('provincia');
        const presupuesto = document.getElementById('presupuesto');
        const contacto = document.getElementById('contacto');
        
        if (!nombre.value.trim()) {
            document.getElementById('error-nombre').style.display = 'block';
            esValido = false;
        } else {
            document.getElementById('error-nombre').style.display = 'none';
        }
        
        if (!especialidad.value) {
            document.getElementById('error-especialidad').style.display = 'block';
            esValido = false;
        } else {
            document.getElementById('error-especialidad').style.display = 'none';
        }
        
        if (!provincia.value) {
            document.getElementById('error-provincia').style.display = 'block';
            esValido = false;
        } else {
            document.getElementById('error-provincia').style.display = 'none';
        }
        
        if (!presupuesto.value || presupuesto.value <= 0) {
            document.getElementById('error-presupuesto').style.display = 'block';
            esValido = false;
        } else {
            document.getElementById('error-presupuesto').style.display = 'none';
        }
        
        if (!contacto.value.trim()) {
            document.getElementById('error-contacto').style.display = 'block';
            esValido = false;
        } else {
            document.getElementById('error-contacto').style.display = 'none';
        }
        
        if (esValido) {
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
            
            let solicitudesGuardadas = localStorage.getItem('mom_solicitudes');
            solicitudesGuardadas = solicitudesGuardadas ? JSON.parse(solicitudesGuardadas) : [];
            solicitudesGuardadas.push(solicitud);
            localStorage.setItem('mom_solicitudes', JSON.stringify(solicitudesGuardadas));
            
            mensajeExito.style.display = 'block';
            form.reset();
            
            setTimeout(() => {
                mensajeExito.style.display = 'none';
            }, 3000);
        }
    });
});