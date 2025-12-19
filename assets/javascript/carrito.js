// aquí controlo todo lo del carrito (añadir, quitar, comprar).
// pongo esta bandera para no cargar el script mil veces si el usuario se mueve mucho.
if (window.CARRITO_INICIALIZADO) {
    console.warn("⚠️ carrito ya estaba inicializado");
} else {
    window.CARRITO_INICIALIZADO = true;

    // los productos los guardo aquí durante la sesión.
    let carrito = [];

    // al arrancar, cargo lo que ya estaba guardado y preparo el dom.
    cargarCarrito();

    // espero al dom para que no me de error al buscar elementos.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarrito);
    } else {
        initCarrito();
    }

    // preparo el html y activo los escuchadores de eventos.
    function initCarrito() {
        crearHTML();
        actualizarContador();
        configurarListenersGlobales();
    }

    // meto los eventos en el body para que sea más fácil y no se dupliquen.
    function configurarListenersGlobales() {

        document.body.addEventListener('click', function (e) {

            // añadir producto: busco el id y los datos que guardé en el botón.
            const btnAnadir = e.target.closest('.btn-anadir-carrito');
            if (btnAnadir) {
                e.preventDefault();
                e.stopImmediatePropagation();

                const id = btnAnadir.dataset.productoId;
                let producto = btnAnadir.productoData;

                if (producto) plusProducto(producto);
                return;
            }

            // para ver detalles o ir a pagar.
            const btnDetalle = e.target.closest('.ver-detalle');
            if (btnDetalle && btnDetalle.productoId) {
                e.preventDefault();
                window.location.href = `detalle_producto.html?id=${encodeURIComponent(btnDetalle.productoId)}`;
                return;
            }

            // abrir panel con el icono, cerrar con la x o el overlay.
            if (e.target.closest('.carrito-icono')) {
                e.preventDefault();
                toggleCarrito(true);
                return;
            }

            if (e.target.id === 'carrito-cerrar' || e.target.id === 'carrito-overlay') {
                toggleCarrito(false);
                return;
            }

            // gestionar: vaciar todo, cambiar cantidades o quitar uno.
            if (e.target.id === 'btn-vaciar') {
                vaciarCarrito();
                return;
            }

            if (e.target.classList.contains('btn-cantidad')) {
                const id = e.target.dataset.id;
                const cambio = parseInt(e.target.dataset.cambio);
                cambiarCantidad(id, cambio);
                return;
            }

            if (e.target.classList.contains('btn-eliminar')) {
                const id = e.target.dataset.id;
                eliminarProducto(id);
                return;
            }

            if (e.target.closest('#btn-checkout')) {
                window.location.href = 'checkout.html';
                return;
            }
        });
    }

    // sumo un producto o aumento su cantidad si ya está.
    function plusProducto(producto) {
        const index = carrito.findIndex(p => p.id === producto.id);

        if (index !== -1) {
            carrito[index].cantidad++;
        } else {
            carrito.push({
                id: producto.id,
                nombre: producto.nombre || producto.nombre_producto,
                precio: parseFloat(producto.precio),
                imagen: producto.imagen || producto.imagen_principal,
                cantidad: 1
            });
        }

        guardarCarrito();
        renderizarCarrito();
        mostrarNotificacion();
    }

    // mover el panel lateral (abrir/cerrar) con las clases.
    function toggleCarrito(abrir) {
        const panel = document.getElementById('carrito-panel');
        const overlay = document.getElementById('carrito-overlay');
        if (abrir) {
            cargarCarrito();
            renderizarCarrito();
            panel.classList.add('activo');
            overlay.classList.add('activo');
        } else {
            panel.classList.remove('activo');
            overlay.classList.remove('activo');
        }
    }

    // subir o bajar cantidad. si llega a cero, fuera.
    function cambiarCantidad(id, cambio) {
        const index = carrito.findIndex(p => p.id === id);
        if (index !== -1) {
            carrito[index].cantidad += cambio;
            if (carrito[index].cantidad <= 0) {
                carrito.splice(index, 1);
            }
            guardarCarrito();
            renderizarCarrito();
        }
    }

    function eliminarProducto(id) {
        carrito = carrito.filter(p => p.id !== id);
        guardarCarrito();
        renderizarCarrito();
    }

    function vaciarCarrito() {
        if (confirm("¿quieres vaciar todo el carrito?")) {
            carrito = [];
            guardarCarrito();
            renderizarCarrito();
        }
    }

    // guardo y cargo de localstorage para no perder nada al recargar.
    function cargarCarrito() {
        carrito = JSON.parse(localStorage.getItem('MiwuffCarrito')) || [];
        actualizarContador();
    }

    function guardarCarrito() {
        localStorage.setItem('MiwuffCarrito', JSON.stringify(carrito));
        actualizarContador();
    }

    // actualizo el iconito rojo con el número total.
    function actualizarContador() {
        const contadores = document.querySelectorAll('.carrito-contador');
        const total = carrito.reduce((sum, p) => sum + p.cantidad, 0);
        contadores.forEach(c => {
            c.textContent = total;
            c.style.display = total > 0 ? 'flex' : 'none';
        });
    }

    // dibujo de nuevo el interior del carrito si hay cambios.
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

    // inyecto el html del carrito dinámicamente para no ensuciar el index.
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

    // aviso rápido arriba a la derecha.
    function mostrarNotificacion() {
        const notif = document.createElement('div');
        notif.textContent = "producto añadido";
        notif.style.cssText = "position:fixed; top:20px; right:20px; background:#28a745; color:white; padding:15px; border-radius:5px; z-index:10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1); animation: fadein 0.5s;";
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2000);
    }
}
