// pantalla final: resumen de compra y envio
let carritoCheckout = [];
const ENVIO = 4.99;

const API_URL = 'http://localhost:3000/carrito';
let datos_envio = [];

document.addEventListener('DOMContentLoaded', async function () {
    await cargarCarrito();
    // el formulario activa la funcion de finalizar
    document.getElementById('form-checkout').addEventListener('submit', finalizarCompra);
});

// cargamos los datos del carrito desde el servidor
async function cargarCarrito() {
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error("error al cargar");

        carritoCheckout = await respuesta.json();

        if (carritoCheckout.length === 0) {
            alert('tu carrito esta vacio');
            window.location.href = 'index.html';
            return;
        }

        mostrarProductos();
        calcularTotales();

    } catch (error) {
        console.error(error);
        alert('error cargando los datos de compra');
    }
}

// lista de productos a la derecha
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
            <span>eur ${(item.precio * item.cantidad).toFixed(2)}</span>
        `;
        lista.appendChild(div);
    });
}

// suma total y envio gratis si pasa de 100
function calcularTotales() {
    let subtotal = 0;
    carritoCheckout.forEach(function (item) {
        subtotal += item.precio * item.cantidad;
    });

    const envio = subtotal > 100 ? 0 : ENVIO;
    const total = subtotal + envio;

    document.getElementById('subtotal').textContent = 'eur ' + subtotal.toFixed(2);
    document.getElementById('envio').textContent = envio === 0 ? 'gratis' : 'eur ' + envio.toFixed(2);
    document.getElementById('total').textContent = 'eur ' + total.toFixed(2);
}

// guarda el pedido y vacia el carrito
async function finalizarCompra(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const ciudad = document.getElementById('ciudad').value;
    const codigoPostal = document.getElementById('codigo-postal').value;
    const metodoPago = document.getElementById('metodo-pago').value;

    if (!nombre || !email || !telefono || !direccion || !ciudad || !codigoPostal || !metodoPago) {
        alert('rellena todos los campos por favor');
        return;
    }

    // numero de pedido con la fecha
    const numeroPedido = 'MW' + Date.now();

    // preparamos los datos para el servidor
    const envioData = {
        nombre: nombre,
        email: email,
        telefono: telefono,
        direccion: direccion,
        ciudad: ciudad,
        codigo_postal: codigoPostal,
        metodo_pago: metodoPago,
        productos: carritoCheckout,
        precio_total: document.getElementById('total').textContent,
        numero_pedido: numeroPedido,
        fecha: new Date().toISOString()
    };

    // guardar pedido en db.json
    try {
        const respuestaPedido = await fetch('http://localhost:3000/datos_envio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(envioData)
        });

        if (!respuestaPedido.ok) throw new Error("error guardando");

    } catch (error) {
        console.error("error servidor:", error);
        alert("problema al procesar el pedido");
        return;
    }

    // vaciamos el carrito borrando uno por uno
    try {
        for (const item of carritoCheckout) {
            await fetch(`${API_URL}/${item.id}`, { method: 'DELETE' });
        }
    } catch (error) {
        console.error("error vaciando", error);
    }

    // mostramos el mensaje de exito
    document.getElementById('numero-pedido').textContent = numeroPedido;
    document.getElementById('modal-exito').style.display = 'flex';
}

function volverInicio() {
    window.location.href = 'index.html';
}
