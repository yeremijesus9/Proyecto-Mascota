// ==========================================
// NUEVO PRODUCTO - Agregar y Guardar en BD
// ==========================================

// URL donde guardamos los productos
const API_URL = 'http://localhost:3000/nuevo_producto';

// Objeto para guardar temporalmente las imágenes
const imagenes = {
    principal: null,    // Imagen principal del producto
    miniatura: null     // Imagen pequeña del producto
};

// ========================================================================
// PASO 1: CUANDO LA PÁGINA CARGA, CONFIGURAMOS TODO
// ========================================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ Página cargada');
    configurarAreasDeImagenes();
    configurarBotones();
});

// ========================================================================
// PASO 2: PREPARAR LAS ÁREAS DONDE SE ARRASTRAN LAS IMÁGENES
// ========================================================================
function configurarAreasDeImagenes() {
    // Encontrar todas las áreas donde el usuario puede soltar imágenes
    const areas = document.querySelectorAll('.area-soltar');
    console.log('Encontradas ' + areas.length + ' áreas para imágenes');
    
    // Para cada área, configurar:
    areas.forEach((area, indice) => {
        // 1. CUANDO PASAMOS ARCHIVOS POR ENCIMA
        area.addEventListener('dragover', (evento) => {
            evento.preventDefault();
            area.style.backgroundColor = '#e8f4f8';
        });
        
        // 2. CUANDO SALIMOS DEL ÁREA
        area.addEventListener('dragleave', () => {
            area.style.backgroundColor = '';
        });
        
        // 3. CUANDO SOLTAMOS LA IMAGEN
        area.addEventListener('drop', (evento) => {
            evento.preventDefault();
            area.style.backgroundColor = '';
            
            // Obtener el archivo que soltaron
            if (evento.dataTransfer.files.length > 0) {
                const archivo = evento.dataTransfer.files[0];
                procesarImagen(archivo, indice);
            }
        });
        
        // 4. CUANDO HACEMOS CLICK EN EL ÁREA
        area.addEventListener('click', () => {
            // Crear un input invisible para seleccionar archivos
            const selector = document.createElement('input');
            selector.type = 'file';
            selector.accept = 'image/*';
            
            // Cuando selecciona un archivo
            selector.onchange = (evento) => {
                if (evento.target.files.length > 0) {
                    const archivo = evento.target.files[0];
                    procesarImagen(archivo, indice);
                }
            };
            
            // Abrir el selector de archivos
            selector.click();
        });
    });
}

// ========================================================================
// PASO 3: PROCESAR LA IMAGEN (CONVERTIR A BASE64)
// ========================================================================
function procesarImagen(archivo, posicion) {
    // Verificar que sea una imagen
    if (!archivo.type.startsWith('image/')) {
        alert('⚠️ Por favor selecciona una imagen');
        return;
    }
    
    // Verificar que no sea muy grande (máximo 5MB)
    const tamañoMaximo = 5 * 1024 * 1024; // 5MB en bytes
    if (archivo.size > tamañoMaximo) {
        alert('⚠️ La imagen es muy grande. Máximo 5MB');
        return;
    }
    
    // Leer el archivo y convertir a base64
    const lector = new FileReader();
    
    lector.onload = function(evento) {
        const imagenBase64 = evento.target.result;
        
        // Guardar la imagen en nuestro objeto
        if (posicion === 0) {
            imagenes.principal = imagenBase64;
            console.log('✓ Imagen principal cargada');
        } else {
            imagenes.miniatura = imagenBase64;
            console.log('✓ Imagen miniatura cargada');
        }
        
        // Mostrar vista previa
        mostrarVistaPreviaImagen(posicion, imagenBase64, archivo.name);
    };
    
    lector.readAsDataURL(archivo);
}

// ========================================================================
// PASO 4: MOSTRAR LA IMAGEN EN LA PÁGINA
// ========================================================================
function mostrarVistaPreviaImagen(posicion, imagenBase64, nombreArchivo) {
    const areas = document.querySelectorAll('.area-soltar');
    
    // Reemplazar el contenido del área con la imagen
    areas[posicion].innerHTML = `
        <img src="${imagenBase64}" 
             style="max-width: 100%; max-height: 200px; object-fit: contain;">
        <p style="margin-top: 10px; font-size: 12px; color: #666;">
            ✓ ${nombreArchivo}
        </p>
    `;
}

// ========================================================================
// PASO 5: CONFIGURAR LOS BOTONES (GUARDAR Y CANCELAR)
// ========================================================================
function configurarBotones() {
    // Encontrar el botón de guardar
    const botonGuardar = document.querySelector('.btn-save');
    if (botonGuardar) {
        botonGuardar.addEventListener('click', guardarProducto);
        console.log('✓ Botón Guardar configurado');
    }
    
    // Encontrar el botón de cancelar
    const botonCancelar = document.querySelector('.btn-cancel');
    if (botonCancelar) {
        botonCancelar.addEventListener('click', cancelarProducto);
        console.log('✓ Botón Cancelar configurado');
    }
}

// ========================================================================
// PASO 6: GUARDAR EL PRODUCTO
// ========================================================================
function guardarProducto(evento) {
    evento.preventDefault();
    
    console.log('--- Guardando producto ---');
    
    // PASO 6.1: Obtener los datos del formulario
    const inputs = document.querySelectorAll('.grupo-entrada input');
    
    const categoria = inputs[0].value.trim();
    const marca = inputs[1].value.trim();
    const precio = inputs[2].value.trim();
    const descripcion = inputs[3].value.trim();
    const formato = inputs[4].value.trim();
    
    console.log('Datos ingresados:', {categoria, marca, precio, descripcion, formato});
    
    // PASO 6.2: Validar que todos los campos estén completos
    if (!categoria || !marca || !precio || !descripcion || !formato) {
        alert('⚠️ Error: Debes completar TODOS los campos');
        return;
    }
    
    // PASO 6.3: Validar que el precio sea un número válido
    const precioNumero = parseFloat(precio);
    if (isNaN(precioNumero) || precioNumero <= 0) {
        alert('⚠️ Error: El precio debe ser un número válido mayor que 0');
        return;
    }
    
    // PASO 6.4: Validar que las imágenes estén cargadas
    if (!imagenes.principal) {
        alert('⚠️ Error: Debes cargar una imagen principal');
        return;
    }
    
    if (!imagenes.miniatura) {
        alert('⚠️ Error: Debes cargar una imagen en miniatura');
        return;
    }
    
    // PASO 6.5: Crear el objeto producto
    const nuevoProducto = {
        id: 'PROD_' + Date.now(),                    // ID único basado en fecha
        categoria: categoria,                         // Categoría del producto
        marca: marca,                                 // Marca del producto
        nombre_producto: marca + ' - ' + categoria,  // Nombre descriptivo
        precio: precioNumero,                         // Precio como número
        descripcion: descripcion,                     // Descripción del producto
        formato: formato,                             // Formato/presentación
        imagen_principal: imagenes.principal,        // Imagen principal en base64
        imagen_miniatura: [imagenes.principal, imagenes.miniatura], // Array de imágenes
        puntuacion: '5',                              // Puntuación inicial
        opiniones: '0',                               // Número de opiniones
        comentarios: []                               // Array de comentarios
    };
    
    console.log('Producto creado:', nuevoProducto.id);
    
    // PASO 6.6: Enviar el producto al servidor
    enviarProductoAlServidor(nuevoProducto);
}

// ========================================================================
// PASO 7: ENVIAR PRODUCTO AL SERVIDOR
// ========================================================================
function enviarProductoAlServidor(producto) {
    console.log('Enviando producto al servidor...');
    
    // Usar fetch para enviar el producto
    fetch(API_URL, {
        method: 'POST',                          // Método: POST (crear nuevo)
        headers: {
            'Content-Type': 'application/json'   // Decir que enviamos JSON
        },
        body: JSON.stringify(producto)           // Convertir objeto a JSON
    })
    .then(respuesta => {
        console.log('Respuesta del servidor:', respuesta.status);
        
        // Verificar si la respuesta es correcta
        if (!respuesta.ok) {
            throw new Error('Error ' + respuesta.status);
        }
        
        return respuesta.json();
    })
    .then(datos => {
        // ¡Éxito! El producto se guardó
        console.log('✓ Producto guardado exitosamente');
        alert('✓ ¡Producto guardado exitosamente!');
        
        // Limpiar el formulario
        limpiarFormulario();
        
        // Redirigir al panel después de 2 segundos
        setTimeout(() => {
            window.location.href = 'panel_del_admin.html';
        }, 2000);
    })
    .catch(error => {
        // Algo salió mal
        console.error('✗ Error al guardar:', error);
        alert('✗ Error al guardar el producto\n\nVerifica que:\n1. El servidor esté corriendo\n2. La dirección sea http://localhost:3000');
    });
}

// ========================================================================
// PASO 8: CANCELAR LA OPERACIÓN
// ========================================================================
function cancelarProducto(evento) {
    evento.preventDefault();
    
    // Preguntar si está seguro
    const confirmacion = confirm('¿Estás seguro?\nSe borrarán todos los datos del formulario');
    
    if (confirmacion) {
        limpiarFormulario();
        window.location.href = 'panel_del_admin.html';
    }
}

// ========================================================================
// PASO 9: LIMPIAR EL FORMULARIO
// ========================================================================
function limpiarFormulario() {
    console.log('Limpiando formulario...');
    
    // Limpiar los inputs de texto
    const inputs = document.querySelectorAll('.grupo-entrada input');
    inputs.forEach(input => {
        input.value = '';
    });
    
    // Limpiar las imágenes guardadas
    imagenes.principal = null;
    imagenes.miniatura = null;
    
    // Restaurar las áreas a su estado original
    const areas = document.querySelectorAll('.area-soltar');
    areas.forEach(area => {
        area.style.backgroundColor = '';
        area.innerHTML = `
            <div class="img-placeholder">🖼️</div>
            <p>Arrastra tu imagen aquí o <span>haz click para seleccionar</span></p>
        `;
    });
    
    console.log('✓ Formulario limpiado');
}