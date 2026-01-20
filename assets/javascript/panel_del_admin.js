/******************************************************************
 * URL base de la API REST donde se gestionan los productos
 * Se usa para GET, PUT y DELETE
 ******************************************************************/
const BASE_URL = 'http://localhost:3000/products';

/******************************************************************
 * Mapa de categorías:
 * Permite convertir la categoría en español a su equivalente en inglés
 * Se usa para autocompletar automáticamente el campo EN
 ******************************************************************/
const CATEGORIAS_MAP = {
    "gato": "cat",
    "perro": "dog",
    "pajaro": "bird",
    "roedores": "rodents",
    "pez": "fish",
    "otros": "others"
};


/******************************************************************
 * Convierte un archivo (File) a Base64
 * - Se usa para imágenes (principal y miniaturas)
 * - Retorna una Promesa
 ******************************************************************/
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

/******************************************************************
 * Al cargar el DOM se ejecuta la carga inicial de productos
 ******************************************************************/

document.addEventListener('DOMContentLoaded', cargarProductos);

/******************************************************************
 * Obtiene los productos desde la API y los renderiza
 ******************************************************************/
async function cargarProductos() {
    try {
        const respuesta = await fetch(BASE_URL);
        const productos = await respuesta.json();
        renderizarProductos(productos);
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

/******************************************************************
 * Renderiza la lista completa de productos
 ******************************************************************/

function renderizarProductos(productos) {
    const contenedor = document.getElementById('productos-lista');
    if (!contenedor) return;

    // Cabecera de la tabla/lista
    contenedor.innerHTML = `
        <div class="table-header">
            <span>Imagen</span>
            <span>Producto</span>
            <span class="text-center">Precio</span>
            <span class="text-center">Acciones</span>
        </div>
    `;
        // Se crea una tarjeta por cada producto
    productos.forEach(prod => contenedor.appendChild(crearCardProducto(prod)));
}

/******************************************************************
 * Crea la tarjeta completa de un producto
 * Incluye:
 * - Vista normal
 * - Formulario de edición
 ******************************************************************/

function crearCardProducto(prod) {
        // Valores por defecto para categorías
    const catES = prod.categoria?.es || "otros";
    const catEN = prod.categoria?.en || "others";

    const div = document.createElement('div');
        // HTML completo del producto
    div.className = 'product-card';
    div.innerHTML = `
    
        <div class="product-row" id="row-${prod.id}">
            <img src="${prod.imagen_principal}" class="product-img">
            <div class="product-info">
                <h3>${prod.nombre_producto?.es || ''}</h3>
                <p>${prod.marca} | ${catES}</p>
            </div>
            <div class="product-price">${prod.precio} €</div>
            <div class="product-actions">
                <button class="action-btn" onclick="toggleEdicion('${prod.id}')" title="Editar"><i class="fas fa-pen"></i></button>
                <button class="action-btn" onclick="eliminarProducto('${prod.id}')" title="Eliminar"><i class="fas fa-trash"></i></button>
                <button class="action-btn" onclick="toggleVisibilidad(this, '${prod.id}')" title="Visibilidad"><i class="fas fa-eye"></i></button>
            </div>
        </div>
        
        <div id="form-edit-${prod.id}" class="edit-form" style="display:none">
            <div class="form-grid" oninput="actualizarVistaJSON('${prod.id}')">
                
                <div class="input-group"><b>ID:</b><input type="text" value="${prod.id}" readonly></div>
                
                <div class="input-group">
                    <b>Categoría (ES):</b>
                    <select id="edit-cat-es-${prod.id}" onchange="autoCompletarCategoria('${prod.id}')">
                        <option value="gato" ${catES === 'gato' ? 'selected' : ''}>Gato</option>
                        <option value="perro" ${catES === 'perro' ? 'selected' : ''}>Perro</option>
                        <option value="pajaro" ${catES === 'pajaro' ? 'selected' : ''}>Pájaro</option>
                        <option value="roedores" ${catES === 'roedores' ? 'selected' : ''}>Roedores</option>
                        <option value="pez" ${catES === 'pez' ? 'selected' : ''}>Pez</option>
                        <option value="otros" ${catES === 'otros' ? 'selected' : ''}>Otros</option>
                    </select>
                </div>
                
                <div class="input-group"><b>Categoría (EN):</b><input type="text" id="edit-cat-en-${prod.id}" value="${catEN}" readonly></div>
                <div class="input-group"><b>Marca:</b><input type="text" id="edit-marca-${prod.id}" value="${prod.marca || ''}"></div>
                <div class="input-group"><b>Nombre (ES):</b><input type="text" id="edit-n-es-${prod.id}" value="${prod.nombre_producto?.es || ''}"></div>
                <div class="input-group"><b>Nombre (EN):</b><input type="text" id="edit-n-en-${prod.id}" value="${prod.nombre_producto?.en || ''}"></div>
                
                <div class="input-group"><b>Formato (ES):</b><input type="text" id="edit-f-es-${prod.id}" value="${prod.formato?.es || ''}"></div>
                <div class="input-group"><b>Formato (EN):</b><input type="text" id="edit-f-en-${prod.id}" value="${prod.formato?.en || ''}"></div>
                
                <div class="input-group"><b>Precio (€):</b><input type="number" step="0.01" id="edit-p-${prod.id}" value="${prod.precio || 0}"></div>
                <div class="input-group"><b>Descripción Formato:</b><input type="text" id="edit-desc-f-${prod.id}" value="${prod.descripcion_formato || ''}"></div>
                
                <div class="input-group full-width"><b>Descripción (ES):</b><textarea id="edit-d-es-${prod.id}">${prod.descripcion?.es || ''}</textarea></div>
                <div class="input-group full-width"><b>Descripción (EN):</b><textarea id="edit-d-en-${prod.id}">${prod.descripcion?.en || ''}</textarea></div>

                <div class="image-management-section full-width">
                   <div class="image-layout-container">
                        <div class="main-image-column">
                            <label class="label-title">Imagen Principal</label>
                            <div class="main-preview-card" id="drop-zone-main-${prod.id}">
                                <img src="${prod.imagen_principal}" id="prev-main-${prod.id}">
                                <label class="upload-badge"><i class="fas fa-camera"></i><input type="file" hidden accept="image/*" onchange="cambiarImagenPrincipal(this, '${prod.id}')"></label>
                            </div>
                        </div>
                        <div class="gallery-column">
                            <label class="label-title">Galería Miniaturas</label>
                            <div class="minis-gallery-grid" id="minis-container-${prod.id}">
                                ${(prod.imagen_miniatura || []).map(img => `<div class="mini-item"><img src="${img}"><button class="remove-btn" onclick="eliminarMiniatura(this, '${prod.id}')">×</button></div>`).join('')}
                                <label class="add-mini-card" id="drop-zone-mini-${prod.id}"><i class="fas fa-plus"></i><span>Agregar</span><input type="file" hidden accept="image/*" onchange="agregarMiniaturaUnaAUna(this, '${prod.id}')"></label>
                            </div>
                        </div>
                   </div>
                </div>

                <div class="full-width json-preview-container">
                    <pre id="json-view-${prod.id}" class="json-block"></pre>
                </div>
            </div>

            <div class="final-controls">
                <button class="btn-main btn-save" onclick="guardarCambios('${prod.id}')">MODIFICAR CAMBIOS</button>
                <button class="btn-main btn-cancel" onclick="toggleEdicion('${prod.id}')">Cancelar</button>
            </div>
        </div>
    `;
    return div;
}


/******************************************************************
 * Autocompleta la categoría en inglés según la selección en español
 ******************************************************************/

function autoCompletarCategoria(id) {
    const valES = document.getElementById(`edit-cat-es-${id}`).value;
    document.getElementById(`edit-cat-en-${id}`).value = CATEGORIAS_MAP[valES] || "others";
    actualizarVistaJSON(id);
}

/******************************************************************
 * Genera una vista previa del JSON que se enviará al backend
 ******************************************************************/

function actualizarVistaJSON(id) {
    const miniaturas = Array.from(document.querySelectorAll(`#minis-container-${id} img`)).map(img => 
        img.src.length > 50 ? img.src.substring(0, 50) + "... [BASE64]" : img.src
    );

    const dataFinal = {
        id: id,
        categoria: {
            es: document.getElementById(`edit-cat-es-${id}`).value,
            en: document.getElementById(`edit-cat-en-${id}`).value
        },
        marca: document.getElementById(`edit-marca-${id}`).value,
        nombre_producto: {
            es: document.getElementById(`edit-n-es-${id}`).value,
            en: document.getElementById(`edit-n-en-${id}`).value
        },
        precio: parseFloat(document.getElementById(`edit-p-${id}`).value) || 0,
        descripcion: {
            es: document.getElementById(`edit-d-es-${id}`).value,
            en: document.getElementById(`edit-d-en-${id}`).value
        },
        formato: {
            es: document.getElementById(`edit-f-es-${id}`).value,
            en: document.getElementById(`edit-f-en-${id}`).value
        },
        descripcion_formato: document.getElementById(`edit-desc-f-${id}`).value,
        imagen_principal: document.getElementById(`prev-main-${id}`)?.src.substring(0, 50) + "...",
        imagen_miniatura: miniaturas
    };

    const pre = document.getElementById(`json-view-${id}`);
    if (pre) pre.textContent = JSON.stringify(dataFinal, null, 2);
}

/******************************************************************
 * Envía los cambios al backend (PUT)
 ******************************************************************/

async function guardarCambios(id) {
    const miniaturas = Array.from(document.querySelectorAll(`#minis-container-${id} img`)).map(img => img.src);
    const dataAEnviar = {
        id: id,
        categoria: {
            es: document.getElementById(`edit-cat-es-${id}`).value,
            en: document.getElementById(`edit-cat-en-${id}`).value
        },
        marca: document.getElementById(`edit-marca-${id}`).value,
        nombre_producto: {
            es: document.getElementById(`edit-n-es-${id}`).value,
            en: document.getElementById(`edit-n-en-${id}`).value
        },
        precio: parseFloat(document.getElementById(`edit-p-${id}`).value) || 0,
        descripcion: {
            es: document.getElementById(`edit-d-es-${id}`).value,
            en: document.getElementById(`edit-d-en-${id}`).value
        },
        formato: {
            es: document.getElementById(`edit-f-es-${id}`).value,
            en: document.getElementById(`edit-f-en-${id}`).value
        },
        descripcion_formato: document.getElementById(`edit-desc-f-${id}`).value,
        imagen_principal: document.getElementById(`prev-main-${id}`).src,
        imagen_miniatura: miniaturas
    };

    try {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataAEnviar)
        });
        if (res.ok) {
            alert("¡MODIFICACIÓN CAMBIOS EXITOSA!");
            cargarProductos();
        }
    } catch (e) { alert("Error al conectar con el servidor."); }
}

/******************************************************************
 * Alterna la visibilidad visual de un producto (no elimina)
 ******************************************************************/
function toggleVisibilidad(boton, id) {
    const icono = boton.querySelector('i');
    const fila = document.getElementById(`row-${id}`);
    const estaOculto = icono.classList.contains('fa-eye-slash');
    icono.className = estaOculto ? 'fas fa-eye' : 'fas fa-eye-slash';
    fila.style.opacity = estaOculto ? '1' : '0.4';
}

/******************************************************************
 * Elimina un producto definitivamente
 ******************************************************************/

async function eliminarProducto(id) {
    if (confirm(`¿Eliminar definitivamente ${id}?`)) {
        await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
        cargarProductos();
    }
}

/******************************************************************
 * Abre o cierra el formulario de edición
 ******************************************************************/

function toggleEdicion(id) {
    const form = document.getElementById(`form-edit-${id}`);
    const abriendo = form.style.display === 'none';
    form.style.display = abriendo ? 'block' : 'none';
    if (abriendo) { 
        activarDragAndDrop(id); 
        actualizarVistaJSON(id); 
    }
}

/******************************************************************
 * Actualiza la imagen principal y refresca la vista JSON
 ******************************************************************/

function actualizarImagenPrincipalEnCascada(base64Nueva, id) {
    const imgPrincipalElem = document.getElementById(`prev-main-${id}`);
    imgPrincipalElem.src = base64Nueva;
    actualizarVistaJSON(id);
}

/******************************************************************
 * Activa drag & drop para imágenes
 ******************************************************************/

function activarDragAndDrop(id) {
    const zoneMain = document.getElementById(`drop-zone-main-${id}`);
    const zoneMini = document.getElementById(`drop-zone-mini-${id}`);
    const prevenir = (e) => { e.preventDefault(); e.stopPropagation(); };
    if(zoneMain) {
        zoneMain.addEventListener('dragover', prevenir);
        zoneMain.addEventListener('drop', prevenir);
        zoneMain.addEventListener('drop', async (e) => {
            const f = e.dataTransfer.files[0];
            if (f?.type.startsWith('image/')) actualizarImagenPrincipalEnCascada(await toBase64(f), id);
        });
    }
    if(zoneMini) {
        zoneMini.addEventListener('dragover', prevenir);
        zoneMini.addEventListener('drop', prevenir);
        zoneMini.addEventListener('drop', async (e) => {
            for (const f of e.dataTransfer.files) {
                if (f.type.startsWith('image/')) inyectarMiniaturaHTML(await toBase64(f), id);
            }
            actualizarVistaJSON(id);
        });
    }
}


/******************************************************************
 * Inserta una miniatura en el DOM
 ******************************************************************/

function inyectarMiniaturaHTML(src, id) {
    const container = document.getElementById(`minis-container-${id}`);
    const addBtn = container.querySelector('.add-mini-card');
    const div = document.createElement('div');
    div.className = 'mini-item';
    div.innerHTML = `<img src="${src}"><button class="remove-btn" onclick="eliminarMiniatura(this, '${id}')">×</button>`;
    container.insertBefore(div, addBtn);
}

/******************************************************************
 * Elimina una miniatura
 ******************************************************************/
function eliminarMiniatura(btn, id) {
    btn.parentElement.remove();
    actualizarVistaJSON(id);
}

/******************************************************************
 * Cambia la imagen principal desde input file
 ******************************************************************/
async function cambiarImagenPrincipal(input, id) {
    if (input.files?.[0]) {
        actualizarImagenPrincipalEnCascada(await toBase64(input.files[0]), id);
    }
}
/******************************************************************
 * Agrega miniaturas de una en una
 ******************************************************************/
async function agregarMiniaturaUnaAUna(input, id) {
    if (input.files?.[0]) {
        inyectarMiniaturaHTML(await toBase64(input.files[0]), id);
        input.value = "";
        actualizarVistaJSON(id);
    }
}

