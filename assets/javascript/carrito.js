// carrito de compras - versión final
// este archivo maneja todo lo del carrito: añadir, quitar, ver productos, etc

// evito que se ejecute dos veces porque a veces se carga el js varias veces
if (window.CARRITO_INICIALIZADO) {
    console.warn("⚠️ carrito ya estaba inicializado, no lo vuelvo a iniciar");
} else {
    window.CARRITO_INICIALIZADO = true;

    // aquí guardo los productos que el usuario va añadiendo
    let carrito = [];

    // cargo el carrito cuando empieza la página
    cargarCarrito();

    // espero a que el dom esté listo antes de iniciar todo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarrito);
    } else {
        initCarrito();
    }

    // inicializo el carrito creando el html y configurando los eventos
    function initCarrito() {
        crearHTML();
        actualizarContador();
        configurarListenersGlobales();
    }

    // configuro todos los eventos de click en una sola función para que no se dupliquen
    function configurarListenersGlobales() {

        document.body.addEventListener('click', function (e) {

            // botón de añadir al carrito
            const btnAnadir = e.target.closest('.btn-anadir-carrito');
            if (btnAnadir) {
                e.preventDefault();
                e.stopImmediatePropagation(); // detengo otros eventos

                // obtengo el id del producto
                const id = btnAnadir.dataset.productoId;

                // intento obtener los datos del objeto directo que asigné en el js
                let producto = btnAnadir.productoData;

                // si no hay objeto directo, busco en el dom como plan b
                if (!producto && id) {
                    const tarjeta = btnAnadir.closest('.tarjeta-producto');
                    if (tarjeta) {
                        const precioTexto = tarjeta.querySelector('.precio')?.textContent || "0";
                        const precio = parseFloat(precioTexto.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                        const imagen = tarjeta.querySelector('img')?.src || 'assets/img/placeholder.jpg';
                        const nombre = tarjeta.querySelector('h3')?.textContent || "Producto";

                        producto = {
                            id: id,
                            nombre: nombre,
                            precio: precio,
                            imagen: imagen
                        };
                    }
                }

                // si tengo datos del producto, lo añado al carrito
                if (producto) {
                    plusProducto(producto);
                } else {
                    console.error("❌ no pude obtener datos del producto");
                }
                return;
            }

            // botón de ver detalles
            const btnDetalle = e.target.closest('.ver-detalle');
            if (btnDetalle && btnDetalle.productoId) {
                e.preventDefault();
                window.location.href = `detalle_producto.html?id=${encodeURIComponent(btnDetalle.productoId)}`;
                return;
            }

            // click en el icono del carrito para abrirlo
            if (e.target.closest('.carrito-icono')) {
                e.preventDefault();
                toggleCarrito(true);
                return;
            }

            //cerrar el panel del carrito
            if (e.target.id === 'carrito-cerrar' || e.target.id === 'carrito-overlay') {
                toggleCarrito(false);
                return;
            }

            //vaciar todo el carrito
            if (e.target.id === 'btn-vaciar') {
                vaciarCarrito();
                return;
            }

            //cambiar cantidad con los botones + y -
            if (e.target.classList.contains('btn-cantidad')) {
                const id = e.target.dataset.id;
                const cambio = parseInt(e.target.dataset.cambio);
                cambiarCantidad(id, cambio);
                return;
            }

            //eliminar un producto específico
            if (e.target.classList.contains('btn-eliminar')) {
                const id = e.target.dataset.id;
                eliminarProducto(id);
                return;
            }

            //ir al checkout para finalizar compra
            const btnCheckout = e.target.closest('#btn-checkout');
            if (btnCheckout) {
                window.location.href = 'checkout.html';
                return;
            }
        });
    }

    // añado un producto al carrito o sumo cantidad si ya existe
    function plusProducto(producto) {
        const index = carrito.findIndex(p => p.id === producto.id);

        if (index !== -1) {
            // si ya existe, solo sumo 1 a la cantidad
            carrito[index].cantidad++;
        } else {
            // si no existe, lo añado como nuevo
            carrito.push({
                id: producto.id,
                nombre: producto.nombre || producto.nombre_producto,
                precio: parseFloat(producto.precio),
                imagen: producto.imagen || producto.imagen_principal,
                cantidad: 1
            });
        }

        guardarCarrito();
        renderizarCarrito(); // actualizo la vista del panel
        mostrarNotificacion();
    }

    // abro o cierro el panel lateral del carrito
    function toggleCarrito(abrir) {
        const panel = document.getElementById('carrito-panel');
        const overlay = document.getElementById('carrito-overlay');
        if (abrir) {
            // antes de mostrar, recargo desde localstorage por si cambió en otra pestaña
            cargarCarrito();
            renderizarCarrito(); // muestro los datos frescos
            panel.classList.add('activo');
            overlay.classList.add('activo');
        } else {
            panel.classList.remove('activo');
            overlay.classList.remove('activo');
        }
    }

    // cambio la cantidad de un producto (puede ser +1 o -1)
    function cambiarCantidad(id, cambio) {
        const index = carrito.findIndex(p => p.id === id);
        if (index !== -1) {
            carrito[index].cantidad += cambio;
            // si la cantidad llega a 0 o menos, elimino el producto
            if (carrito[index].cantidad <= 0) {
                carrito.splice(index, 1);
            }
            guardarCarrito();
            renderizarCarrito();
        }
    }

    // elimino un producto específico del carrito
    function eliminarProducto(id) {
        carrito = carrito.filter(p => p.id !== id);
        guardarCarrito();
        renderizarCarrito();
    }

    // vacío todo el carrito después de confirmar
    function vaciarCarrito() {
        if (confirm("¿estás seguro de vaciar el carrito?")) {
            carrito = [];
            guardarCarrito();
            renderizarCarrito();
        }
    }

    // cargo el carrito desde localstorage cuando inicia la página
    function cargarCarrito() {
        carrito = JSON.parse(localStorage.getItem('MiwuffCarrito')) || [];
        actualizarContador();
    }

    // guardo el carrito en localstorage para que persista
    function guardarCarrito() {
        localStorage.setItem('MiwuffCarrito', JSON.stringify(carrito));
        actualizarContador();
    }

    // actualizo el número que aparece en el iconito del carrito
    function actualizarContador() {
        const contadores = document.querySelectorAll('.carrito-contador');
        const total = carrito.reduce((sum, p) => sum + p.cantidad, 0);
        contadores.forEach(c => {
            c.textContent = total;
            c.style.display = total > 0 ? 'flex' : 'none';
        });
    }

    // dibujo todos los productos dentro del panel del carrito
    function renderizarCarrito() {
        const contenedor = document.getElementById('carrito-contenido');
        const precioTotalEl = document.getElementById('carrito-total-precio');
        if (!contenedor) return;

        contenedor.innerHTML = '';
        let totalPrecio = 0;

        if (carrito.length === 0) {
            contenedor.innerHTML = '<div style="text-align:center; padding: 20px; color: #666;">tu carrito está vacío 🐶</div>';
        } else {
            carrito.forEach(p => {
                totalPrecio += p.precio * p.cantidad;
                contenedor.innerHTML += `
                    <div class="carrito-item">
                        <img src="${p.imagen}" alt="${p.nombre}">
                        <div>
                            <div class="nombre">${p.nombre}</div>
                            <div class="precio">€${(p.precio * p.cantidad).toFixed(2)}</div>
                            <div class="controles">
                                <button class="btn-cantidad" data-id="${p.id}" data-cambio="-1">-</button>
                                <span>${p.cantidad}</span>
                                <button class="btn-cantidad" data-id="${p.id}" data-cambio="1">+</button>
                                <button class="btn-eliminar" data-id="${p.id}">🗑️</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        if (precioTotalEl) precioTotalEl.textContent = `€${totalPrecio.toFixed(2)}`;
    }

    // creo el html del panel del carrito si no existe ya
    function crearHTML() {
        if (document.getElementById('carrito-panel')) return;

        const html = `
        <div id="carrito-overlay" class="carrito-overlay"></div>
        <div id="carrito-panel" class="carrito-panel">
            <div class="carrito-header">
                <h2>tu carrito </h2>
                <button id="carrito-cerrar">✕</button>
            </div>
            <div id="carrito-contenido" class="carrito-contenido"></div>
            <div class="carrito-footer">
                <div class="carrito-total">
                    <span>total:</span>
                    <span id="carrito-total-precio">€0.00</span>
                </div>
                <button id="btn-checkout" class="btn-checkout">finalizar compra</button>
                <button id="btn-vaciar" class="btn-vaciar">vaciar carrito</button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    // muestro una notificación cuando se añade un producto
    function mostrarNotificacion() {
        const notif = document.createElement('div');
        notif.textContent = "producto añadido";
        notif.style.cssText = "position:fixed; top:20px; right:20px; background:#28a745; color:white; padding:15px; border-radius:5px; z-index:10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1); animation: fadein 0.5s;";
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2000);
    }
}
