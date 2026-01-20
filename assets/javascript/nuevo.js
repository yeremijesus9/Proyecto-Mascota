// ==========================================
// NUEVO PRODUCTO - Agregar y Guardar en BD
// ==========================================

// URL de API del servidor JSON
const URL_API = 'http://localhost:3000/nuevo_producto';

// Estado de las imágenes
const estadoImagenes = {
    imagenPrincipal: null,
    imagenMiniatura: null
};

// Esperar a que cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
    configurarListenerFormulario();
    agregarPlaceholders();
});

// ==========================================
// CONFIGURAR LISTENERS
// ==========================================
function configurarListenerFormulario() {
    const inputGroups = document.querySelectorAll('.grupo-entrada input');
    configurarArrastreYSuelta();
    configurarListenerBotones();
}

// ==========================================
// AGREGAR PLACEHOLDERS
// ==========================================
function agregarPlaceholders() {
    const inputs = document.querySelectorAll('.grupo-entrada input');
    const placeholders = [
        'Ej: Perro, Gato, Pajaro, Pez, Roedor, Otros',
        'Ej: Pedigree, Royal Canin, Purina',
        'Ej: 25.99',
        'Describe el producto de manera detallada',
        'Ej: Bolsa 1kg, Lata 250g, Caja 5 piezas'
    ];
    
    inputs.forEach((input, index) => {
        if (placeholders[index]) {
            input.placeholder = placeholders[index];
        }
    });
}

// ==========================================
// ARRASTRAR Y SOLTAR IMÁGENES
// ==========================================
function configurarArrastreYSuelta() {
    const dropAreas = document.querySelectorAll('.area-soltar');
    
    dropAreas.forEach((dropArea, index) => {
        const esImagenPrincipal = index === 0;
        
        // Eventos de arrastrar y soltar
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, prevenirDefectos, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => resaltar(dropArea), false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => desresaltar(dropArea), false);
        });
        
        dropArea.addEventListener('drop', (e) => manejarSuelta(e, esImagenPrincipal), false);
        
        // Click para seleccionar archivo
        dropArea.addEventListener('click', () => {
            const inputArchivo = document.createElement('input');
            inputArchivo.type = 'file';
            inputArchivo.accept = 'image/*';
            inputArchivo.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    manejarArchivo(e.target.files[0], esImagenPrincipal);
                }
            });
            inputArchivo.click();
        });
    });
}

function prevenirDefectos(e) {
    e.preventDefault();
    e.stopPropagation();
}

function resaltar(elemento) {
    elemento.style.backgroundColor = '#f0f0f0';
    elemento.style.borderColor = '#007bff';
}

function desresaltar(elemento) {
    elemento.style.backgroundColor = '';
    elemento.style.borderColor = '';
}

function manejarSuelta(e, esImagenPrincipal) {
    const archivos = e.dataTransfer.files;
    if (archivos.length > 0 && archivos[0].type.startsWith('image/')) {
        manejarArchivo(archivos[0], esImagenPrincipal);
    }
}

function manejarArchivo(archivo, esImagenPrincipal) {
    const tamañoMaximo = 5 * 1024 * 1024; // 5MB
    if (archivo.size > tamañoMaximo) {
        alert('El archivo es demasiado grande. Máximo 5MB');
        return;
    }
    
    const lector = new FileReader();
    lector.onload = function(e) {
        if (esImagenPrincipal) {
            estadoImagenes.imagenPrincipal = e.target.result;
            actualizarVistaPrevia(0, e.target.result, archivo.name);
        } else {
            estadoImagenes.imagenMiniatura = e.target.result;
            actualizarVistaPrevia(1, e.target.result, archivo.name);
        }
    };
    lector.readAsDataURL(archivo);
}

function actualizarVistaPrevia(indice, datosImagen, nombreArchivo) {
    const areasSuelta = document.querySelectorAll('.area-soltar');
    areasSuelta[indice].innerHTML = `
        <img src="${datosImagen}" style="max-width: 100%; max-height: 200px; object-fit: contain;">
        <p style="margin-top: 10px; font-size: 12px; color: #666;">${nombreArchivo}</p>
    `;
}

// ==========================================
// LISTENERS DE BOTONES - GUARDAR Y CANCELAR
// ==========================================
function configurarListenerBotones() {
    const botones = document.querySelectorAll('button');
    
    botones.forEach(boton => {
        if (boton.classList.contains('btn-save')) {
            boton.addEventListener('click', manejarGuardarProducto);
        } else if (boton.classList.contains('btn-cancel')) {
            boton.addEventListener('click', manejarCancelar);
        }
    });
}

// ==========================================
// MANEJAR GUARDAR PRODUCTO
// ==========================================
function manejarGuardarProducto(e) {
    e.preventDefault();
    
    // Obtener datos de los inputs
    const inputs = document.querySelectorAll('.grupo-entrada input');
    const datosFormulario = {
        categoria: inputs[0]?.value.trim() || '',
        marca: inputs[1]?.value.trim() || '',
        precio: inputs[2]?.value.trim() || '',
        descripcion: inputs[3]?.value.trim() || '',
        formato: inputs[4]?.value.trim() || ''
    };
    
    // Validar
    if (!datosFormulario.categoria || !datosFormulario.marca || !datosFormulario.precio || 
        !datosFormulario.descripcion || !datosFormulario.formato) {
        alert('Por favor completa todos los campos de texto');
        return;
    }
    
    if (isNaN(parseFloat(datosFormulario.precio)) || parseFloat(datosFormulario.precio) <= 0) {
        alert('El precio debe ser un número válido mayor a 0');
        return;
    }
    
    if (!estadoImagenes.imagenPrincipal) {
        alert('Por favor carga una imagen principal');
        return;
    }
    
    if (!estadoImagenes.imagenMiniatura) {
        alert('Por favor carga una imagen en miniatura');
        return;
    }
    
    // Crear objeto producto
    const nuevoProducto = {
        id: 'PROD' + Date.now(),
        categoria: datosFormulario.categoria,
        marca: datosFormulario.marca,
        nombre_producto: datosFormulario.categoria + ' ' + datosFormulario.marca,
        precio: parseFloat(datosFormulario.precio),
        descripcion: datosFormulario.descripcion,
        formato: datosFormulario.formato,
        imagen_principal: estadoImagenes.imagenPrincipal,
        imagen_miniatura: [estadoImagenes.imagenPrincipal, estadoImagenes.imagenMiniatura],
        puntuacion: '5',
        opiniones: '0',
        comentarios: []
    };
    
    // Guardar en el servidor
    guardarProductoEnBD(nuevoProducto);
}

// ==========================================
// GUARDAR PRODUCTO EN LA BD
// ==========================================
function guardarProductoEnBD(producto) {
    fetch(URL_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(producto)
    })
    .then(respuesta => {
        if (!respuesta.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return respuesta.json();
    })
    .then(datos => {
        console.log('Producto guardado:', datos);
        alert('✓ Producto guardado exitosamente');
        limpiarFormulario();
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
            window.location.href = 'panel_del_admin.html';
        }, 1500);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('✗ Error al guardar. Verifica que el servidor esté en http://localhost:3000');
    });
}

// ==========================================
// MANEJAR CANCELAR
// ==========================================
function manejarCancelar(e) {
    e.preventDefault();
    
    if (confirm('¿Estás seguro de que deseas cancelar? Se perderán todos los datos.')) {
        limpiarFormulario();
        window.location.href = 'panel_del_admin.html';
    }
}

// ==========================================
// LIMPIAR FORMULARIO
// ==========================================
function limpiarFormulario() {
    // Limpiar inputs
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => input.value = '');
    
    // Limpiar imágenes
    estadoImagenes.imagenPrincipal = null;
    estadoImagenes.imagenMiniatura = null;
    
    // Restaurar vistas previas
    const areasSuelta = document.querySelectorAll('.drop-area');
    areasSuelta.forEach(areaSuelta => {
        areaSuelta.innerHTML = `
            <div class="img-placeholder">🖼️</div>
            <p>Arrastra tu imagen aquí o <span>haz click para seleccionar</span></p>
        `;
    });
}
