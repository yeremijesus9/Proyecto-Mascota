/******************************************************************
 * URL base de la API REST donde se gestionan los productos
 * Se usa para GET, PUT y DELETE
 ******************************************************************/
const BASE_URL = `${API_URL}/products`;
const BASE_URL_PEDIDOS = `${API_URL}/datos_envio`;

let totalPedidosLocal = []; // Para filtrado sin volver a cargar de la API

/******************************************************************
 * URL para los productos nuevos creados
 ******************************************************************/
const NUEVO_PRODUCTO_URL = `${API_URL}/nuevo_producto`;

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

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario es administrador
    const usuarioActivo = JSON.parse(localStorage.getItem('sistema_usuario_activo'));
    if (!usuarioActivo || usuarioActivo.rol !== 'admin') {
        alert("Acceso denegado. Se requieren permisos de administrador.");
        window.location.href = 'index.html';
        return;
    }

    cargarProductos();
    cargarRegistros();

    // Comprobar si venimos de otra página pidiendo una sección específica
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    if (section === 'registros') {
        mostrarSeccion('registros');
    }
});

// --- ACTUALIZAR ESTADÍSTICAS ---
function actualizarEstadisticas(pedidos, productos) {
    if (pedidos) {
        document.getElementById('stat-total-pedidos').textContent = pedidos.length;
        const totalVentas = pedidos.reduce((acc, p) => {
            // Extraer solo el número del string de precio
            const precioStr = String(p.precio_total || p.total || "0").replace(/[^0-9.]/g, '');
            const precio = parseFloat(precioStr);
            return acc + (isNaN(precio) ? 0 : precio);
        }, 0);
        document.getElementById('stat-ventas-totales').textContent = `${totalVentas.toFixed(2)} €`;
    }
    if (productos) {
        document.getElementById('stat-total-productos').textContent = productos.length;
    }
}

// --- GESTIÓN DE VISTAS ---
function mostrarSeccion(seccion) {
    const secProt = document.getElementById('seccion-productos');
    const secReg = document.getElementById('seccion-registros');
    const btnProt = document.getElementById('btn-view-products');
    const btnReg = document.getElementById('btn-view-registros');

    if (seccion === 'productos') {
        secProt.style.display = 'block';
        secReg.style.display = 'none';
        btnProt.classList.add('active');
        btnReg.classList.remove('active');
    } else {
        secProt.style.display = 'none';
        secReg.style.display = 'block';
        btnProt.classList.remove('active');
        btnReg.classList.add('active');
    }
}
/******************************************************************
 * Obtiene los productos desde la API y los renderiza
 ******************************************************************/
async function cargarProductos() {
    try {
        // Cargar productos del endpoint principal
        const respuestaProductos = await fetch(BASE_URL);
        const productos = await respuestaProductos.json();

        // Intentar cargar productos nuevos (si el endpoint no existe, solo usa los principales)
        let productosNuevos = [];
        try {
            const respuestaNuevos = await fetch(NUEVO_PRODUCTO_URL);
            if (respuestaNuevos.ok) {
                productosNuevos = await respuestaNuevos.json();
            }
        } catch (errorNuevos) {
            console.log("Endpoint de nuevos productos no disponible, usando solo productos principales");
        }

        // Combinar ambos arrays de productos
        const todosLosProductos = [...productos, ...productosNuevos];

        console.log('Productos cargados:', todosLosProductos.length);
        renderizarProductos(todosLosProductos);
        actualizarEstadisticas(null, todosLosProductos);
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
    if (zoneMain) {
        zoneMain.addEventListener('dragover', prevenir);
        zoneMain.addEventListener('drop', prevenir);
        zoneMain.addEventListener('drop', async (e) => {
            const f = e.dataTransfer.files[0];
            if (f?.type.startsWith('image/')) actualizarImagenPrincipalEnCascada(await toBase64(f), id);
        });
    }
    if (zoneMini) {
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

// --- GESTIÓN DE PEDIDOS (DATOS_ENVIO) ---

async function cargarRegistros() {
    try {
        const respuesta = await fetch(BASE_URL_PEDIDOS);
        if (!respuesta.ok) throw new Error('Error al cargar pedidos');
        const pedidos = await respuesta.json();
        totalPedidosLocal = pedidos; // Guardar copia local para búsqueda
        renderizarRegistros(pedidos);
        actualizarEstadisticas(pedidos, null);
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderizarRegistros(pedidos) {
    const contenedor = document.getElementById('registros-lista');
    const header = contenedor.querySelector('.table-header');
    contenedor.innerHTML = '';
    contenedor.appendChild(header);

    pedidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    pedidos.forEach(pedido => {
        const row = crearCardPedido(pedido);
        contenedor.appendChild(row);
    });
}

function crearCardPedido(pedido) {
    const row = document.createElement('div');
    row.className = 'order-card';
    row.id = `pedido-${pedido.id}`;

    const listaProductos = Array.isArray(pedido.producto) ? pedido.producto : (Array.isArray(pedido.productos) ? pedido.productos : []);

    const productosHtml = listaProductos.length > 0
        ? listaProductos.map(p => `
            <div class="product-mini-item">
                <span>${p.nombre} <strong>x${p.cantidad}</strong></span>
                <span>${(p.precio * p.cantidad).toFixed(2)} €</span>
            </div>`).join('')
        : '<p>Sin productos registrados</p>';

    row.innerHTML = `
        <div class="order-main-row" onclick="toggleDetallesPedido('${pedido.id}')">
            <div>
                <span class="status-badge">Completado</span>
            </div>
            <div class="order-info">
                <span class="order-id">${pedido.numero_pedido || 'ID: ' + pedido.id}</span>
                <span class="order-date">${new Date(pedido.fecha).toLocaleString()}</span>
            </div>
            <div class="customer-info">
                <strong>${pedido.nombre}</strong>
                <small>${pedido.email}</small>
            </div>
            <div class="price-total">
                ${(() => {
            const pTotal = String(pedido.precio_total || pedido.total || "0").replace(/[^0-9.]/g, '');
            return `${parseFloat(pTotal).toFixed(2)} €`;
        })()}
            </div>
            <div class="product-actions" onclick="event.stopPropagation()">
                <button class="action-btn" onclick="toggleEdicionPedido('${pedido.id}')" title="Editar pedido">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="action-btn" onclick="eliminarPedido('${pedido.id}')" title="Eliminar del registro">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>

        <!-- FORMULARIO DE EDICIÓN DE PEDIDO -->
        <div id="form-edit-pedido-${pedido.id}" class="edit-form" style="display:none">
            <h4 style="margin-bottom: 1.5rem; color: var(--primary-orange);">Editar Detalles del Pedido</h4>
            <div class="form-grid">
                <div class="input-group"><b>Nº Pedido:</b><input type="text" id="edit-ord-num-${pedido.id}" value="${pedido.numero_pedido || ''}"></div>
                <div class="input-group"><b>Fecha:</b><input type="text" id="edit-ord-fecha-${pedido.id}" value="${pedido.fecha}" readonly></div>
                
                <div class="input-group"><b>Nombre Cliente:</b><input type="text" id="edit-ord-nom-${pedido.id}" value="${pedido.nombre || ''}"></div>
                <div class="input-group"><b>Email:</b><input type="text" id="edit-ord-email-${pedido.id}" value="${pedido.email || ''}"></div>
                
                <div class="input-group"><b>Teléfono:</b><input type="text" id="edit-ord-tel-${pedido.id}" value="${pedido.telefono || ''}"></div>
                <div class="input-group"><b>Método Pago:</b><input type="text" id="edit-ord-pago-${pedido.id}" value="${pedido.metodo_pago || ''}"></div>

                <div class="input-group full-width"><b>Dirección:</b><input type="text" id="edit-ord-dir-${pedido.id}" value="${pedido.direccion || ''}"></div>
                
                <div class="input-group"><b>Ciudad:</b><input type="text" id="edit-ord-ciu-${pedido.id}" value="${pedido.ciudad || ''}"></div>
                <div class="input-group"><b>Código Postal:</b><input type="text" id="edit-ord-cp-${pedido.id}" value="${pedido.codigo_postal || ''}"></div>

                <div class="input-group"><b>Precio Total:</b><input type="text" id="edit-ord-total-${pedido.id}" value="${pedido.precio_total || pedido.total || ''}"></div>
            </div>

            <div class="final-controls">
                <button class="btn-main btn-save" onclick="guardarCambiosPedido('${pedido.id}')">GUARDAR CAMBIOS</button>
                <button class="btn-main btn-cancel" onclick="toggleEdicionPedido('${pedido.id}')">Cancelar</button>
            </div>
        </div>
        <div class="order-details-expanded" id="detalles-pedido-${pedido.id}" style="display: none;">
            <div class="products-mini-list">
                <h4>Productos en este pedido</h4>
                ${productosHtml}
            </div>
            <div class="details-grid">
                <div class="detail-box">
                    <h4>Datos de Envío</h4>
                    <p>${pedido.direccion}<br>${pedido.ciudad}, ${pedido.codigo_postal}</p>
                </div>
                <div class="detail-box">
                    <h4>Método de Pago</h4>
                    <p><span class="iconify" data-icon="mdi:credit-card-outline"></span> ${pedido.metodo_pago}</p>
                </div>
                <div class="detail-box">
                    <h4>Contacto</h4>
                    <p><span class="iconify" data-icon="mdi:phone"></span> ${pedido.telefono}</p>
                </div>
            </div>
        </div>
    `;
    return row;
}

function toggleDetallesPedido(id) {
    const el = document.getElementById(`detalles-pedido-${id}`);
    const isVisible = el.style.display === 'block';
    el.style.display = isVisible ? 'none' : 'block';
}

function filtrarPedidos() {
    const term = document.getElementById('order-search').value.toLowerCase();
    const filtrados = totalPedidosLocal.filter(p =>
        (p.numero_pedido && p.numero_pedido.toLowerCase().includes(term)) ||
        (p.email && p.email.toLowerCase().includes(term)) ||
        (p.nombre && p.nombre.toLowerCase().includes(term))
    );
    renderizarRegistros(filtrados);
}

async function eliminarPedido(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente este pedido del registro?')) return;

    try {
        const respuesta = await fetch(`${BASE_URL_PEDIDOS}/${id}`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            document.getElementById(`pedido-${id}`).remove();
            // Actualizar local y stats
            totalPedidosLocal = totalPedidosLocal.filter(p => p.id !== id);
            actualizarEstadisticas(totalPedidosLocal, null);
        } else {
            alert('Error al eliminar el pedido');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function toggleEdicionPedido(id) {
    const form = document.getElementById(`form-edit-pedido-${id}`);
    const currentDisplay = form.style.display;

    // Cerrar detalles si están abiertos
    const detalles = document.getElementById(`detalles-pedido-${id}`);
    if (detalles) detalles.style.display = 'none';

    form.style.display = (currentDisplay === 'none') ? 'block' : 'none';
}

async function guardarCambiosPedido(id) {
    // 1. Obtener el pedido original para no perder los productos
    const pedidoOriginal = totalPedidosLocal.find(p => p.id == id);
    if (!pedidoOriginal) return;

    // 2. Recolectar nuevos valores
    const updatedPedido = {
        ...pedidoOriginal, // Mantiene productos y otros campos no editables
        numero_pedido: document.getElementById(`edit-ord-num-${id}`).value,
        nombre: document.getElementById(`edit-ord-nom-${id}`).value,
        email: document.getElementById(`edit-ord-email-${id}`).value,
        telefono: document.getElementById(`edit-ord-tel-${id}`).value,
        metodo_pago: document.getElementById(`edit-ord-pago-${id}`).value,
        direccion: document.getElementById(`edit-ord-dir-${id}`).value,
        ciudad: document.getElementById(`edit-ord-ciu-${id}`).value,
        codigo_postal: document.getElementById(`edit-ord-cp-${id}`).value,
        precio_total: document.getElementById(`edit-ord-total-${id}`).value
    };

    try {
        const respuesta = await fetch(`${BASE_URL_PEDIDOS}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedPedido)
        });

        if (respuesta.ok) {
            alert('Pedido actualizado con éxito');
            // Recargar datos para refrescar la UI
            cargarRegistros();
        } else {
            alert('Error al guardar los cambios del pedido');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
    }
}
