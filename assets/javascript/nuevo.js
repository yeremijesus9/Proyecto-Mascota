// ==========================================
// NUEVO PRODUCTO - Gestión de Formulario
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeNewProductForm();
});

// Estado de las imágenes
const imageState = {
    mainImage: null,
    thumbnailImage: null
};

// ==========================================
// INICIALIZACIÓN
// ==========================================
function initializeNewProductForm() {
    setupDragAndDrop();
    setupFormListeners();
    setupButtonListeners();
}

// ==========================================
// DRAG AND DROP
// ==========================================
function setupDragAndDrop() {
    const dropAreas = document.querySelectorAll('.drop-area');
    
    dropAreas.forEach((dropArea, index) => {
        const isMainImage = index === 0;
        
        // Prevenir el comportamiento predeterminado del navegador
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        // Resaltar el área al pasar el archivo
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => highlight(dropArea), false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => unhighlight(dropArea), false);
        });
        
        // Manejar la liberación del archivo
        dropArea.addEventListener('drop', (e) => handleDrop(e, isMainImage), false);
        
        // Hacer clickeable el área de drop
        dropArea.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (files.length > 0) {
                    handleFile(files[0], isMainImage);
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
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            handleFile(file, isMainImage);
        } else {
            alert('Por favor, selecciona una imagen válida');
        }
    }
}

function handleFile(file, isMainImage) {
    // Validar tamaño de archivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('El archivo es demasiado grande. Máximo 5MB');
        return;
    }
    
    // Leer el archivo como URL de datos
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        if (isMainImage) {
            imageState.mainImage = {
                file: file,
                data: imageData
            };
            updateImagePreview(0, imageData, file.name);
        } else {
            imageState.thumbnailImage = {
                file: file,
                data: imageData
            };
            updateImagePreview(1, imageData, file.name);
        }
    };
    reader.readAsDataURL(file);
}

function updateImagePreview(index, imageData, fileName) {
    const dropAreas = document.querySelectorAll('.drop-area');
    const dropArea = dropAreas[index];
    
    // Limpiar el contenido previo
    dropArea.innerHTML = `
        <img src="${imageData}" style="max-width: 100%; max-height: 200px; object-fit: contain;">
        <p style="margin-top: 10px; font-size: 12px; color: #666;">${fileName}</p>
    `;
}

// ==========================================
// FORM LISTENERS
// ==========================================
function setupFormListeners() {
    // Aquí puedes agregar validación en tiempo real si es necesario
}

// ==========================================
// BUTTON LISTENERS
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
// MANEJO DEL FORMULARIO
// ==========================================
function getFormData() {
    const inputs = document.querySelectorAll('.input-group input');
    const formData = {
        categoria: inputs[0]?.value || '',
        marca: inputs[1]?.value || '',
        precio: inputs[2]?.value || '',
        descripcion: inputs[3]?.value || '',
        formato: inputs[4]?.value || '',
        mainImage: imageState.mainImage,
        thumbnailImage: imageState.thumbnailImage
    };
    return formData;
}

function validateForm(formData) {
    const errors = [];
    
    if (!formData.categoria.trim()) {
        errors.push('La categoría es requerida');
    }
    
    if (!formData.marca.trim()) {
        errors.push('La marca es requerida');
    }
    
    if (!formData.precio.trim()) {
        errors.push('El precio es requerido');
    } else if (isNaN(parseFloat(formData.precio))) {
        errors.push('El precio debe ser un número válido');
    }
    
    if (!formData.descripcion.trim()) {
        errors.push('La descripción es requerida');
    }
    
    if (!formData.formato.trim()) {
        errors.push('El formato es requerido');
    }
    
    if (!formData.mainImage) {
        errors.push('La imagen principal es requerida');
    }
    
    if (!formData.thumbnailImage) {
        errors.push('La imagen en miniatura es requerida');
    }
    
    return errors;
}

function handleSaveProduct(e) {
    e.preventDefault();
    
    const formData = getFormData();
    const errors = validateForm(formData);
    
    if (errors.length > 0) {
        alert('Por favor, completa todos los campos:\n\n' + errors.join('\n'));
        return;
    }
    
    // Crear objeto de producto
    const newProduct = {
        id: Date.now(),
        categoria: formData.categoria,
        marca: formData.marca,
        precio: parseFloat(formData.precio),
        descripcion: formData.descripcion,
        formato: formData.formato,
        mainImage: formData.mainImage.data,
        thumbnailImage: formData.thumbnailImage.data,
        fechaCreacion: new Date().toISOString()
    };
    
    // Guardar en localStorage o enviar al servidor
    saveProductToServer(newProduct);
}

function saveProductToServer(product) {
    // Opción 2: Enviar al servidor
    fetch('http://localhost:3000/productos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Producto guardado:', data);
        alert('¡Producto guardado exitosamente!');
        resetForm();
        
        // Redirigir al panel del admin después de guardar
        setTimeout(() => {
            window.location.href = 'panel_del_admin.html';
        }, 1500);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al guardar el producto. Verifica que el servidor esté ejecutándose.');
    });
}

function handleCancel(e) {
    e.preventDefault();
    
    if (confirm('¿Estás seguro de que deseas cancelar? Se perderán todos los datos.')) {
        resetForm();
        window.location.href = 'panel_del_admin.html';
    }
}

function resetForm() {
    // Limpiar inputs de texto
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => input.value = '');
    
    // Limpiar imágenes
    imageState.mainImage = null;
    imageState.thumbnailImage = null;
    
    // Restaurar vista previa de imágenes
    const dropAreas = document.querySelectorAll('.drop-area');
    dropAreas.forEach(dropArea => {
        dropArea.innerHTML = `
            <div class="img-placeholder">🖼️</div>
            <p>Arrastra tu imagen aquí o <span>haz click para seleccionar</span></p>
        `;
    });
}

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// Función para obtener productos del localStorage
function getAllProducts() {
    try {
        return JSON.parse(localStorage.getItem('productos')) || [];
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return [];
    }
}

// Función para eliminar un producto
function deleteProduct(productId) {
    try {
        let products = getAllProducts();
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('productos', JSON.stringify(products));
        return true;
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return false;
    }
}

// Función para actualizar un producto
function updateProduct(productId, updatedData) {
    try {
        let products = getAllProducts();
        const index = products.findIndex(p => p.id === productId);
        
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedData };
            localStorage.setItem('productos', JSON.stringify(products));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        return false;
    }
}
