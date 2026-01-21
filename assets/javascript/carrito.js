
if (window.CARRITO_INICIALIZADO) {
    console.warn("⚠️ Carrito ya estaba inicializado. Deteniendo segunda ejecución.");
} else {
    window.CARRITO_INICIALIZADO = true;

    // Variables
    const API_URL = 'http://localhost:3000/carrito';
    let carrito = [];

    // Iniciar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarrito);
    } else {
        initCarrito();
    }

    // Función de inicio
    async function initCarrito() {
        crearHTML();
        await cargarCarrito();
        actualizarContador();
        configurarListenersGlobales();
    }

    // Configurar Listeners (UNA SOLA VEZ)
    function configurarListenersGlobales() {
        document.body.addEventListener('click', async function (e) {
            // 1. AÑADIR AL CARRITO
            const btnAnadir = e.target.closest('.btn-anadir-carrito');
            if (btnAnadir) {
                e.preventDefault();
                e.stopImmediatePropagation();
                const producto = btnAnadir.productoData;
                if (producto) {
                    await plusProducto(producto);
                } else {
                    console.error("❌ Error: El botón no tiene datos del producto asignados");
                }
                return;
            }

            // 2. CLICK EN VER DETALLES
            const btnDetalle = e.target.closest('.ver-detalle');
            if (btnDetalle && btnDetalle.productoId) {
                e.preventDefault();
                window.location.href = `detalle_producto.html?id=${encodeURIComponent(btnDetalle.productoId)}`;
                return;
            }

            // 3. CLICK EN ICONO CARRITO (ABRIR)
            if (e.target.closest('.carrito-icono')) {
                e.preventDefault();
                toggleCarrito(true);
                return;
            }

            // 4. CERRAR CARRITO
            if (e.target.id === 'carrito-cerrar' || e.target.id === 'carrito-overlay') {
                toggleCarrito(false);
                return;
            }

            // 5. VACIAR
            if (e.target.id === 'btn-vaciar') {
                await vaciarCarrito();
                return;
            }

            // 6. CAMBIAR CANTIDAD (+ / -)
            if (e.target.classList.contains('btn-cantidad')) {
                const id = e.target.dataset.id;
                const cambio = parseInt(e.target.dataset.cambio);
                await cambiarCantidad(id, cambio);
                return;
            }

            // 7. ELIMINAR PROD
            if (e.target.classList.contains('btn-eliminar')) {
                const id = e.target.dataset.id;
                await eliminarProducto(id);
                return;
            }

            // 8. CHECKOUT
            const btnCheckout = e.target.closest('#btn-checkout');
            if (btnCheckout) {
                window.location.href = 'checkout.html';
                return;
            }
        });
    }

    // Lógica del Carrito con Servidor
    async function plusProducto(producto) {
        const itemExistente = carrito.find(p => p.id === producto.id);

        if (itemExistente) {
            // Si ya existe en el servidor, actualizamos cantidad
            const nuevaCantidad = itemExistente.cantidad + 1;
            try {
                const res = await fetch(`${API_URL}/${producto.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cantidad: nuevaCantidad })
                });
                if (res.ok) {
                    itemExistente.cantidad = nuevaCantidad;
                }
            } catch (err) {
                console.error("Error actualizando producto:", err);
            }
        } else {
            // Si no existe, lo creamos
            const nuevoItem = {
                id: producto.id,
                nombre: producto.nombre || producto.nombre_producto,
                precio: parseFloat(producto.precio),
                imagen: producto.imagen || producto.imagen_principal,
                cantidad: 1
            };
            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoItem)
                });
                if (res.ok) {
                    carrito.push(nuevoItem);
                }
            } catch (err) {
                console.error("Error añadiendo producto:", err);
            }
        }

        actualizarContador();
        renderizarCarrito();
        mostrarNotificacion();
    }

    async function toggleCarrito(abrir) {
        const panel = document.getElementById('carrito-panel');
        const overlay = document.getElementById('carrito-overlay');
        if (abrir) {
            await cargarCarrito();
            renderizarCarrito();
            panel.classList.add('activo');
            overlay.classList.add('activo');
        } else {
            panel.classList.remove('activo');
            overlay.classList.remove('activo');
        }
    }

    async function cambiarCantidad(id, cambio) {
        const index = carrito.findIndex(p => p.id === id);
        if (index === -1) return;

        const nuevaCantidad = carrito[index].cantidad + cambio;

        if (nuevaCantidad <= 0) {
            await eliminarProducto(id);
        } else {
            try {
                const res = await fetch(`${API_URL}/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cantidad: nuevaCantidad })
                });
                if (res.ok) {
                    carrito[index].cantidad = nuevaCantidad;
                    actualizarContador();
                    renderizarCarrito();
                }
            } catch (err) {
                console.error("Error cambiando cantidad:", err);
            }
        }
    }

    async function eliminarProducto(id) {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                carrito = carrito.filter(p => p.id !== id);
                actualizarContador();
                renderizarCarrito();
            }
        } catch (err) {
            console.error("Error eliminando producto:", err);
        }
    }

    async function vaciarCarrito() {
        if (!confirm("¿Estás seguro de vaciar el carrito?")) return;
        
        try {
            // json-server no permite borrar todo de golpe, hay que borrar uno por uno
            // O podemos simplemente re-cargar para estar seguros de lo que hay
            for (const item of carrito) {
                await fetch(`${API_URL}/${item.id}`, { method: 'DELETE' });
            }
            carrito = [];
            actualizarContador();
            renderizarCarrito();
        } catch (err) {
            console.error("Error vaciando carrito:", err);
        }
    }

    // Persistencia y Renderizado
    async function cargarCarrito() {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                carrito = await response.json();
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar el carrito del servidor:', error);
            carrito = [];
        }
        actualizarContador();
    }

    function actualizarContador() {
        const contadores = document.querySelectorAll('.carrito-contador');
        const total = carrito.reduce((sum, p) => sum + p.cantidad, 0);
        contadores.forEach(c => {
            c.textContent = total;
            c.style.display = total > 0 ? 'flex' : 'none';
        });
    }

    function renderizarCarrito() {
        const contenedor = document.getElementById('carrito-contenido');
        const precioTotalEl = document.getElementById('carrito-total-precio');
        if (!contenedor) return;

        contenedor.innerHTML = '';
        let totalPrecio = 0;

        if (carrito.length === 0) {
            contenedor.innerHTML = '<div style="text-align:center; padding: 20px; color: #666;">Tu carrito está vacío 🐶</div>';
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

    function mostrarNotificacion() {
        const notif = document.createElement('div');
        notif.textContent = "Producto añadido";
        notif.style.cssText = "position:fixed; top:20px; right:20px; background:#28a745; color:white; padding:15px; border-radius:5px; z-index:10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1); animation: fadein 0.5s;";
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2000);
    }
}
