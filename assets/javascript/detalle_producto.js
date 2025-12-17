
// Inicialización: Lee el idioma del localStorage o usa 'es' por defecto.
window.idiomaActual = localStorage.getItem('idiomaSeleccionado') || "es";

window.rutaJson = function() {
    // La ruta ahora depende de window.idiomaActual (ej: /assets/JSON/es_mascota.json)
    return `/assets/JSON/${window.idiomaActual}_mascota.json`;
};

// Variable global para almacenar todos los productos
window.todosLosProductos = []; 

// FUNCIÓN PARA CAMBIAR EL IDIOMA
window.cambiarIdioma = async function(nuevoIdioma) {
    if (window.idiomaActual === nuevoIdioma) {
        console.log(`El idioma ya es ${nuevoIdioma}.`);
        return;
    }
    window.idiomaActual = nuevoIdioma;
    localStorage.setItem('idiomaSeleccionado', nuevoIdioma);
    await window.cargarDetalleYRelacionados(); 
};


(async function() {
    'use strict';

    // HELPERS Y FETCHING

    function getQueryParam(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    function obtenerRutaJson() {
        return typeof window.rutaJson === 'function'
            ? window.rutaJson()
            : `/assets/JSON/${window.idiomaActual || 'es'}_mascota.json`; 
    }

    const contenedor = document.getElementById('productos-contenedor');
    if (!contenedor) return;

    async function fetchProductos() {
        const ruta = obtenerRutaJson();
        const res = await fetch(ruta);

        if (!res.ok) {
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

    // RENDERIZAR PRODUCTO COMPLETO

    function renderProducto(producto, productosAll) {

        contenedor.innerHTML = ''; 
        
        const thumbs = (producto.imagen_miniatura || [])
            .map(src => `<img src="${src}" class="thumb" alt="mini">`)
            .join('');

        // Reviews summary
        const totalComentarios = producto.comentarios ? producto.comentarios.length : 0;
        const counts = {1:0,2:0,3:0,4:0,5:0};
        (producto.comentarios || []).forEach(c => {
            const v = Number(c.puntuacion) || 0;
            if (v>=1 && v<=5) counts[v]++;
        });

        // --- LÓGICA DE FORMATO ---
        let formatoOpciones;
        if (Array.isArray(producto.descripcion_formato)) {
            formatoOpciones = producto.descripcion_formato.map((desc, index) => `
                <div class="formato-opcion" data-formato="${desc}" data-index="${index}">
                    ${desc}
                </div>
            `).join('');
        } else {
            formatoOpciones = `
                <div class="formato-opcion formato-activo" data-formato="${producto.descripcion_formato || 'N/A'}">
                    ${producto.descripcion_formato || 'N/A'}
                </div>
            `;
        }

        // *** FILTRAR RELACIONADOS POR MISMA CATEGORÍA (TU SOLICITUD) ***
        const related = (productosAll || [])
            .filter(p => p.categoria === producto.categoria && p.id !== producto.id)
            .slice(0, 4);

        const relatedHtml = related.map(r => `
            <div class="related-card">
                <img src="${r.imagen_principal}" alt="${r.nombre_producto}">
                <h4>${r.nombre_producto}</h4>
                <p class="r-price">${formatPrice(r.precio)}</p>
                <a href="detalle_producto.html?id=${r.id}" class="btn-small">Ver Detalles</a>
            </div>
        `).join('');

        // HTML COMPLETO DE PRODUCTO
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
                        <div class="format-title">${producto.formato || 'FORMATO'}</div>
                        <div class="format-options">
                            ${formatoOpciones}
                        </div>
                    </div>
                </aside>
                
                <div class="compra-box">
                    <div class="price-box">
                        <span class="price-label">Precio</span>
                        <div class="product-price">${formatPrice(producto.precio)}</div>
                        <div class="vat-info">Los precios incluyen IVA.</div>
                        <div class="delivery-info">Entrega GRATIS entre el x - x</div>
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
                <h3>Productos relacionados</h3>
                <div class="related-list">${relatedHtml}</div>
            </section>

            <section class="reviews">
                <h3>Reseñas de clientes</h3>
                <div class="reviews-summary">
                    <div class="stars-big">${crearEstrellas(producto.puntuacion)} <span>${producto.opiniones} opiniones</span></div>
                    <div class="bars">
                        <div>5 <div class="bar"><div style="width:${totalComentarios ? (counts[5]/totalComentarios)*100 : 0}%"></div></div> ${counts[5]}</div>
                        <div>4 <div class="bar"><div style="width:${totalComentarios ? (counts[4]/totalComentarios)*100 : 0}%"></div></div> ${counts[4]}</div>
                        <div>3 <div class="bar"><div style="width:${totalComentarios ? (counts[3]/totalComentarios)*100 : 0}%"></div></div> ${counts[3]}</div>
                        <div>2 <div class="bar"><div style="width:${totalComentarios ? (counts[2]/totalComentarios)*100 : 0}%"></div></div> ${counts[2]}</div>
                        <div>1 <div class="bar"><div style="width:${totalComentarios ? (counts[1]/totalComentarios)*100 : 0}%"></div></div> ${counts[1]}</div>
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

        // LISTENERS

        // Miniaturas
        document.querySelectorAll('.miniaturas img.thumb').forEach(img => {
            img.addEventListener('click', () => {
                document.getElementById('main-img').src = img.src;
                document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
                img.classList.add('active');
            });
        });

        // Formato
        const formatOptions = document.querySelectorAll('.formato-opcion');
        formatOptions.forEach(o => {
            o.addEventListener('click', () => {
                formatOptions.forEach(x => x.classList.remove('formato-activo'));
                o.classList.add('formato-activo');
            });
        });

        // Cantidad
        const qtyEl = document.getElementById('qty');
        document.getElementById('qty-incr').addEventListener('click', ()=> qtyEl.value = Number(qtyEl.value)+1);
        document.getElementById('qty-decr').addEventListener('click', ()=> qtyEl.value = Math.max(1, Number(qtyEl.value)-1));

        // Carrito
        document.getElementById('add-cart').addEventListener('click', ()=>{
            const cantidad = Number(qtyEl.value);
            const formato = document.querySelector('.formato-opcion.formato-activo')?.dataset.formato;

            const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
            carrito.push({
                id: producto.id,
                nombre: producto.nombre_producto,
                precio: producto.precio,
                cantidad,
                formato
            });
            localStorage.setItem('carrito', JSON.stringify(carrito));
            alert(`${cantidad} x ${producto.nombre_producto} añadido.`);
        });

        // Comprar ahora
        document.getElementById('buy-now').addEventListener('click', ()=>{
            alert("Procediendo a comprar " + producto.nombre_producto);
        });
    }

    // CAMBIAR PRODUCTO PRINCIPAL
    window.cambiarProductoPrincipal = function(productId, productosList) {
        const producto = productosList.find(p => p.id == productId);

        if (!producto) {
            contenedor.innerHTML = `<p>Producto con ID '${productId}' no encontrado.</p>`;
            return;
        }

        renderProducto(producto, productosList);
    }

    // FUNCIÓN PRINCIPAL
    window.cargarDetalleYRelacionados = async function() {
        contenedor.innerHTML = `<p>Cargando detalle (${window.idiomaActual})...</p>`;

        try {
            const productos = await fetchProductos();
            if (!productos.length) {
                contenedor.innerHTML = `<p>No hay productos disponibles.</p>`;
                return;
            }

            const productId = getQueryParam('id') || productos[0].id;

            window.cambiarProductoPrincipal(productId, productos);

        } catch (err) {
            console.error(err);
            contenedor.innerHTML = `<p style="color:red">Error cargando datos.</p>`;
        }
    };

    // Inicializar
    window.cargarDetalleYRelacionados();

})();
