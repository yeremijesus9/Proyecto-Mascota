// Checkout Simple
let carritoCheckout = [];
const ENVIO = 4.99;

// Cargar cuando la página esté lista
document.addEventListener('DOMContentLoaded', function () {
    cargarCarrito();
    mostrarProductos();
    calcularTotales();

    // Evento del formulario
    document.getElementById('form-checkout').addEventListener('submit', finalizarCompra);
});

// Cargar carrito desde localStorage
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('MiwuffCarrito');

    if (!carritoGuardado || carritoGuardado === '[]') {
        alert('Tu carrito está vacío');
        window.location.href = 'index.html';
        return;
    }

    carritoCheckout = JSON.parse(carritoGuardado);
}

// Mostrar productos en el resumen
function mostrarProductos() {
    const lista = document.getElementById('productos-lista');

    if (carritoCheckout.length === 0) {
        lista.innerHTML = '<p>No hay productos</p>';
        return;
    }

    lista.innerHTML = '';

    carritoCheckout.forEach(function (item) {
        const div = document.createElement('div');
        div.className = 'producto-item';
        div.innerHTML = `
            <span>${item.nombre} x ${item.cantidad}</span>
            <span>€${(item.precio * item.cantidad).toFixed(2)}</span>
        `;
        lista.appendChild(div);
    });
}

// Calcular totales
function calcularTotales() {
    let subtotal = 0;

    carritoCheckout.forEach(function (item) {
        subtotal += item.precio * item.cantidad;
    });

    const envio = subtotal > 50 ? 0 : ENVIO;
    const total = subtotal + envio;

    document.getElementById('subtotal').textContent = '€' + subtotal.toFixed(2);
    document.getElementById('envio').textContent = envio === 0 ? 'GRATIS' : '€' + envio.toFixed(2);
    document.getElementById('total').textContent = '€' + total.toFixed(2);
}

// Finalizar compra
function finalizarCompra(e) {
    e.preventDefault();

    // Obtener datos del formulario
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const ciudad = document.getElementById('ciudad').value;
    const codigoPostal = document.getElementById('codigo-postal').value;
    const metodoPago = document.getElementById('metodo-pago').value;

    // Validar que todos los campos estén llenos
    if (!nombre || !email || !telefono || !direccion || !ciudad || !codigoPostal || !metodoPago) {
        alert('Por favor, completa todos los campos');
        return;
    }

    // Generar número de pedido
    const numeroPedido = 'MW' + Date.now();

    // Guardar pedido
    const pedido = {
        numero: numeroPedido,
        fecha: new Date().toISOString(),
        cliente: {
            nombre: nombre,
            email: email,
            telefono: telefono,
            direccion: direccion,
            ciudad: ciudad,
            codigoPostal: codigoPostal
        },
        productos: carritoCheckout,
        metodoPago: metodoPago,
        total: document.getElementById('total').textContent
    };

    // Guardar en localStorage
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));

    // Limpiar carrito
    localStorage.removeItem('MiwuffCarrito');

    // Mostrar modal de éxito
    document.getElementById('numero-pedido').textContent = numeroPedido;
    document.getElementById('modal-exito').style.display = 'flex';
}

// Volver al inicio
function volverInicio() {
    window.location.href = 'index.html';
}
