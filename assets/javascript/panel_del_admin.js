// URL directa de tu servidor JSON Server
const BASE_URL = 'http://localhost:3000/products';

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});

async function cargarProductos() {
    try {
        const respuesta = await fetch(BASE_URL);
        if (!respuesta.ok) throw new Error("No se pudo conectar con el servidor");
        
        const productos = await respuesta.json();
        renderizarProductos(productos);
    } catch (error) {
        console.error("Error cargando productos:", error);
        document.getElementById('productos-lista').innerHTML = 
            `<p style="padding:2rem; text-align:center;">Error: Asegúrate de que JSON Server esté activo en el puerto 3000.</p>`;
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

// Aliamos la función para que idioma.js pueda refrescar la lista al cambiar idioma
window.mostrarProductos = cargarProductos;

function crearCardProducto(prod) {
    const lang = window.idiomaActual || 'es';
    // Manejo de nombres que pueden ser String u Objetos (idiomas)
    const nombre = typeof prod.nombre_producto === 'object' ? prod.nombre_producto[lang] : prod.nombre_producto;
    const descripcion = typeof prod.descripcion === 'object' ? prod.descripcion[lang] : prod.descripcion;
    const categoriaLabel = typeof prod.categoria === 'object' ? prod.categoria[lang] : prod.categoria;

    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
        <div class="product-row">
            <img src="${prod.imagen_principal}" alt="${nombre}" class="product-img">
            <div class="product-info">
                <h3>${nombre}</h3>
                <p>${prod.marca} | ${categoriaLabel}</p>
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
            <h2 class="form-title">Edición de producto</h2>
            <div class="form-grid">
                <div class="input-group">
                    <label>Nombre (ES):</label>
                    <input type="text" id="edit-nombre-${prod.id}" value="${nombre}">
                </div>
                <div class="input-group">
                    <label>Precio:</label>
                    <input type="number" step="0.01" id="edit-precio-${prod.id}" value="${prod.precio}">
                </div>
                <div class="input-group">
                    <label>Marca:</label>
                    <input type="text" id="edit-marca-${prod.id}" value="${prod.marca}">
                </div>
                <div class="input-group">
                    <label>Descripción (ES):</label>
                    <textarea id="edit-desc-${prod.id}" rows="3">${descripcion}</textarea>
                </div>
                <div class="input-group">
                    <label>Formato:</label>
                    <input type="text" id="edit-descformato-${prod.id}" value="${prod.descripcion_formato || ''}">
                </div>
            </div>

            <div class="final-controls">
                <button class="btn-main btn-save" onclick="guardarCambios('${prod.id}')">Guardar Cambios</button>
                <button class="btn-main btn-cancel" onclick="toggleEdicion('${prod.id}')">Cancelar</button>
            </div>
        </div>
    `;
    return div;
}

function toggleEdicion(id) {
    const form = document.getElementById(`form-edit-${id}`);
    form.style.display = (form.style.display === 'none') ? 'block' : 'none';
}

function toggleVisibilidad(boton) {
    const icono = boton.querySelector('i');
    if (icono.classList.contains('fa-eye')) {
        icono.classList.replace('fa-eye', 'fa-eye-slash');
        boton.classList.add('inactive');
    } else {
        icono.classList.replace('fa-eye-slash', 'fa-eye');
        boton.classList.remove('inactive');
    }
}

async function guardarCambios(id) {
    // Obtenemos los valores de los inputs
    const nuevoNombre = document.getElementById(`edit-nombre-${id}`).value;
    const nuevoPrecio = parseFloat(document.getElementById(`edit-precio-${id}`).value);
    const nuevaMarca = document.getElementById(`edit-marca-${id}`).value;
    const nuevaDesc = document.getElementById(`edit-desc-${id}`).value;

    // Preparamos el objeto (manteniendo la estructura de idioma si es necesario)
    const actualizacion = {
        nombre_producto: { es: nuevoNombre }, 
        precio: nuevoPrecio,
        marca: nuevaMarca,
        descripcion: { es: nuevaDesc }
    };

    try {
        const respuesta = await fetch(`${BASE_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actualizacion)
        });

        if (respuesta.ok) {
            alert("Producto actualizado en el servidor.");
            cargarProductos();
        }
    } catch (error) {
        alert("Error al guardar en el servidor.");
    }
}

async function eliminarProducto(id) {
    if (confirm("¿Eliminar definitivamente este producto de la base de datos?")) {
        try {
            const respuesta = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
            if (respuesta.ok) cargarProductos();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
}