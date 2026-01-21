// ============================================================
// NUEVO PRODUCTO - Crear y Guardar Mascotas en la Base de Datos
// ============================================================
// Este archivo ayuda a guardar nuevos productos (mascotas) en db.json
// Tiene funciones para: subir imágenes, validar datos y guardar en el servidor

// PASO 1: Guardar la URL donde está el servidor

// La dirección donde guardaremos todo.(Nuestra base de datos)
const URL_SERVIDOR = 'http://localhost:3000/products';

// PASO 2: Guardar las imágenes en variables

// Aquí guardamos temporalmente las imágenes que sube el administrador
const imagenes = {
    principal: null,      // La imagen grande
    miniatura: null       // La imagen pequeña
};

// PASO 3: El evento le dice que espere a cargar toda la página

// Cuando termina de cargar, ejecutamos las funciones de configuración
document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ Página cargada - Iniciando configuración...');
    configurarImagenes();
    configurarBotones();
});

// ============================================================
// PASO 4: CONFIGURAR ARRASTRAR Y SOLTAR IMÁGENES
// ============================================================
function configurarImagenes() {
    // Encontrar todas las áreas donde se pueden soltar imágenes
    const areas = document.querySelectorAll('.area-soltar');
    
    // Para cada área, agregamos los eventos
    areas.forEach((area, numero) => {
        // Definir si es la imagen principal (primera) o miniatura (segunda)
        const esPrincipal = numero === 0;
        
        // Agregar eventos para arrastrar. 
        area.addEventListener('dragenter', evitarDefecto);
        area.addEventListener('dragover', evitarDefecto);
        area.addEventListener('dragleave', removerResaltado);
        area.addEventListener('drop', (evento) => soltarArchivo(evento, esPrincipal));
        
        // Resaltar cuando pasamos el mouse
        area.addEventListener('dragenter', () => resaltarArea(area));
        area.addEventListener('dragover', () => resaltarArea(area));
        
        // Permitir hacer click para seleccionar archivo
        area.addEventListener('click', () => abrirSelectorArchivos(esPrincipal));
    });
}

// PASO 5: Función para evitar comportamiento por defecto. Usamos evitarDefecto, porque por defecto, si sueltas una imagen en un navegador, este intenta abrirla. Pero no nos interesa.
function evitarDefecto(evento) {
    evento.preventDefault();
    evento.stopPropagation();
}

// PASO 6: Resaltar el área cuando pasamos imagen encima
function resaltarArea(area) {
    area.style.backgroundColor = '#e3f2fd';
    area.style.borderColor = '#2196F3';
}

// PASO 7: Remover resaltado cuando sacamos la imagen
function removerResaltado(evento) {
    // Buscar el área que se desresaltará
    const area = evento.target.closest('.area-soltar');
    if (area) {
        area.style.backgroundColor = '';
        area.style.borderColor = '';
    }
}

// PASO 8: Procesar cuando soltamos un archivo (arrastrado)
function soltarArchivo(evento, esPrincipal) {
    removerResaltado(evento);
    
    // Obtener los archivos que se soltaron
    const archivos = evento.dataTransfer.files;
    
    // Si hay archivos y es una imagen
    if (archivos.length > 0 && archivos[0].type.startsWith('image/')) {
        procesarArchivo(archivos[0], esPrincipal);
    }
}

// PASO 9: Abrir selector de archivos cuando hace click
function abrirSelectorArchivos(esPrincipal) {
    // Crear un input invisible para seleccionar archivo
    const inputArchivo = document.createElement('input');
    inputArchivo.type = 'file';
    inputArchivo.accept = 'image/*';  // Solo acepta imágenes
    
    // Cuando selecciona un archivo
    inputArchivo.addEventListener('change', (evento) => {
        if (evento.target.files.length > 0) {
            procesarArchivo(evento.target.files[0], esPrincipal);
        }
    });
    
    // Abrir el selector
    inputArchivo.click();
}

// PASO 10: Procesar el archivo (revisar tamaño y convertir a base64)
function procesarArchivo(archivo, esPrincipal) {
    // Revisar que no sea muy grande (máximo 5 MB)
    const tamanoMaximo = 5 * 1024 * 1024;  // 5 MB en bytes
    if (archivo.size > tamanoMaximo) {
        alert('⚠️ La imagen es muy grande. Máximo 5 MB');
        return;
    }
    
    // Convertir imagen a base64 (texto para guardar en JSON). Ya que al convertirlo crea una cadena de texto muy larga (Base64) que es mucho más fácil de guardar en un JSON que un archivo de imagen real.
    const lector = new FileReader();
    lector.onload = function(evento) {
        if (esPrincipal) {
            imagenes.principal = evento.target.result;
            mostrarPreview(0, evento.target.result, archivo.name);
        } else {
            imagenes.miniatura = evento.target.result;
            mostrarPreview(1, evento.target.result, archivo.name);
        }
        console.log('✓ Imagen cargada:', archivo.name);
    };
    lector.readAsDataURL(archivo);
}

// PASO 11: Mostrar vista previa de la imagen
function mostrarPreview(numero, datosImagen, nombreArchivo) {
    const areas = document.querySelectorAll('.area-soltar');
    
    // Limpiar el área y mostrar la imagen
    areas[numero].innerHTML = `
        <img src="${datosImagen}" 
             style="max-width: 100%; max-height: 200px; object-fit: contain;">
        <p style="margin-top: 10px; font-size: 12px; color: #666;">
            📁 ${nombreArchivo}
        </p>
    `;
}

// ============================================================
// PASO 12: CONFIGURAR BOTONES (GUARDAR Y CANCELAR)
// ============================================================
function configurarBotones() {
    // Encontrar todos los botones
    const botones = document.querySelectorAll('button');
    
    // Agregar eventos a cada botón
    botones.forEach(boton => {
        if (boton.classList.contains('btn-save')) {
            boton.addEventListener('click', guardarProducto);
        } else if (boton.classList.contains('btn-cancel')) {
            boton.addEventListener('click', cancelarFormulario);
        }
    });
}

// PASO 13: GUARDAR PRODUCTO - Validar datos
function guardarProducto(evento) {
    evento.preventDefault();
    console.log('🔍 Validando datos del producto...');
    
    // Obtener los valores que escribió el usuario usando IDs específicos
    const selectCategoria = document.getElementById('categoria-select');
    const nombreInput = document.getElementById('nombre-input');
    const marcaInput = document.getElementById('marca-input');
    const precioInput = document.getElementById('precio-input');
    const descripcionInput = document.getElementById('descripcion-input');
    const formatoInput = document.getElementById('formato-input');
    
    const datosProducto = {
        categoria: selectCategoria?.value.trim() || '',
        nombre: nombreInput?.value.trim() || '',
        marca: marcaInput?.value.trim() || '',
        precio: precioInput?.value.trim() || '',
        descripcion: descripcionInput?.value.trim() || '',
        formato: formatoInput?.value.trim() || ''
    };
    
    // Validación 1: ¿Escribió todos los campos?
    if (!datosProducto.categoria || !datosProducto.nombre || !datosProducto.marca || !datosProducto.precio || 
        !datosProducto.descripcion || !datosProducto.formato) {
        alert('❌ Faltan campos por llenar. Por favor completa todos los datos');
        return;
    }
    
    // Validación 2: ¿El precio es un número válido?
    if (isNaN(parseFloat(datosProducto.precio)) || parseFloat(datosProducto.precio) <= 0) {
        alert('❌ El precio debe ser un número válido mayor a 0');
        return;
    }
    
    // Validación 3: ¿Subió la imagen principal?
    if (!imagenes.principal) {
        alert('❌ Falta la imagen principal. Sube la imagen grande');
        return;
    }
    
    // Validación 4: ¿Subió la imagen miniatura?
    if (!imagenes.miniatura) {
        alert('❌ Falta la imagen en miniatura. Sube la imagen pequeña');
        return;
    }
    
    console.log('✓ Todos los datos están completos');
    
    // Crear el objeto producto con todos los datos
    // La categoría se guarda como objeto con idiomas (es, en) igual que en products
    const categoriasMap = {
        'perro': { es: 'perro', en: 'dog' },
        'gato': { es: 'gato', en: 'cat' },
        'pajaro': { es: 'pajaro', en: 'bird' },
        'roedores': { es: 'roedores', en: 'rodents' },
        'pez': { es: 'pez', en: 'fish' },
        'otros': { es: 'otros', en: 'other' }
    };
    
    // Crear nombres en ambos idiomas
    // Usar el nombre que escribió el usuario
    const nombreES = datosProducto.nombre;
    const nombreEN = datosProducto.nombre;
    
    const productoNuevo = {
        id: 'PROD' + Date.now(),
        categoria: categoriasMap[datosProducto.categoria] || { es: datosProducto.categoria, en: datosProducto.categoria },
        marca: datosProducto.marca,
        nombre_producto: {
            es: nombreES,
            en: nombreEN
        },
        precio: parseFloat(datosProducto.precio),
        descripcion: {
            es: datosProducto.descripcion,
            en: datosProducto.descripcion
        },
        formato: {
            es: 'Formato',
            en: 'Format'
        },
        descripcion_formato: datosProducto.formato,
        imagen_principal: imagenes.principal,
        imagen_miniatura: [imagenes.principal, imagenes.miniatura],
        puntuacion: '5',
        opiniones: '0',
        comentarios: []
    };
    
    // Enviar producto al servidor
    enviarAlServidor(productoNuevo);
}

// PASO 14: ENVIAR PRODUCTO AL SERVIDOR
function enviarAlServidor(producto) {
    console.log('📤 Enviando producto al servidor...');
    
    // Usar fetch para hacer una petición POST
    fetch(URL_SERVIDOR, {
        method: 'POST',                    // Método POST = crear algo nuevo
        headers: {
            'Content-Type': 'application/json'  // Enviar como JSON
        },
        body: JSON.stringify(producto)     // Convertir objeto a JSON
    })
    .then(respuesta => {
        // Revisar si la respuesta fue exitosa
        if (!respuesta.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return respuesta.json();
    })
    .then(datos => {
        // Si todo fue bien, mostrar mensaje
        console.log('✓ Producto guardado en el servidor:', datos);
        alert('✅ ¡Producto guardado exitosamente!');
        limpiarFormulario();
        
        // Redirigir al panel de administrador después de 1.5 segundos
        setTimeout(() => {
            window.location.href = 'panel_del_admin.html';
        }, 1500);
    })
    .catch(error => {
        // Si hay error, mostrar en consola y al usuario
        console.error('❌ Error al guardar:', error);
        alert('❌ No se pudo guardar el producto. Verifica que el servidor esté corriendo en:\nhttp://localhost:3000');
    });
}

// PASO 15: CANCELAR FORMULARIO
function cancelarFormulario(evento) {
    evento.preventDefault();
    
    // Preguntar si está seguro
    if (confirm('¿Seguro que deseas cancelar? Se perderán todos los datos')) {
        limpiarFormulario();
        window.location.href = 'panel_del_admin.html';
    }
}

// PASO 16: LIMPIAR FORMULARIO (vaciar campos e imágenes)
function limpiarFormulario() {
    console.log('🧹 Limpiando formulario...');
    
    // Limpiar todos los inputs de texto usando IDs específicos
    document.getElementById('marca-input').value = '';
    document.getElementById('precio-input').value = '';
    document.getElementById('descripcion-input').value = '';
    document.getElementById('formato-input').value = '';
    document.getElementById('categoria-select').value = '';
    
    // Limpiar las imágenes guardadas
    imagenes.principal = null;
    imagenes.miniatura = null;
    
    // Restaurar las áreas de soltar a su estado original
    const areas = document.querySelectorAll('.area-soltar');
    areas.forEach(area => {
        area.innerHTML = `
            <div class="img-placeholder">🖼️</div>
            <p>Arrastra tu imagen aquí o <span>haz click para seleccionar</span></p>
        `;
        area.style.backgroundColor = '';
        area.style.borderColor = '';
    });
    
    console.log('✓ Formulario limpio');
}