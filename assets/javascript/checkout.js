// página de checkout 
let carritoCheckout = [];
const ENVIO = 4.99; 

// espero a que cargue la página y ejecuto todo
document.addEventListener('DOMContentLoaded', function () {
    cargarCarrito();
    mostrarProductos();
    calcularTotales();

    // cuando el usuario envía el formulario, proceso la compra
    document.getElementById('form-checkout').addEventListener('submit', finalizarCompra);
});

// cargo el carrito desde localstorage
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('MiwuffCarrito');

    // si no hay nada en el carrito, redirijo al inicio
    if (!carritoGuardado || carritoGuardado === '[]') {
        alert('tu carrito está vacío');
        window.location.href = 'index.html';
        return;
    }

    carritoCheckout = JSON.parse(carritoGuardado);
}

// muestro todos los productos en el resumen del pedido
function mostrarProductos() {
    const lista = document.getElementById('productos-lista');

    if (carritoCheckout.length === 0) {
        lista.innerHTML = '<p>no hay productos</p>';
        return;
    }

    lista.innerHTML = '';

    // recorro cada producto y lo muestro con su cantidad y precio
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

// calculo el subtotal, envío y total del pedido
function calcularTotales() {
    let subtotal = 0;

    // sumo el precio de todos los productos
    carritoCheckout.forEach(function (item) {
        subtotal += item.precio * item.cantidad;
    });

    // si el subtotal es mayor a 100€, el envío es gratis
    const envio = subtotal > 100 ? 0 : ENVIO;
    const total = subtotal + envio;

    // actualizo los valores en la página
    document.getElementById('subtotal').textContent = '€' + subtotal.toFixed(2);
    document.getElementById('envio').textContent = envio === 0 ? 'GRATIS' : '€' + envio.toFixed(2);
    document.getElementById('total').textContent = '€' + total.toFixed(2);
}

// proceso la compra cuando el usuario envía el formulario
function finalizarCompra(e) {
    e.preventDefault();

    // obtengo todos los datos del formulario
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const ciudad = document.getElementById('ciudad').value;
    const codigoPostal = document.getElementById('codigo-postal').value;
    const metodoPago = document.getElementById('metodo-pago').value;

    // valido que todos los campos estén llenos
    if (!nombre || !email || !telefono || !direccion || !ciudad || !codigoPostal || !metodoPago) {
        alert('por favor, completa todos los campos');
        return;
    }

    // genero un número de pedido único usando la fecha actual
    const numeroPedido = 'MW' + Date.now();

    // creo el objeto del pedido con todos los datos
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

    // guardo el pedido en localstorage para el historial
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));

    // limpio el carrito porque ya finalizó la compra
    localStorage.removeItem('MiwuffCarrito');

    // muestro el modal de éxito con el número de pedido
    document.getElementById('numero-pedido').textContent = numeroPedido;
    document.getElementById('modal-exito').style.display = 'flex';
}

// vuelvo al inicio cuando el usuario hace click en el botón del modal
function volverInicio() {
    window.location.href = 'index.html';
}
