document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});

async function cargarProductos() {
    try {
        const url = window.rutaJson(); 
        const respuesta = await fetch(url);
        const data = await respuesta.json();
        const productos = data.productos || data; 
        renderizarProductos(productos);
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

function renderizarProductos(productos) {
    const contenedor = document.getElementById('productos-lista');
    contenedor.innerHTML = `
        <div class="table-header">
            <span>Imagen</span>
            <span></span>
            <span class="text-center">Precio</span>
            <span class="text-center">Acciones</span>
        </div>
    `;

    productos.forEach(producto => {
        const card = crearCardProducto(producto);
        contenedor.appendChild(card);
    });
}

function crearCardProducto(prod) {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
        <div class="product-row">
            <img src="${prod.imagen_principal}" alt="${prod.nombre_producto}" class="product-img">
            <div class="product-info">
                <h3>${prod.nombre_producto}</h3>
                <p>${prod.marca} | ${prod.categoria}</p>
            </div>
            <div class="product-price">${prod.precio} €</div>
            <div class="product-actions">
                <button class="action-btn" title="Editar" onclick="toggleEdicion('${prod.id}')">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="action-btn" title="Eliminar" onclick="eliminarProducto('${prod.id}')">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="action-btn" title="Visibilidad" onclick="toggleVisibilidad(this)">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
        
        <div id="form-edit-${prod.id}" class="edit-form" style="display:none;">
            <h2 class="form-title">Edicion de productos</h2>
            <div class="form-grid">
                <div class="input-group">
                    <label>Categoria:</label>
                    <input type="text" id="edit-cat-${prod.id}" value="${prod.categoria}">
                </div>
                <div class="input-group">
                    <label>Marca:</label>
                    <input type="text" id="edit-marca-${prod.id}" value="${prod.marca}">
                </div>
                <div class="input-group">
                    <label>Nombre producto:</label>
                    <input type="text" id="edit-nombre-${prod.id}" value="${prod.nombre_producto}">
                </div>
                <div class="input-group">
                    <label>Precio:</label>
                    <input type="text" id="edit-precio-${prod.id}" value="${prod.precio}">
                </div>
                <div class="input-group">
                    <label>Descripcion:</label>
                    <textarea id="edit-desc-${prod.id}" rows="4">${prod.descripcion}</textarea>
                </div>
                <div class="input-group">
                    <label>Formato:</label>
                    <input type="text" id="edit-formato-${prod.id}" value="${prod.formato || ''}">
                </div>
                <div class="input-group">
                    <label>Descripcion formato:</label>
                    <input type="text" id="edit-descformato-${prod.id}" value="${prod.descripcion_formato || ''}">
                </div>
            </div>

            <div class="final-controls">
                <button class="btn-main btn-save" onclick="guardarCambios('${prod.id}')">Guardar Productos</button>
                <button class="btn-main btn-cancel" onclick="toggleEdicion('${prod.id}')">Cancelar</button>
            </div>
        </div>
    `;
    return div;
}

// Función para abrir/cerrar el formulario de edición
function toggleEdicion(id) {
    const form = document.getElementById(`form-edit-${id}`);
    form.style.display = (form.style.display === 'none') ? 'block' : 'none';
}

// Función para cambiar el icono del ojo (Visibilidad)
function toggleVisibilidad(boton) {
    const icono = boton.querySelector('i');
    if (icono.classList.contains('fa-eye')) {
        icono.classList.replace('fa-eye', 'fa-eye-slash');
        boton.classList.add('inactive'); // Clase CSS para el efecto gris
    } else {
        icono.classList.replace('fa-eye-slash', 'fa-eye');
        boton.classList.remove('inactive');
    }
}

async function guardarCambios(id) {
    const actualizacion = {
        categoria: document.getElementById(`edit-cat-${id}`).value,
        marca: document.getElementById(`edit-marca-${id}`).value,
        nombre_producto: document.getElementById(`edit-nombre-${id}`).value,
        precio: parseFloat(document.getElementById(`edit-precio-${id}`).value),
        descripcion: document.getElementById(`edit-desc-${id}`).value,
        formato: document.getElementById(`edit-formato-${id}`).value,
        descripcion_formato: document.getElementById(`edit-descformato-${id}`).value
    };

    try {
        const urlBase = `${window.RUTAS.host}:${window.RUTAS.productosPort}/productos/${id}`;
        const respuesta = await fetch(urlBase, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actualizacion)
        });

        if (respuesta.ok) {
            alert("¡Producto actualizado exitosamente!");
            cargarProductos();
        }
    } catch (error) {
        console.error("Error al actualizar:", error);
        alert("Hubo un error al intentar guardar los cambios.");
    }
}

async function eliminarProducto(id) {
    if (confirm("¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.")) {
        try {
            const urlBase = `${window.RUTAS.host}:${window.RUTAS.productosPort}/productos/${id}`;
            const respuesta = await fetch(urlBase, { method: 'DELETE' });
            
            if (respuesta.ok) {
                cargarProductos();
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
}