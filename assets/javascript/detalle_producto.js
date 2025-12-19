// página de detalle de producto - muestro info completa, galería, comentarios y productos relacionados

// inicio con el idioma guardado o español por defecto
window.idiomaActual = localStorage.getItem('idiomaSeleccionado') || "es";

// función que me da la ruta del json de productos según idioma
window.rutaJson = function() {
  return `/assets/JSON/${window.idiomaActual}_mascota.json`;
};

// función que me da la ruta del json de textos de interfaz
window.rutaInterfaceJson = function () {
  return `/assets/JSON/${window.idiomaActual}_interface.json`;
};

// aquí guardo todos los productos y textos
window.todosLosProductos = [];
window.textosInterface = {};

// función para cambiar idioma y recargar todo
window.cambiarIdioma = async function (nuevoIdioma) {
  if (window.idiomaActual === nuevoIdioma) return;

  window.idiomaActual = nuevoIdioma;
  localStorage.setItem('idiomaSeleccionado', nuevoIdioma);

  await window.cargarDetalleYRelacionados();
};


(async function () {
  'use strict';

  const contenedor = document.getElementById('productos-contenedor');
  if (!contenedor) return;

    // funciones auxiliares que uso en varios sitios
  
  // obtengo un parámetro de la url (ejemplo: ?id=CAT1)
  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  // formateo el precio para mostrarlo bonito
  function formatPrice(p) {
    return typeof p === 'number' ? p.toFixed(2) + ' €' : p;
  }

  // creo las estrellitas de puntuación
  function crearEstrellas(puntuacion) {
    const p = Number(puntuacion) || 0;
    let s = '';
    for (let i = 1; i <= 5; i++) s += i <= p ? '★' : '☆';
    return `<span class="stars">${s}</span>`;
  }

  // cargo los textos de interfaz desde el json
async function fetchInterfaceTextos() {
  const ruta = window.rutaInterfaceJson();
  const res = await fetch(ruta);

  if (!res.ok) {
    throw new Error(`error cargando interfaz: ${ruta}`);
  }

  window.textosInterface = await res.json();
}

  // cargo todos los productos desde el json
  async function fetchProductos() {
    const res = await fetch(window.rutaJson());
    if (!res.ok) throw new Error("error cargando productos");

    const data = await res.json();
    const productos = Array.isArray(data) ? data : data.mascotas || [];
    window.todosLosProductos = productos;
    return productos;
  }

  // renderizo el producto completo con toda su info
    function renderProducto(producto, productosAll) {

        contenedor.innerHTML = ''; 
        
        // creo las miniaturas de la galería
        const thumbs = (producto.imagen_miniatura || [])
            .map(src => `<img src="${src}" class="thumb" alt="mini">`)
            .join('');

        // cuento cuántos comentarios hay de cada puntuación (1 a 5 estrellas)
        const totalComentarios = producto.comentarios ? producto.comentarios.length : 0;
        const counts = {1:0,2:0,3:0,4:0,5:0};
        (producto.comentarios || []).forEach(c => {
            const v = Number(c.puntuacion) || 0;
            if (v>=1 && v<=5) counts[v]++;
        });

        // creo las opciones de formato (peso, tamaño, color, etc)
        let formatoOpciones;
        if (Array.isArray(producto.descripcion_formato)) {
            // si hay varias opciones, creo un botón para cada una
            formatoOpciones = producto.descripcion_formato.map((desc, index) => `
                <div class="formato-opcion" data-formato="${desc}" data-index="${index}">
                    ${desc}
                </div>
            `).join('');
        } else {
            // si solo hay una opción, la muestro directamente
            formatoOpciones = `
                <div class="formato-opcion formato-activo" data-formato="${producto.descripcion_formato || 'N/A'}">
                    ${producto.descripcion_formato || 'N/A'}
                </div>
            `;
        }

        // filtro productos relacionados de la misma categoría
        const related = (productosAll || [])
            .filter(p => p.categoria === producto.categoria && p.id !== producto.id)
            .slice(0, 4); // solo muestro 4

        // creo el html de los productos relacionados
        const relatedHtml = related.map(r => `
            <div class="related-card">
                <img src="${r.imagen_principal}" alt="${r.nombre_producto}">
                <h4>${r.nombre_producto}</h4>
                <p class="r-price">${formatPrice(r.precio)}</p>
                <a href="detalle_producto.html?id=${r.id}" class="btn-small">${window.textosInterface.ver_detalle || 'ver detalle'}</a>
            </div>
        `).join('');

        // creo todo el html del producto
        contenedor.innerHTML = `
            <section class="detalle-producto">
                <div class="galeria">
                    <div class="principal">
                        <img id="main-img" src="${producto.imagen_principal}" alt="${producto.nombre_producto}">
                    </div>
                    <div class="miniaturas">${thumbs}</div>
                </div>

                <aside class="info">
                    <p class="marca"><strong>marca:</strong> ${producto.marca}</p>
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
                        <span class="price-label">precio</span>
                        <div class="product-price">${formatPrice(producto.precio)}</div>
                        <div class="vat-info">los precios incluyen iva</div>
                        <div class="delivery-info">entrega gratis entre el x - x</div>
                        <div class="stock-info">en stock</div>

                        <div class="cantidad quantity-selector">
                            <button id="qty-decr">-</button>
                            <input id="qty" type="number" value="1" min="1">
                            <button id="qty-incr">+</button>
                        </div>
                        <div class="acciones">
                            <button id="add-cart" class="add-to-cart-btn">
                                <i class="fas fa-shopping-cart"></i>${window.textosInterface.detalle_agregar_carrito || 'añadir al carrito'}
                            </button>
                            <button id="buy-now" class="buy-now-btn">${window.textosInterface.detalle_comprar_ahora || 'comprar ahora'}</button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="related">
                <h3>${window.textosInterface.detalle_relacionados || 'productos relacionados'}</h3>
                <div class="related-list">${relatedHtml}</div>
            </section>

            <section class="reviews">
                <h3>${window.textosInterface.detalle_resenas_clientes || 'reseñas de clientes'}</h3>
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

        // configuro todos los eventos de la página

        // evento para cambiar imagen principal al hacer click en miniaturas
        document.querySelectorAll('.miniaturas img.thumb').forEach(img => {
            img.addEventListener('click', () => {
                document.getElementById('main-img').src = img.src;
                document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
                img.classList.add('active');
            });
        });

        // evento para seleccionar formato
        const formatOptions = document.querySelectorAll('.formato-opcion');
        formatOptions.forEach(o => {
            o.addEventListener('click', () => {
                formatOptions.forEach(x => x.classList.remove('formato-activo'));
                o.classList.add('formato-activo');
            });
        });

        // eventos para cambiar cantidad con botones + y -
        const qtyEl = document.getElementById('qty');
        document.getElementById('qty-incr').addEventListener('click', ()=> qtyEl.value = Number(qtyEl.value)+1);
        document.getElementById('qty-decr').addEventListener('click', ()=> qtyEl.value = Math.max(1, Number(qtyEl.value)-1));

        // evento para añadir al carrito
        document.getElementById('add-cart').addEventListener('click', ()=>{
            const cantidad = Number(qtyEl.value) || 1;
            const formato = document.querySelector('.formato-opcion.formato-activo')?.dataset.formato;

            // cargo el carrito actual desde localstorage
            const carrito = JSON.parse(localStorage.getItem('MiwuffCarrito') || '[]');
            
            // busco si el producto ya existe en el carrito
            const existente = carrito.find(item => item.id === producto.id);
            
            if (existente) {
                // si existe, solo sumo la cantidad
                existente.cantidad += cantidad;
            } else {
                // si no existe, lo añado nuevo
                carrito.push({
                    id: producto.id,
                    nombre: producto.nombre_producto,
                    precio: producto.precio,
                    imagen: producto.imagen_principal,
                    cantidad: cantidad,
                    formato: formato
                });
            }
            
            // guardo el carrito actualizado
            localStorage.setItem('MiwuffCarrito', JSON.stringify(carrito));
            
            // actualizo el contador del carrito si existe
            const contador = document.querySelector('.carrito-contador');
            if (contador) {
                const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
                contador.textContent = total;
                contador.style.display = total > 0 ? 'flex' : 'none';
            }
            
            // muestro notificación de éxito
            const notif = document.createElement('div');
            notif.textContent = ` ${cantidad} x ${producto.nombre_producto} añadido al carrito`;
            notif.style.cssText = "position:fixed; top:20px; right:20px; background:#28a745; color:white; padding:15px; border-radius:5px; z-index:10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);";
            document.body.appendChild(notif);
            setTimeout(() => notif.remove(), 2000);
        });

        // evento para comprar ahora (añade al carrito y va al checkout)
        document.getElementById('buy-now').addEventListener('click', ()=>{
            const cantidad = Number(qtyEl.value) || 1;
            const formato = document.querySelector('.formato-opcion.formato-activo')?.dataset.formato;

            // cargo el carrito
            const carrito = JSON.parse(localStorage.getItem('MiwuffCarrito') || '[]');
            
            // busco si ya existe
            const existente = carrito.find(item => item.id === producto.id);
            
            if (existente) {
                existente.cantidad += cantidad;
            } else {
                carrito.push({
                    id: producto.id,
                    nombre: producto.nombre_producto,
                    precio: producto.precio,
                    imagen: producto.imagen_principal,
                    cantidad: cantidad,
                    formato: formato
                });
            }
            
            // guardo y redirijo al checkout
            localStorage.setItem('MiwuffCarrito', JSON.stringify(carrito));
            window.location.href = 'checkout.html';
        });
    }

    // función para cambiar el producto principal que se muestra
    window.cambiarProductoPrincipal = function(productId, productosList) {
        const producto = productosList.find(p => p.id == productId);

        if (!producto) {
            contenedor.innerHTML = `<p>producto con id '${productId}' no encontrado</p>`;
            return;
        }

        renderProducto(producto, productosList);
    }

    // función principal que cargo al inicio y cuando cambio idioma
    window.cargarDetalleYRelacionados = async function() {
        contenedor.innerHTML = `<p>cargando detalle (${window.idiomaActual})...</p>`;

        try {
            // cargo textos de interfaz y productos
            await fetchInterfaceTextos();
            const productos = await fetchProductos();
            if (!productos.length) {
                contenedor.innerHTML = `<p>no hay productos disponibles</p>`;
                return;
            }

            // obtengo el id del producto de la url
            const productId = getQueryParam('id') || productos[0].id;

            // muestro el producto
            window.cambiarProductoPrincipal(productId, productos);

        } catch (err) {
            console.error(err);
            contenedor.innerHTML = `<p style="color:red">error cargando datos</p>`;
        }
    };

    // inicializo cargando el producto
    window.cargarDetalleYRelacionados();

})();
