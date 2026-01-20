// ==========================================
// NUEVO PRODUCTO - Agregar y Guardar en BD
// ==========================================

// API URL del servidor JSON
const API_URL = 'http://localhost:3000/nuevos_productos';

// Estado de las imágenes
const imageState = {
    mainImage: null,
    thumbnailImage: null
};

// Esperar a que cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
    setupFormListeners();
});

// ==========================================
// CONFIGURAR LISTENERS
// ==========================================
function setupFormListeners() {
    const inputGroups = document.querySelectorAll('.input-group input');
    setupDragAndDrop();
    setupButtonListeners();
}

// ==========================================
// DRAG AND DROP PARA IMÁGENES
// ==========================================
function setupDragAndDrop() {
    const dropAreas = document.querySelectorAll('.drop-area');
    
    dropAreas.forEach((dropArea, index) => {
        const isMainImage = index === 0;
        
        // Eventos de drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => highlight(dropArea), false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => unhighlight(dropArea), false);
        });
        
        dropArea.addEventListener('drop', (e) => handleDrop(e, isMainImage), false);
        
        // Click para seleccionar archivo
        dropArea.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFile(e.target.files[0], isMainImage);
                }
            });
            fileInput.click();
        });
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(element) {
    element.style.backgroundColor = '#f0f0f0';
    element.style.borderColor = '#007bff';
}

function unhighlight(element) {
    element.style.backgroundColor = '';
    element.style.borderColor = '';
}

function handleDrop(e, isMainImage) {
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        handleFile(files[0], isMainImage);
    }
}

function handleFile(file, isMainImage) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('El archivo es demasiado grande. Máximo 5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        if (isMainImage) {
            imageState.mainImage = e.target.result;
            updateImagePreview(0, e.target.result, file.name);
        } else {
            imageState.thumbnailImage = e.target.result;
            updateImagePreview(1, e.target.result, file.name);
        }
    };
    reader.readAsDataURL(file);
}

function updateImagePreview(index, imageData, fileName) {
    const dropAreas = document.querySelectorAll('.drop-area');
    dropAreas[index].innerHTML = `
        <img src="${imageData}" style="max-width: 100%; max-height: 200px; object-fit: contain;">
        <p style="margin-top: 10px; font-size: 12px; color: #666;">${fileName}</p>
    `;
}

// ==========================================
// BUTTON LISTENERS - GUARDAR Y CANCELAR
// ==========================================
function setupButtonListeners() {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        if (button.classList.contains('btn-save')) {
            button.addEventListener('click', handleSaveProduct);
        } else if (button.classList.contains('btn-cancel')) {
            button.addEventListener('click', handleCancel);
        }
    });
}

// ==========================================
// MANEJAR GUARDAR PRODUCTO
// ==========================================
function handleSaveProduct(e) {
    e.preventDefault();
    
    // Obtener datos de los inputs
    const inputs = document.querySelectorAll('.input-group input');
    const formData = {
        categoria: inputs[0]?.value.trim() || '',
        marca: inputs[1]?.value.trim() || '',
        precio: inputs[2]?.value.trim() || '',
        descripcion: inputs[3]?.value.trim() || '',
        formato: inputs[4]?.value.trim() || ''
    };
    
    // Validar
    if (!formData.categoria || !formData.marca || !formData.precio || 
        !formData.descripcion || !formData.formato) {
        alert('Por favor completa todos los campos de texto');
        return;
    }
    
    if (isNaN(parseFloat(formData.precio)) || parseFloat(formData.precio) <= 0) {
        alert('El precio debe ser un número válido mayor a 0');
        return;
    }
    
    if (!imageState.mainImage) {
        alert('Por favor carga una imagen principal');
        return;
    }
    
    if (!imageState.thumbnailImage) {
        alert('Por favor carga una imagen en miniatura');
        return;
    }
    
    // Crear objeto producto
    const newProduct = {
        id: 'PROD' + Date.now(),
        categoria: formData.categoria,
        marca: formData.marca,
        nombre_producto: formData.categoria + ' ' + formData.marca,
        precio: parseFloat(formData.precio),
        descripcion: formData.descripcion,
        formato: formData.formato,
        imagen_principal: imageState.mainImage,
        imagen_miniatura: [imageState.mainImage, imageState.thumbnailImage],
        puntuacion: '5',
        opiniones: '0',
        comentarios: []
    };
    
    // Guardar en el servidor
    guardarProducto(newProduct);
}

// ==========================================
// GUARDAR PRODUCTO EN LA BD
// ==========================================
function guardarProducto(producto) {
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(producto)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        console.log('Producto guardado:', data);
        alert('✓ Producto guardado exitosamente');
        resetForm();
        
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
function handleCancel(e) {
    e.preventDefault();
    
    if (confirm('¿Estás seguro de que deseas cancelar? Se perderán todos los datos.')) {
        resetForm();
        window.location.href = 'panel_del_admin.html';
    }
}

// ==========================================
// LIMPIAR FORMULARIO
// ==========================================
function resetForm() {
    // Limpiar inputs
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => input.value = '');
    
    // Limpiar imágenes
    imageState.mainImage = null;
    imageState.thumbnailImage = null;
    
    // Restaurar vistas previas
    const dropAreas = document.querySelectorAll('.drop-area');
    dropAreas.forEach(dropArea => {
        dropArea.innerHTML = `
            <div class="img-placeholder">🖼️</div>
            <p>Arrastra tu imagen aquí o <span>haz click para seleccionar</span></p>
        `;
    });
}