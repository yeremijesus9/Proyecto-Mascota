<<<<<<< HEAD
// detalle_producto.js
// Carga un producto desde el JSON según el parámetro ?id=PRODUCTID
// y renderiza la vista de detalle.

(async function() {
    'use strict';

    // Helper: obtener query param
    function getQueryParam(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    // Determina la ruta del JSON: usa la función global si existe (window.rutaJson)
    function obtenerRutaJson() {
        if (typeof window.rutaJson === 'function') {
            try { return window.rutaJson(); } catch (e) { /* fallthrough */ }
        }
        // fallback razonable
        return '/assets/JSON/es_mascota.json';
    }

    const contenedor = document.getElementById('productos-contenedor');
    if (!contenedor) return;

    const productoId = getQueryParam('id');

    async function fetchProductos() {
        const ruta = obtenerRutaJson();
        const res = await fetch(ruta);
        if (!res.ok) throw new Error('Error cargando JSON: ' + res.status);
        const data = await res.json();
        const productos = Array.isArray(data) ? data : data.mascotas || [];
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

    function renderProducto(producto, productosAll) {
        const thumbs = (producto.imagen_miniatura || []).map(src => `<img src="${src}" class="thumb" alt="mini">`).join('');

        // Reviews summary (conteo por puntuación)
        const totalComentarios = producto.comentarios ? producto.comentarios.length : 0;
        const counts = {1:0,2:0,3:0,4:0,5:0};
        (producto.comentarios || []).forEach(c => {
            const v = Number(c.puntuacion) || 0; if (v>=1 && v<=5) counts[v]++;
        });

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

        // Alinear la clase principal con el CSS: usamos 'detalle-producto'
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
                        <div class="format-title">FORMATO</div>
                        <div class="format-options">
                            <div class="formato-opcion formato-activo">2.5 Kg</div>
                            <div class="formato-opcion">5 Kg</div>
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

        // listeners: thumbnails
        document.querySelectorAll('.miniaturas img.thumb').forEach(img => {
            img.addEventListener('click', () => {
                const main = document.getElementById('main-img');
                if (main) main.src = img.src;
                
                // Efecto activo en miniatura (opcional)
                document.querySelectorAll('.miniaturas img.thumb').forEach(t => t.classList.remove('active'));
                img.classList.add('active');
            });
        });
        // Agregar 'active' a la primera miniatura si existe
        if (document.querySelector('.miniaturas img.thumb')) {
            document.querySelector('.miniaturas img.thumb').classList.add('active');
        }


        // qty controls
        const qtyEl = document.getElementById('qty');
        document.getElementById('qty-incr').addEventListener('click', ()=> { qtyEl.value = Math.max(1, Number(qtyEl.value) + 1); });
        document.getElementById('qty-decr').addEventListener('click', ()=> { qtyEl.value = Math.max(1, Number(qtyEl.value) - 1); });

        document.getElementById('add-cart').addEventListener('click', ()=>{
            const cantidad = Number(qtyEl.value) || 1;
            // comportamiento mínimo: almacenar en localStorage carrito simple
            const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
            carrito.push({ id: producto.id, nombre: producto.nombre_producto, precio: producto.precio, cantidad });
            localStorage.setItem('carrito', JSON.stringify(carrito));
            alert(`${cantidad} x ${producto.nombre_producto} añadido al carrito.`);
        });

        document.getElementById('buy-now').addEventListener('click', ()=>{
            alert('Proceder a compra (demo): ' + producto.nombre_producto);
        });
    }

    // main
    try {
        const productos = await fetchProductos();

        let producto;
        if (productoId) {
            producto = productos.find(p => p.id === productoId);
            if (!producto) {
                contenedor.innerHTML = `<p>Producto con id '${productoId}' no encontrado.</p>`;
                return;
            }
        } else {
            // si no hay id, mostrar el primero
            producto = productos[0];
        }

        renderProducto(producto, productos);
    } catch (err) {
        console.error(err);
        contenedor.innerHTML = `<p style="color:red">Error cargando datos del producto. Comprueba la ruta del JSON en consola.</p>`;
    }

})();
=======
const mascota = '/assets/JSON/mascota.json';

async function cargarYMostrarProductos() {
    const contenedor = document.getElementById('productos-contenedor');
    
    try {
        const respuesta = await fetch(mascota); 
        
        if (!respuesta.ok) {
            contenedor.innerHTML = '<p style="color: red;">¡Error! No se pudo acceder a mascota.json.</p>';
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const productos = await respuesta.json(); 

        contenedor.innerHTML = ''; 

        // 4. Iterar y generar HTML por cada producto
        productos.forEach(producto => {
            // Desestructuración para acceder fácilmente a las propiedades
            const { 
                id, 
                nombre_producto, 
                marca, 
                precio, 
                puntuacion, 
                opiniones,
                imagen_principal,
                descripcion
            } = producto;

            const tarjetaProducto = document.createElement('div');
            tarjetaProducto.className = 'tarjeta-producto';

            // Generar el HTML de la tarjeta
            tarjetaProducto.innerHTML = `
                <img src "${imagen_principal}" alt=imagen de ${nombre_producto} class="producto-imagen">
                <h3 class="producto-nombre">${nombre_producto}</h3>
                <p class="producto-marca">Marca: <strong>${marca}</strong></p>
                <p class="producto-descripcion">${descripcion.substring(0, 100)}...</p>
                
                <div class="producto-detalle">
                    <span class="precio">${precio.toFixed(2)} €</span>
                    <span class="puntuacion">⭐ ${puntuacion} (${opiniones})</span>
                </div>
                
                <button onclick="mostrarDetalle('${id}', '${nombre_producto}')">Ver Detalles</button>
            `;

            contenedor.appendChild(tarjetaProducto);
        });

    } catch (error) {
        console.error("No se pudo cargar o procesar el JSON:", error);
    }
}

// Función de ejemplo para un botón
function mostrarDetalle(id, nombre) {
    alert(`Has hecho clic en: ${nombre} (ID: ${id})`);
    // Aquí podrías redirigir a una página de detalle:
    // window.location.href = \`detalle.html?id=${id}\`;
}

// Iniciar la carga de datos al cargar el script
cargarYMostrarProductos();
>>>>>>> b91daee (Integraciòn JSON a objeto js)
