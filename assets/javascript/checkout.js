// pantalla final: monto el resumen de lo que vas a comprar y el envío.
let carritoCheckout = [];
const ENVIO = 4.99;

document.addEventListener('DOMContentLoaded', function () {
    cargarCarrito();
    mostrarProductos();
    calcularTotales();

    // mando el pedido cuando le dan a finalizar.
    document.getElementById('form-checkout').addEventListener('submit', finalizarCompra);
});

// saco los datos del carrito. si no hay nada, te mando de vuelta a la tienda.
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('MiwuffCarrito');
    if (!carritoGuardado || carritoGuardado === '[]') {
        alert('tu carrito está vacío');
        window.location.href = 'index.html';
        return;
    }
    carritoCheckout = JSON.parse(carritoGuardado);
}

// pongo la lista de productos que vas a pagar a la derecha.
function mostrarProductos() {
    const lista = document.getElementById('productos-lista');
    if (carritoCheckout.length === 0) {
        lista.innerHTML = '<p>no hay productos</p>';
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

// sumo todo. si el total pasa de 100€, el envío me sale gratis.
function calcularTotales() {
    let subtotal = 0;
    carritoCheckout.forEach(function (item) {
        subtotal += item.precio * item.cantidad;
    });

    const envio = subtotal > 100 ? 0 : ENVIO;
    const total = subtotal + envio;

    document.getElementById('subtotal').textContent = '€' + subtotal.toFixed(2);
    document.getElementById('envio').textContent = envio === 0 ? 'GRATIS' : '€' + envio.toFixed(2);
    document.getElementById('total').textContent = '€' + total.toFixed(2);
}

// guardo el pedido en localstorage para simular que se ha hecho la compra.
function finalizarCompra(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const ciudad = document.getElementById('ciudad').value;
    const codigoPostal = document.getElementById('codigo-postal').value;
    const metodoPago = document.getElementById('metodo-pago').value;

    if (!nombre || !email || !telefono || !direccion || !ciudad || !codigoPostal || !metodoPago) {
        alert('por favor, completa todos los campos');
        return;
    }

    // me invento un número de pedido con la fecha actual.
    const numeroPedido = 'MW' + Date.now();

    const pedido = {
        numero: numeroPedido,
        fecha: new Date().toISOString(),
        cliente: { nombre, email, telefono, direccion, ciudad, codigoPostal },
        productos: carritoCheckout,
        metodoPago: metodoPago,
        total: document.getElementById('total').textContent
    };

    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));

    // limpio el carrito para que no se quede ahí después de comprar.
    localStorage.removeItem('MiwuffCarrito');

    // enseño el cartel de que todo ha ido bien.
    document.getElementById('numero-pedido').textContent = numeroPedido;
    document.getElementById('modal-exito').style.display = 'flex';
}

function volverInicio() {
    window.location.href = 'index.html';
}
