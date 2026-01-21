if (window.CARRITO_INICIALIZADO) {
    console.warn("carrito ya iniciado");
} else {
    window.CARRITO_INICIALIZADO = true;

    // --- variables globales ---
    const API_URL = 'http://localhost:3000/carrito'; // url de la base de datos
    let carrito = []; // lista de productos

    // --- inicio ---
    // ver si el html cargo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarrito);
    } else {
        initCarrito();
    }

    // funcion que arranca todo
    async function initCarrito() {
        crearHTML(); // crea el panel oculto
        await cargarCarrito(); // trae los datos
        configurarListenersGlobales(); // activa los clicks
    }

    // --- eventos ---
    // escuchamos los clicks en el body
    function configurarListenersGlobales() {
        document.body.addEventListener('click', async function (e) {

            // si pulsamos añadir
            const btnAnadir = e.target.closest('.btn-anadir-carrito');
            if (btnAnadir) {
                e.preventDefault();
                const producto = btnAnadir.productoData;
                if (producto) await plusProducto(producto);
                return;
            }

            // ver detalles del producto
            const btnDetalle = e.target.closest('.ver-detalle');
            if (btnDetalle && btnDetalle.productoId) {
                e.preventDefault();
                window.location.href = `detalle_producto.html?id=${encodeURIComponent(btnDetalle.productoId)}`;
                return;
            }

            // abrir carrito
            if (e.target.closest('.carrito-icono')) {
                e.preventDefault();
                toggleCarrito(true);
                return;
            }

            // cerrar carrito
            if (e.target.id === 'carrito-cerrar' || e.target.id === 'carrito-overlay') {
                toggleCarrito(false);
                return;
            }

            // vaciar carrito
            if (e.target.id === 'btn-vaciar') {
                await vaciarCarrito();
                return;
            }

            // botones mas y menos
            if (e.target.classList.contains('btn-cantidad')) {
                const id = e.target.dataset.id;
                const cambio = parseInt(e.target.dataset.cambio);
                await cambiarCantidad(id, cambio);
                return;
            }

            // borrar producto
            if (e.target.classList.contains('btn-eliminar')) {
                const id = e.target.dataset.id;
                await eliminarProducto(id);
                return;
            }

            // ir a pagar
            if (e.target.closest('#btn-checkout')) {
                window.location.href = 'checkout.html';
                return;
            }
        });
    }

    // --- logica ---

    // añadir o sumar cantidad
    async function plusProducto(producto, cantidad = 1) {
        const itemExistente = carrito.find(p => p.id === producto.id);

        if (itemExistente) {
            // si existe sumamos la cantidad
            await cambiarCantidad(producto.id, cantidad);
        } else {
            // si es nuevo usamos post con la cantidad indicada
            const nuevoItem = {
                id: producto.id,
                nombre: producto.nombre || producto.nombre_producto,
                precio: parseFloat(producto.precio),
                imagen: producto.imagen || producto.imagen_principal,
                cantidad: cantidad
            };
            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoItem)
                });
                if (res.ok) {
                    carrito.push(nuevoItem);
                    refrescarUI();
                }
            } catch (err) {
                console.error("error añadiendo:", err);
            }
        }
        mostrarNotificacion();
    }

    // ver u ocultar panel
    async function toggleCarrito(abrir) {
        const panel = document.getElementById('carrito-panel');
        const overlay = document.getElementById('carrito-overlay');
        if (abrir) {
            await cargarCarrito(); // datos frescos
            panel.classList.add('activo');
            overlay.classList.add('activo');
        } else {
            panel.classList.remove('activo');
            overlay.classList.remove('activo');
        }
    }

    // cambiar cantidad con patch
    async function cambiarCantidad(id, cambio) {
        const index = carrito.findIndex(p => p.id === id);
        if (index === -1) return;

        const nuevaCantidad = carrito[index].cantidad + cambio;

        if (nuevaCantidad <= 0) {
            await eliminarProducto(id); // si es cero se borra
        } else {
            try {
                const res = await fetch(`${API_URL}/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cantidad: nuevaCantidad })
                });
                if (res.ok) {
                    carrito[index].cantidad = nuevaCantidad;
                    refrescarUI();
                }
            } catch (err) {
                console.error("error cantidad:", err);
            }
        }
    }

    // borrar con delete
    async function eliminarProducto(id) {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                carrito = carrito.filter(p => p.id !== id);
                refrescarUI();
            }
        } catch (err) {
            console.error("error borrar:", err);
        }
    }

    // vaciar del servidor
    async function vaciarCarrito() {
        if (!confirm("seguro de vaciar el carrito?")) return;
        try {
            for (const item of carrito) {
                await fetch(`${API_URL}/${item.id}`, { method: 'DELETE' });
            }
            carrito = [];
            refrescarUI();
        } catch (err) {
            console.error("error vaciando:", err);
        }
    }

    // --- visual ---

    // traer datos
    async function cargarCarrito() {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                carrito = await response.json();
            }
        } catch (error) {
            carrito = [];
        }
        refrescarUI();
    }

    // actualizar todo
    function refrescarUI() {
        actualizarContador();
        renderizarCarrito();
    }

    // numero del icono
    function actualizarContador() {
        const contadores = document.querySelectorAll('.carrito-contador');
        const total = carrito.reduce((sum, p) => sum + p.cantidad, 0);
        contadores.forEach(c => {
            c.textContent = total;
            c.style.display = total > 0 ? 'flex' : 'none';
        });
    }

    // dibujar productos
    function renderizarCarrito() {
        const contenedor = document.getElementById('carrito-contenido');
        const precioTotalEl = document.getElementById('carrito-total-precio');
        if (!contenedor) return;

        contenedor.innerHTML = '';
        let totalPrecio = 0;

        if (carrito.length === 0) {
            contenedor.innerHTML = '<div style="text-align:center; padding: 20px; color: #666;">carrito vacio 🐶</div>';
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

    // crear panel html
    function crearHTML() {
        if (document.getElementById('carrito-panel')) return;
        const html = `
        <div id="carrito-overlay" class="carrito-overlay"></div>
        <div id="carrito-panel" class="carrito-panel">
            <div class="carrito-header">
                <h2>Tu Carrito </h2>
                <button id="carrito-cerrar">✕</button>
            </div>
            <div id="carrito-contenido" class="carrito-contenido"></div>
            <div class="carrito-footer">
                <div class="carrito-total">
                    <span>Total:</span>
                    <span id="carrito-total-precio">€0.00</span>
                </div>
                <button id="btn-checkout" class="btn-checkout">Finalizar Compra</button>
                <button id="btn-vaciar" class="btn-vaciar">Vaciar Carrito</button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    // aviso rapido
    function mostrarNotificacion() {
        const notif = document.createElement('div');
        notif.textContent = "producto añadido";
        notif.style.cssText = "position:fixed; top:20px; right:20px; background:#28a745; color:white; padding:15px; border-radius:5px; z-index:10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);";
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2000);
    }

    // exportamos funciones a window para usarlas en otros archivos
    window.plusProducto = plusProducto;
    window.cambiarCantidad = cambiarCantidad;
    window.renderizarCarrito = renderizarCarrito;
}
