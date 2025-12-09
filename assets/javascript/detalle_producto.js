// ====================================================================
// CONFIGURACIÓN GLOBAL DE IDIOMA Y RUTA (Asegura que existen al inicio)
// ====================================================================

// Inicialización: Lee el idioma del localStorage o usa 'es' por defecto.
window.idiomaActual = localStorage.getItem('idiomaSeleccionado') || "es";

window.rutaJson = function() {
    // La ruta ahora depende de window.idiomaActual (ej: /assets/JSON/es_mascota.json)
    return `/assets/JSON/${window.idiomaActual}_mascota.json`;
};

// Variable global para almacenar todos los productos
window.todosLosProductos = []; 

// FUNCIÓN PARA CAMBIAR EL IDIOMA (Para uso externo, por ejemplo, botones de idioma)
window.cambiarIdioma = async function(nuevoIdioma) {
    if (window.idiomaActual === nuevoIdioma) {
        console.log(`El idioma ya es ${nuevoIdioma}. No es necesario recargar.`);
        return;
    }
    console.log(`Cambiando de idioma de ${window.idiomaActual} a ${nuevoIdioma}...`);
    window.idiomaActual = nuevoIdioma;
    localStorage.setItem('idiomaSeleccionado', nuevoIdioma);
    // Llama a la función principal para recargar la vista con el nuevo idioma
    await window.cargarDetalleYRelacionados(); 
};


(async function() {
    'use strict';

    // ====================================================================
    // HELPERS Y FETCHING
    // ====================================================================

    function getQueryParam(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    // Usamos la función global window.rutaJson() para obtener la ruta
    function obtenerRutaJson() {
        // Fallback seguro si window.rutaJson() no existe por alguna razón
        return typeof window.rutaJson === 'function' ? window.rutaJson() : `/assets/JSON/${window.idiomaActual || 'es'}_mascota.json`; 
    }

    const contenedor = document.getElementById('productos-contenedor');
    if (!contenedor) return;

    const productoId = getQueryParam('id');

    async function fetchProductos() {
        const ruta = obtenerRutaJson();
        const res = await fetch(ruta);
        
        if (!res.ok) {
            // Lanza un error claro si la ruta es incorrecta (404, 500, etc.)
            throw new Error(`Error HTTP ${res.status} al cargar el JSON: ${ruta}`);
        }
        
        const data = await res.json();
        const productos = Array.isArray(data) ? data : data.mascotas || [];
        window.todosLosProductos = productos; 
        return productos;
    }

    function formatPrice(p) {
        return p && typeof p === 'number' ? p.toFixed(2) + ' €' : p;
    }

    function crearEstrellas(puntuacion) {
        const p = Number(puntuacion) || 0;
        let s = '';
        for (let i = 1; i <= 5; i++) s += i <= p ? '★' : '☆';
        return `<span class="stars">${s}</span>`;
    }
    
    // ====================================================================
    // FUNCIÓN DE RENDERIZADO DEL PRODUCTO
    // ====================================================================

    function renderProducto(producto, productosAll) {
        // Limpiar contenido antes de renderizar
        contenedor.innerHTML = ''; 
        
        const thumbs = (producto.imagen_miniatura || []).map(src => `<img src="${src}" class="thumb" alt="mini">`).join('');

        // Reviews summary (conteo por puntuación)
        const totalComentarios = producto.comentarios ? producto.comentarios.length : 0;
        const counts = {1:0,2:0,3:0,4:0,5:0};
        (producto.comentarios || []).forEach(c => {
            const v = Number(c.puntuacion) || 0; if (v>=1 && v<=5) counts[v]++;
        });

        // --- LÓGICA DE FORMATO DINÁMICO ---
        const formatoTitulo = producto.formato || 'FORMATO'; 
        
        // El JSON que proporcionaste tiene descripcion_formato como un STRING ('1.5 Kg'),
        // no un array, por lo que adaptamos la lógica. Si es un string, lo mostramos
        // como una única opción activa por defecto.
        let formatoOpciones;
        if (Array.isArray(producto.descripcion_formato)) {
             formatoOpciones = producto.descripcion_formato.map((desc, index) => `
                <div class="formato-opcion" data-formato="${desc}" data-index="${index}">
                    ${desc}
                </div>
            `).join('');
        } else {
             formatoOpciones = `
                <div class="formato-opcion formato-activo" data-formato="${producto.descripcion_formato || 'N/A'}" data-index="0">
                    ${producto.descripcion_formato || 'N/A'}
                </div>
             `;
        }
        // ------------------------------------

        // Related: tomar 4 productos distintos
        const related = (productosAll || []).filter(p => p.id !== producto.id).slice(0,4);
        const relatedHtml = related.map(r => `
            <div class="related-card">
                <img src="${r.imagen_principal}" alt="${r.nombre_producto}">
                <h4>${r.nombre_producto}</h4>
                <p class="r-price">${formatPrice(r.precio)}</p>
                <a href="detalle_producto.html?id=${r.id}" class="btn-small">Ver Detalles</a>
            </div>
        `).join('');

        // HTML INJECTION
        contenedor.innerHTML = `
            <section class="detalle-producto">
                <div class="galeria">
                    <div class="principal">
                        <img id="main-img" src="${producto.imagen_principal}" alt="${producto.nombre_producto}">
                    </div>
                    <div class="miniaturas">${thumbs}</div>
                </div>

                <aside class="info">
                    <p class="marca"><strong>Marca:</strong> ${producto.marca}</p>
                    <h1 class="producto-nombre">${producto.nombre_producto}</h1>
                    <div class="rating">${crearEstrellas(producto.puntuacion)} <span class="opiniones">${producto.opiniones} opiniones</span></div>
                    <p class="descripcion">${producto.descripcion}</p>

                    <div class="formato-box">
                        <div class="format-title">${formatoTitulo.toUpperCase()}</div>
                        <div class="format-options">
                            ${formatoOpciones}
                        </div>
                    </div>
                </aside>
                
                <div class="compra-box">
                    <div class="price-box">
                        <span class="price-label">Precio</span>
                        <div class="product-price">${formatPrice(producto.precio)}</div>
                        <div class="vat-info">Los precios incluyen cualquier IVA aplicable.</div>
                        <div class="delivery-info">Entrega GRATIS entre el x -x del mes</div>
                        <div class="stock-info">En stock</div>

                        <div class="cantidad quantity-selector">
                            <button id="qty-decr">-</button>
                            <input id="qty" type="number" value="1" min="1">
                            <button id="qty-incr">+</button>
                        </div>
                        <div class="acciones">
                            <button id="add-cart" class="add-to-cart-btn">
                                <i class="fas fa-shopping-cart"></i> Añadir al carrito
                            </button>
                            <button id="buy-now" class="buy-now-btn">Comprar ahora!</button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="related">
                <h3>Otros productos relacionados</h3>
                <div class="related-list">${relatedHtml}</div>
            </section>

            <section class="reviews">
                <h3>Reseñas de clientes</h3>
                <div class="reviews-summary">
                    <div class="stars-big">${crearEstrellas(producto.puntuacion)} <span>${producto.opiniones || ''} opiniones</span></div>
                    <div class="bars">
                        <div>5 <div class="bar"><div style="width:${totalComentarios > 0 ? (counts[5] / totalComentarios) * 100 : 0}%"></div></div> ${counts[5]||0}</div>
                        <div>4 <div class="bar"><div style="width:${totalComentarios > 0 ? (counts[4] / totalComentarios) * 100 : 0}%"></div></div> ${counts[4]||0}</div>
                        <div>3 <div class="bar"><div style="width:${totalComentarios > 0 ? (counts[3] / totalComentarios) * 100 : 0}%"></div></div> ${counts[3]||0}</div>
                        <div>2 <div class="bar"><div style="width:${totalComentarios > 0 ? (counts[2] / totalComentarios) * 100 : 0}%"></div></div> ${counts[2]||0}</div>
                        <div>1 <div class="bar"><div style="width:${totalComentarios > 0 ? (counts[1] / totalComentarios) * 100 : 0}%"></div></div> ${counts[1]||0}</div>
                    </div>
                </div>

                <div class="comentarios">
                    ${(producto.comentarios || []).map(c=>`
                        <div class="comentario">
                            <div class="meta"><strong>${c.usuario}</strong> — <small>${c.fecha}</small> <span class="p">${crearEstrellas(c.puntuacion)}</span></div>
                            <p>${c.texto}</p>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;

        // ====================================================================
        // LISTENERS
        // ====================================================================

        // 1. Galería de miniaturas
        document.querySelectorAll('.miniaturas img.thumb').forEach(img => {
            img.addEventListener('click', () => {
                const main = document.getElementById('main-img');
                if (main) main.src = img.src;
                
                document.querySelectorAll('.miniaturas img.thumb').forEach(t => t.classList.remove('active'));
                img.classList.add('active');
            });
        });
        if (document.querySelector('.miniaturas img.thumb')) {
            document.querySelector('.miniaturas img.thumb').classList.add('active');
        }

        // 2. Selección de Formato (Si hay múltiples opciones)
        if (Array.isArray(producto.descripcion_formato)) {
            const formatOptions = document.querySelectorAll('.formato-opcion');
            if (formatOptions.length > 0) {
                formatOptions[0].classList.add('formato-activo');

                formatOptions.forEach(opcion => {
                    opcion.addEventListener('click', () => {
                        formatOptions.forEach(o => o.classList.remove('formato-activo'));
                        opcion.classList.add('formato-activo');
                    });
                });
            }
        }

        // 3. Controles de Cantidad (Qty)
        const qtyEl = document.getElementById('qty');
        document.getElementById('qty-incr').addEventListener('click', ()=> { qtyEl.value = Math.max(1, Number(qtyEl.value) + 1); });
        document.getElementById('qty-decr').addEventListener('click', ()=> { qtyEl.value = Math.max(1, Number(qtyEl.value) - 1); });

        // 4. Botón Añadir al Carrito (Guarda el formato)
        document.getElementById('add-cart').addEventListener('click', ()=>{
            const cantidad = Number(qtyEl.value) || 1;
            
            const formatoSeleccionadoEl = document.querySelector('.formato-opcion.formato-activo');
            const formatoSeleccionado = formatoSeleccionadoEl 
                                        ? formatoSeleccionadoEl.getAttribute('data-formato') 
                                        : producto.descripcion_formato || 'N/A'; // Usa el string si no hay opciones
            
            const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
            carrito.push({ 
                id: producto.id, 
                nombre: producto.nombre_producto, 
                precio: producto.precio, 
                cantidad: cantidad,
                formato: formatoSeleccionado 
            });
            localStorage.setItem('carrito', JSON.stringify(carrito));
            alert(`${cantidad} x ${producto.nombre_producto} (${formatoSeleccionado}) añadido al carrito.`);
        });

        // 5. Botón Comprar Ahora
        document.getElementById('buy-now').addEventListener('click', ()=>{
            alert('Proceder a compra (demo): ' + producto.nombre_producto);
        });
    }

    // ====================================================================
    // FUNCIÓN DE CAMBIO DE PRODUCTO PRINCIPAL (Exportada a window)
    // ====================================================================

    window.cambiarProductoPrincipal = function(productId, productosList) {
        const producto = productosList.find(p => p.id === productId);

        if (!producto) {
            if (contenedor) contenedor.innerHTML = `<p>Producto con ID '${productId}' no encontrado.</p>`;
            return;
        }

        renderProducto(producto, productosList);
    }

    
    // ====================================================================
    // FUNCIÓN PRINCIPAL DE CARGA Y RENDERIZADO (Exportada a window)
    // ====================================================================

    window.cargarDetalleYRelacionados = async function() {
        if (contenedor) contenedor.innerHTML = `<p>Cargando detalle en idioma (${window.idiomaActual})...</p>`;

        try {
            // 1. Cargar datos
            const productos = await fetchProductos();

            if (productos.length === 0) {
                 if (contenedor) contenedor.innerHTML = `<p style="color: red;">No hay productos cargados para el idioma '${window.idiomaActual}'.</p>`;
                 return;
            }

            // 2. Determinar el producto a mostrar
            const productIdFromUrl = getQueryParam('id');
            const defaultProductId = productIdFromUrl || productos[0].id;

            // 3. Renderizar el producto principal
            window.cambiarProductoPrincipal(defaultProductId, productos);

        } catch (err) {
            console.error("Error crítico en cargarDetalleYRelacionados:", err);
            if (contenedor) contenedor.innerHTML = `<p style="color:red">Error cargando datos del producto. Revise la Consola (F12) para detalles de la ruta o el JSON.</p>`;
        }
    };


    // ====================================================================
    // INICIALIZACIÓN
    // ====================================================================
    
    // Inicia la carga de datos al final del script.
    window.cargarDetalleYRelacionados();


})();