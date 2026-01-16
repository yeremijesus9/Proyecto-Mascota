const BASE_URL = 'http://localhost:3000/products';

// Función para convertir archivos a Base64
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});

async function cargarProductos() {
    try {
        const respuesta = await fetch(BASE_URL);
        if (!respuesta.ok) throw new Error("No se pudo conectar");
        const productos = await respuesta.json();
        renderizarProductos(productos);
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('productos-lista').innerHTML = `<p>Error de conexión con el servidor.</p>`;
    }
}

function renderizarProductos(productos) {
    const contenedor = document.getElementById('productos-lista');
    contenedor.innerHTML = `
        <div class="table-header">
            <span>Imagen</span>
            <span>Producto</span>
            <span class="text-center">Precio</span>
            <span class="text-center">Acciones</span>
        </div>
    `;
    productos.forEach(prod => contenedor.appendChild(crearCardProducto(prod)));
}

function crearCardProducto(prod) {
    const lang = window.idiomaActual || 'es';
    
    // Fallbacks para datos bilingües (Extraemos ES y EN)
    const nES = prod.nombre_producto?.es || prod.nombre_producto || "";
    const nEN = prod.nombre_producto?.en || "";
    const dES = prod.descripcion?.es || prod.descripcion || "";
    const dEN = prod.descripcion?.en || "";
    const fES = prod.formato?.es || prod.formato || "";
    const fEN = prod.formato?.en || "";

    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
        <div class="product-row">
            <img src="${prod.imagen_principal}" class="product-img" id="display-img-${prod.id}">
            <div class="product-info">
                <h3>${nES}</h3>
                <p>${prod.marca} | ${prod.categoria?.es || prod.categoria}</p>
            </div>
            <div class="product-price">${prod.precio} €</div>
            <div class="product-actions">
                <button class="action-btn" onclick="toggleEdicion('${prod.id}')"><i class="fas fa-pen"></i></button>
                <button class="action-btn" onclick="eliminarProducto('${prod.id}')"><i class="fas fa-trash"></i></button>
                <button class="action-btn" onclick="toggleVisibilidad(this)"><i class="fas fa-eye"></i></button>
            </div>
        </div>
        
        <div id="form-edit-${prod.id}" class="edit-form" style="display:none;">
            <div class="form-grid">
                <div class="input-group"><b>Nombre (ES):</b><input type="text" id="edit-n-es-${prod.id}" value="${nES}"></div>
                <div class="input-group"><b>Nombre (EN):</b><input type="text" id="edit-n-en-${prod.id}" value="${nEN}"></div>
                <div class="input-group"><b>Precio:</b><input type="number" step="0.01" id="edit-p-${prod.id}" value="${prod.precio}"></div>
                <div class="input-group"><b>Marca:</b><input type="text" id="edit-m-${prod.id}" value="${prod.marca}"></div>
                <div class="input-group"><b>Formato (ES):</b><input type="text" id="edit-f-es-${prod.id}" value="${fES}"></div>
                <div class="input-group"><b>Formato (EN):</b><input type="text" id="edit-f-en-${prod.id}" value="${fEN}"></div>
                <div class="input-group"><b>Desc. Formato:</b><input type="text" id="edit-df-${prod.id}" value="${prod.descripcion_formato || ''}"></div>
                
                <div class="input-group" style="grid-column: 1 / -1;"><b>Descripción (ES):</b><textarea id="edit-d-es-${prod.id}">${dES}</textarea></div>
                <div class="input-group" style="grid-column: 1 / -1;"><b>Descripción (EN):</b><textarea id="edit-d-en-${prod.id}">${dEN}</textarea></div>

                <div class="image-section" style="grid-column: 1 / -1; padding-top: 1rem; border-top: 1px solid #ddd;">
                    <h4>Imagen Principal</h4>
                    <img src="${prod.imagen_principal}" id="prev-main-${prod.id}" style="width:80px; height:80px; object-fit:cover; border-radius:5px;">
                    <input type="file" accept="image/*" onchange="cambiarImagenPrincipal(this, '${prod.id}')">

                    <h4>Miniaturas (Galería)</h4>
                    <div id="minis-container-${prod.id}" style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px;">
                        ${(prod.imagen_miniatura || []).map(img => `
                            <div class="mini-box" style="position:relative;">
                                <img src="${img}" style="width:50px; height:50px; object-fit:cover;">
                                <button onclick="this.parentElement.remove()" style="position:absolute; top:-5px; right:-5px; background:red; color:white; border:none; border-radius:50%; cursor:pointer;">×</button>
                            </div>
                        `).join('')}
                    </div>
                    <input type="file" multiple accept="image/*" onchange="agregarMiniaturas(this, '${prod.id}')">
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

// Funciones para previsualizar imágenes del equipo
async function cambiarImagenPrincipal(input, id) {
    if (input.files && input.files[0]) {
        const base64 = await toBase64(input.files[0]);
        document.getElementById(`prev-main-${id}`).src = base64;
    }
}

async function agregarMiniaturas(input, id) {
    const container = document.getElementById(`minis-container-${id}`);
    for (const file of input.files) {
        const base64 = await toBase64(file);
        const div = document.createElement('div');
        div.className = 'mini-box';
        div.style.position = 'relative';
        div.innerHTML = `
            <img src="${base64}" style="width:50px; height:50px; object-fit:cover;">
            <button onclick="this.parentElement.remove()" style="position:absolute; top:-5px; right:-5px; background:red; color:white; border:none; border-radius:50%; cursor:pointer;">×</button>
        `;
        container.appendChild(div);
    }
}

async function guardarCambios(id) {
    // Recopilar miniaturas actuales
    const miniaturas = Array.from(document.querySelectorAll(`#minis-container-${id} img`)).map(img => img.src);

    const actualizacion = {
        nombre_producto: {
            es: document.getElementById(`edit-n-es-${id}`).value,
            en: document.getElementById(`edit-n-en-${id}`).value
        },
        descripcion: {
            es: document.getElementById(`edit-d-es-${id}`).value,
            en: document.getElementById(`edit-d-en-${id}`).value
        },
        formato: {
            es: document.getElementById(`edit-f-es-${id}`).value,
            en: document.getElementById(`edit-f-en-${id}`).value
        },
        precio: parseFloat(document.getElementById(`edit-p-${id}`).value),
        marca: document.getElementById(`edit-m-${id}`).value,
        descripcion_formato: document.getElementById(`edit-df-${id}`).value,
        imagen_principal: document.getElementById(`prev-main-${id}`).src,
        imagen_miniatura: miniaturas
    };

    try {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actualizacion)
        });
        if (res.ok) {
            alert("¡Servidor actualizado!");
            cargarProductos();
        }
    } catch (e) { alert("Error al guardar."); }
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

async function eliminarProducto(id) {
    if (confirm("¿Eliminar de la base de datos?")) {
        await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
        cargarProductos();
    }
}