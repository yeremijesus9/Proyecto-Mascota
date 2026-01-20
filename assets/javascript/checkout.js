// pantalla final: monto el resumen de lo que vas a comprar y el envío.
let carritoCheckout = [];
const ENVIO = 4.99;

const API_URL = 'http://localhost:3000/carrito';

document.addEventListener('DOMContentLoaded', async function () {
    await cargarCarrito();
    // mostrarProductos y calcularTotales se llaman dentro de cargarCarrito si todo va bien
    document.getElementById('form-checkout').addEventListener('submit', finalizarCompra);
});

// saco los datos del carrito DESDE EL SERVIDOR
async function cargarCarrito() {
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error("Error al cargar carrito");

        carritoCheckout = await respuesta.json();

        if (carritoCheckout.length === 0) {
            alert('tu carrito está vacío');
            window.location.href = 'index.html';
            return;
        }

        mostrarProductos();
        calcularTotales();

    } catch (error) {
        console.error(error);
        alert('Hubo un error cargando tu compra');
    }
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

    // PREPARAR DATOS PARA DB.JSON (datos_envio)
    // Usamos una estructura plana como sugieren los campos en db.json
    const envioData = {
        nombre: nombre,
        email: email,
        telefono: telefono,
        direccion: direccion,
        ciudad: ciudad,
        codigo_postal: codigoPostal,
        metodo_pago: metodoPago,
        producto: carritoCheckout, // Array con los productos comprados
        precio_total: document.getElementById('total').textContent,
        numero_pedido: numeroPedido,
        fecha: new Date().toISOString()
    };

    // GUARDAR EN SERVIDOR (db.json/datos_envio)
    try {
        const respuestaPedido = await fetch('http://localhost:3000/datos_envio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(envioData)
        });

        if (!respuestaPedido.ok) throw new Error("Error guardando pedido");

    } catch (error) {
        console.error("Error al guardar pedido en servidor:", error);
        alert("Hubo un problema procesando el pedido. Inténtalo de nuevo.");
        return;
    }

    // vacio el carrito DEL SERVIDOR
    try {
        for (const item of carritoCheckout) {
            await fetch(`${API_URL}/${item.id}`, { method: 'DELETE' });
        }
    } catch (error) {
        console.error("Error vaciando el carrito", error);
    }

    // enseño el cartel de que todo ha ido bien.
    document.getElementById('numero-pedido').textContent = numeroPedido;
    document.getElementById('modal-exito').style.display = 'flex';
}

function volverInicio() {
    window.location.href = 'index.html';
}
