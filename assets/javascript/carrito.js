// ==========================================
// CARRITO DE COMPRAS - VERSIÓN FINAL SEGURA
// ==========================================

// EVITAR EJECUCIÓN DOBLE (Solución definitiva)
if (window.CARRITO_INICIALIZADO) {
    console.warn("⚠️ Carrito ya estaba inicializado. Deteniendo segunda ejecución.");
} else {
    window.CARRITO_INICIALIZADO = true;

    const API_URL = 'http://localhost:3000/carrito';
    let carrito = [];

    // Cargar carrito al iniciar
    async function cargarCarritoAlInicio() {
        await cargarCarrito();
        actualizarContador();
    }
    cargarCarritoAlInicio();

    // Iniciar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarrito);
    } else {
        initCarrito();
    }

    // Función de inicio
    function initCarrito() {
        crearHTML();
        actualizarContador();
        configurarListenersGlobales();
    }

    // Configurar Listeners (UNA SOLA VEZ)
    function configurarListenersGlobales() {

        document.body.addEventListener('click', function (e) {

            // 1. CLICK EN ANADIR AL CARRITO
            const btnAnadir = e.target.closest('.btn-anadir-carrito');
            if (btnAnadir) {
                e.preventDefault();
                e.stopImmediatePropagation(); // Detener cualquier otro evento

                // Obtener datos
                const id = btnAnadir.dataset.productoId;

                // Intentar obtener datos del objeto directo (si fue asignado en JS)
                let producto = btnAnadir.productoData;

                // Si no hay objeto directo, intentar buscar en el DOM (fallback)
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

                if (producto) {
                    plusProducto(producto);
                } else {
                    console.error("❌ No se pudieron obtener datos del producto");
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
                e.preventDefault();
                vaciarCarrito();
                return;
            }

            // 6. CAMBIAR CANTIDAD (+ / -)
            const btnCantidad = e.target.closest('.btn-cantidad');
            if (btnCantidad) {
                e.preventDefault();
                e.stopImmediatePropagation();
                const id = btnCantidad.dataset.id;
                const cambio = parseInt(btnCantidad.dataset.cambio);
                cambiarCantidad(id, cambio);
                return;
            }

            // 7. ELIMINAR PROD
            const btnEliminar = e.target.closest('.btn-eliminar');
            if (btnEliminar) {
                e.preventDefault();
                e.stopImmediatePropagation();
                const id = btnEliminar.dataset.id;
                eliminarProducto(id);
                return;
            }

            // 8. CHECKOUT
            const btnCheckout = e.target.closest('#btn-checkout');
            if (btnCheckout) {
                e.preventDefault();
                window.location.href = 'checkout.html';
                return;
            }
        });
    }

    // Lógica del Carrito
    async function plusProducto(producto, cantidadSumar = 1) {
        // Sacamos el nombre como texto (por si viene objeto)
        const nombreCrudo = producto.nombre || producto.nombre_producto;
        const nombreFinal = typeof nombreCrudo === 'object' ? nombreCrudo[window.idiomaActual || 'es'] : nombreCrudo;

        const index = carrito.findIndex(p => p.id === producto.id);

        if (index !== -1) {
            // Si ya existe, actualizamos cantidad en el servidor
            const nuevaCantidad = carrito[index].cantidad + cantidadSumar;
            await actualizarCantidadServidor(producto.id, nuevaCantidad);
        } else {
            // Si no existe, lo creamos en el servidor
            const nuevoItem = {
                id: producto.id,
                nombre: nombreFinal,
                precio: parseFloat(producto.precio),
                imagen: producto.imagen || producto.imagen_principal,
                cantidad: cantidadSumar
            };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoItem)
                });
                if (!response.ok) throw new Error("Error al añadir");
            } catch (err) {
                console.error("No se pudo guardar en el servidor, usando respaldo local", err);
            }
        }

        await cargarCarrito(); // Recargar datos frescos del servidor
        renderizarCarrito();   // Actualizar panel visualmente
        mostrarNotificacion();
    }

    function toggleCarrito(abrir) {
        const panel = document.getElementById('carrito-panel');
        const overlay = document.getElementById('carrito-overlay');
        if (abrir) {
            // IMPORTANTE: Recargar desde localStorage antes de mostrar
            cargarCarrito();
            renderizarCarrito(); // Actualizar vista con datos frescos
            panel.classList.add('activo');
            overlay.classList.add('activo');
        } else {
            panel.classList.remove('activo');
            overlay.classList.remove('activo');
        }
    }

    async function cambiarCantidad(id, cambio) {
        const index = carrito.findIndex(p => p.id === id);
        if (index !== -1) {
            const nuevaCantidad = carrito[index].cantidad + cambio;

            if (nuevaCantidad <= 0) {
                await eliminarProducto(id);
            } else {
                await actualizarCantidadServidor(id, nuevaCantidad);
                await cargarCarrito();
                renderizarCarrito();
            }
        }
    }

    async function eliminarProducto(id) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await cargarCarrito();
            renderizarCarrito();
        } catch (err) {
            console.error("Error al eliminar", err);
        }
    }

    async function actualizarCantidadServidor(id, cantidad) {
        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cantidad: cantidad })
            });
        } catch (err) {
            console.error("Error al actualizar cantidad", err);
        }
    }

    async function vaciarCarrito() {
        if (confirm("¿Estás seguro de vaciar el carrito?")) {
            // JSON-Server no tiene un "delete all", hay que borrar uno por uno o resetear el array si tuvieras acceso total
            // Una forma rápida es recorrer el carrito actual y borrar cada ID
            for (const item of carrito) {
                await fetch(`${API_URL}/${item.id}`, { method: 'DELETE' });
            }
            await cargarCarrito();
            renderizarCarrito();
        }
    }

    // Persistencia y Renderizado
    async function cargarCarrito() {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                carrito = await response.json();
            }
        } catch (err) {
            console.error("Error al conectar con el servidor del carrito:", err);
            carrito = []; // Si falla el servidor, el carrito se muestra vacío
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
                                <button type="button" class="btn-cantidad" data-id="${p.id}" data-cambio="-1">-</button>
                                <span>${p.cantidad}</span>
                                <button type="button" class="btn-cantidad" data-id="${p.id}" data-cambio="1">+</button>
                                <button type="button" class="btn-eliminar" data-id="${p.id}">🗑️</button>
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
                <button type="button" id="btn-checkout" class="btn-checkout">Finalizar Compra</button>
                <button type="button" id="btn-vaciar" class="btn-vaciar">Vaciar Carrito</button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    // EXPORTAR FUNCIONES AL GLOBAL (Para detalle_producto.js y otros)
    window.plusProducto = plusProducto;
    window.cargarCarrito = cargarCarrito;
    window.renderizarCarrito = renderizarCarrito;

    function mostrarNotificacion() {
        const notif = document.createElement('div');
        notif.textContent = "Producto añadido";
        notif.style.cssText = "position:fixed; top:20px; right:20px; background:#28a745; color:white; padding:15px; border-radius:5px; z-index:10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1); animation: fadein 0.5s;";
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2000);
    }
}
