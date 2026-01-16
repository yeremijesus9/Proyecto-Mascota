const BASE_URL = 'http://localhost:3000/products';

// Auxiliar: Convertir archivo a Base64
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

document.addEventListener('DOMContentLoaded', cargarProductos);

async function cargarProductos() {
    try {
        const respuesta = await fetch(BASE_URL);
        const productos = await respuesta.json();
        renderizarProductos(productos);
    } catch (error) {
        console.error("Error al cargar productos:", error);
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
    const isNew = prod.id === 'new';
    const nES = prod.nombre_producto?.es || prod.nombre_producto || "";
    const nEN = prod.nombre_producto?.en || "";
    const dES = prod.descripcion?.es || prod.descripcion || "";
    const dEN = prod.descripcion?.en || "";
    const fES = prod.formato?.es || prod.formato || "";
    const fEN = prod.formato?.en || "";

    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
        <div class="product-row" style="${isNew ? 'display:none' : ''}">
            <img src="${prod.imagen_principal}" class="product-img">
            <div class="product-info">
                <h3>${nES}</h3>
                <p>${prod.marca} | ${prod.categoria?.es || prod.categoria || ''}</p>
            </div>
            <div class="product-price">${prod.precio} €</div>
            <div class="product-actions">
                <button class="action-btn" onclick="toggleEdicion('${prod.id}')" title="Editar"><i class="fas fa-pen"></i></button>
                <button class="action-btn" onclick="eliminarProducto('${prod.id}')" title="Eliminar"><i class="fas fa-trash"></i></button>
                <button class="action-btn" onclick="toggleVisibilidad(this)" title="Visibilidad"><i class="fas fa-eye"></i></button>
            </div>
        </div>
        
        <div id="form-edit-${prod.id}" class="edit-form" style="${isNew ? 'display:block' : 'display:none'}">
            <div class="form-grid" oninput="actualizarVistaJSON('${prod.id}')">
                <div class="input-group"><b>Nombre (ES):</b><input type="text" id="edit-n-es-${prod.id}" value="${nES}"></div>
                <div class="input-group"><b>Nombre (EN):</b><input type="text" id="edit-n-en-${prod.id}" value="${nEN}"></div>
                <div class="input-group"><b>Precio:</b><input type="number" step="0.01" id="edit-p-${prod.id}" value="${prod.precio}"></div>
                <div class="input-group"><b>Marca:</b><input type="text" id="edit-m-${prod.id}" value="${prod.marca}"></div>
                <div class="input-group"><b>Formato (ES):</b><input type="text" id="edit-f-es-${prod.id}" value="${fES}"></div>
                <div class="input-group"><b>Formato (EN):</b><input type="text" id="edit-f-en-${prod.id}" value="${fEN}"></div>
                
                <div class="input-group full-width"><b>Descripción (ES):</b><textarea id="edit-d-es-${prod.id}">${dES}</textarea></div>
                <div class="input-group full-width"><b>Descripción (EN):</b><textarea id="edit-d-en-${prod.id}">${dEN}</textarea></div>

                <div class="image-management-section full-width">
                    <div class="image-layout-container">
                        <div class="main-image-column">
                            <label class="label-title">Imagen Principal (Suelte aquí)</label>
                            <div class="main-preview-card" id="drop-zone-main-${prod.id}">
                                <img src="${prod.imagen_principal}" id="prev-main-${prod.id}">
                                <label class="upload-badge">
                                    <i class="fas fa-camera"></i>
                                    <input type="file" hidden accept="image/*" onchange="cambiarImagenPrincipal(this, '${prod.id}')">
                                </label>
                            </div>
                        </div>

                        <div class="gallery-column">
                            <label class="label-title">Galería de Miniaturas</label>
                            <div class="minis-gallery-grid" id="minis-container-${prod.id}">
                                ${(prod.imagen_miniatura || []).map(img => `
                                    <div class="mini-item">
                                        <img src="${img}">
                                        <button class="remove-btn" onclick="eliminarMiniatura(this, '${prod.id}')">×</button>
                                    </div>
                                `).join('')}
                                <label class="add-mini-card" id="drop-zone-mini-${prod.id}">
                                    <i class="fas fa-plus"></i>
                                    <span>Agregar</span>
                                    <input type="file" hidden accept="image/*" onchange="agregarMiniaturaUnaAUna(this, '${prod.id}')">
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="full-width json-preview-container" style="margin-top: 2rem;">
                    <label class="label-title" style="color: #D37C39; font-weight: bold;"><i class="fas fa-code"></i> Vista Previa del Objeto JSON</label>
                    <pre id="json-view-${prod.id}" style="background: #2c3e50; color: #ecf0f1; padding: 1.5rem; border-radius: 0.8rem; font-size: 0.85rem; overflow-x: auto; white-space: pre-wrap; word-break: break-all; border: 1px solid #444; margin-top: 10px;">{}</pre>
                </div>
            </div>

            <div class="final-controls">
                <button class="btn-main btn-save" onclick="guardarCambios('${prod.id}')">
                    ${isNew ? 'Crear Producto' : 'Guardar Cambios'}
                </button>
                <button class="btn-main btn-cancel" onclick="${isNew ? "this.closest('.product-card').remove()" : `toggleEdicion('${prod.id}')`}">Cancelar</button>
            </div>
        </div>
    `;
    setTimeout(() => actualizarVistaJSON(prod.id), 50);
    return div;
}

function actualizarVistaJSON(id) {
    const miniaturas = Array.from(document.querySelectorAll(`#minis-container-${id} img`)).map(img => {
        const src = img.src;
        return src.length > 60 ? src.substring(0, 60) + "... [DATA BASE64]" : src;
    });

    const mockData = {
        id: id === 'new' ? "Autogenerado" : id,
        nombre_producto: {
            es: document.getElementById(`edit-n-es-${id}`)?.value || "",
            en: document.getElementById(`edit-n-en-${id}`)?.value || ""
        },
        descripcion: {
            es: document.getElementById(`edit-d-es-${id}`)?.value || "",
            en: document.getElementById(`edit-d-en-${id}`)?.value || ""
        },
        formato: {
            es: document.getElementById(`edit-f-es-${id}`)?.value || "",
            en: document.getElementById(`edit-f-en-${id}`)?.value || ""
        },
        precio: parseFloat(document.getElementById(`edit-p-${id}`)?.value) || 0,
        marca: document.getElementById(`edit-m-${id}`)?.value || "",
        imagen_principal: document.getElementById(`prev-main-${id}`)?.src.substring(0, 60) + "... [DATA BASE64]",
        imagen_miniatura: miniaturas
    };

    const pre = document.getElementById(`json-view-${id}`);
    if (pre) pre.textContent = JSON.stringify(mockData, null, 4);
}

// Lógica CORE: Sincroniza imagen principal eliminando la anterior de la galería si corresponde
function actualizarImagenPrincipalEnCascada(base64Nueva, id) {
    const imgPrincipalElem = document.getElementById(`prev-main-${id}`);
    const base64Anterior = imgPrincipalElem.src;

    // 1. Si la imagen anterior ya estaba en las miniaturas, la quitamos para limpiar
    const miniaturasDOM = Array.from(document.querySelectorAll(`#minis-container-${id} .mini-item`));
    miniaturasDOM.forEach(item => {
        const img = item.querySelector('img');
        if (img && img.src === base64Anterior) {
            item.remove();
        }
    });

    // 2. Actualizamos la imagen principal
    imgPrincipalElem.src = base64Nueva;

    // 3. Añadimos la nueva a la galería (si no está ya por casualidad)
    const miniaturasActuales = Array.from(document.querySelectorAll(`#minis-container-${id} img`)).map(img => img.src);
    if (!miniaturasActuales.includes(base64Nueva)) {
        inyectarMiniaturaHTML(base64Nueva, id);
    }

    actualizarVistaJSON(id);
}

function activarDragAndDrop(id) {
    const zoneMain = document.getElementById(`drop-zone-main-${id}`);
    const zoneMini = document.getElementById(`drop-zone-mini-${id}`);

    const prevenir = (e) => { e.preventDefault(); e.stopPropagation(); };
    const resaltar = (el) => el.classList.add('highlight');
    const quitarResalte = (el) => el.classList.remove('highlight');

    [zoneMain, zoneMini].forEach(zona => {
        zona.addEventListener('dragover', (e) => { prevenir(e); resaltar(zona); });
        zona.addEventListener('dragleave', (e) => { prevenir(e); quitarResalte(zona); });
        zona.addEventListener('drop', (e) => { prevenir(e); quitarResalte(zona); });
    });

    zoneMain.addEventListener('drop', async (e) => {
        const archivo = e.dataTransfer.files[0];
        if (archivo && archivo.type.startsWith('image/')) {
            const base64 = await toBase64(archivo);
            actualizarImagenPrincipalEnCascada(base64, id);
        }
    });

    zoneMini.addEventListener('drop', async (e) => {
        const archivos = Array.from(e.dataTransfer.files);
        for (const f of archivos) {
            if (f.type.startsWith('image/')) {
                const base64 = await toBase64(f);
                inyectarMiniaturaHTML(base64, id);
            }
        }
        actualizarVistaJSON(id);
    });
}

function inyectarMiniaturaHTML(src, id) {
    const container = document.getElementById(`minis-container-${id}`);
    const addBtn = container.querySelector('.add-mini-card');
    const newMini = document.createElement('div');
    newMini.className = 'mini-item';
    newMini.innerHTML = `<img src="${src}"><button class="remove-btn" onclick="eliminarMiniatura(this, '${id}')">×</button>`;
    container.insertBefore(newMini, addBtn);
}

function eliminarMiniatura(btn, id) {
    btn.parentElement.remove();
    actualizarVistaJSON(id);
}

async function cambiarImagenPrincipal(input, id) {
    if (input.files && input.files[0]) {
        const base64 = await toBase64(input.files[0]);
        actualizarImagenPrincipalEnCascada(base64, id);
    }
}

async function agregarMiniaturaUnaAUna(input, id) {
    if (input.files && input.files[0]) {
        inyectarMiniaturaHTML(await toBase64(input.files[0]), id);
        input.value = "";
        actualizarVistaJSON(id);
    }
}

async function guardarCambios(id) {
    const miniaturas = Array.from(document.querySelectorAll(`#minis-container-${id} img`)).map(img => img.src);
    const esNuevo = id === 'new';

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
        precio: parseFloat(document.getElementById(`edit-p-${id}`).value) || 0,
        marca: document.getElementById(`edit-m-${id}`).value,
        imagen_principal: document.getElementById(`prev-main-${id}`).src,
        imagen_miniatura: miniaturas
    };

    try {
        const url = esNuevo ? BASE_URL : `${BASE_URL}/${id}`;
        const res = await fetch(url, {
            method: esNuevo ? 'POST' : 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actualizacion)
        });

        if (res.ok) {
            alert(esNuevo ? "Producto creado!" : "¡Servidor actualizado!");
            cargarProductos();
            if(esNuevo) document.getElementById('nuevo-producto-container').innerHTML = '';
        }
    } catch (e) { alert("Error al conectar con el servidor."); }
}

function toggleEdicion(id) {
    const form = document.getElementById(`form-edit-${id}`);
    const abriendo = form.style.display === 'none';
    form.style.display = abriendo ? 'block' : 'none';
    if (abriendo) {
        activarDragAndDrop(id);
        actualizarVistaJSON(id);
    }
}

function abrirFormularioNuevo() {
    const contenedor = document.getElementById('nuevo-producto-container');
    const mockProd = {
        id: 'new',
        nombre_producto: { es: "", en: "" },
        imagen_principal: "https://via.placeholder.com/150",
        imagen_miniatura: []
    };
    contenedor.innerHTML = "";
    const card = crearCardProducto(mockProd);
    contenedor.appendChild(card);
    activarDragAndDrop('new');
    actualizarVistaJSON('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function eliminarProducto(id) {
    if (confirm("¿Eliminar definitivamente?")) {
        await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
        cargarProductos();
    }
}

function toggleVisibilidad(boton) {
    const icono = boton.querySelector('i');
    const estaOculto = icono.classList.contains('fa-eye-slash');
    icono.className = estaOculto ? 'fas fa-eye' : 'fas fa-eye-slash';
    boton.classList.toggle('inactive', !estaOculto);
}