// aquí controlo la home: productos destacados.

// En home.js ya no inicializamos el idioma por nuestra cuenta.
// Confiamos en que idioma.js ya se ha ejecutado y ha configurado window.idiomaActual

// Aliamos la función para que nav_footer.js la pueda llamar al terminar de cargar el nav
window.cargarYMostrarProductos = cargarYMostrarDestacados;

// dibujo las estrellas de la puntuación (máximo 5).
function crearEstrellas(puntuacion) {
    const p = Math.max(0, Math.min(5, Math.round(Number(puntuacion) || 0)));
    return `<span class="stars" aria-hidden="true">${'★'.repeat(p)}${'☆'.repeat(5 - p)}</span>`;
}

// creo el html de cada tarjeta de producto y le paso los datos al botón de compra.
function renderProducto(producto, contenedor) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-producto';

    // Forma simple de elegir el idioma: si es un objeto, sacamos el idioma actual, si no, el texto tal cual
    const nombre = typeof producto.nombre_producto === 'object' ? producto.nombre_producto[window.idiomaActual] : producto.nombre_producto;
    const precio = Number(producto.precio || 0);
    
    // Obtenemos textos de la interfaz global
    const txtVerDetalle = window.textosInterface && window.textosInterface.ver_detalle ? window.textosInterface.ver_detalle : 'ver detalle';
    const txtComprar = window.textosInterface && window.textosInterface.detalle_agregar_carrito ? window.textosInterface.detalle_agregar_carrito : 'comprar';

    tarjeta.innerHTML = `
        <img class="producto-imagen" src="${producto.imagen_principal}" alt="imagen de ${nombre}" loading="lazy" decoding="async">
        <h3 class="producto-nombre">${nombre}</h3>
        <p class="producto-marca">marca: <strong>${producto.marca}</strong></p>
        <div class="producto-detalle">
            <div class="puntuacion">${crearEstrellas(producto.puntuacion)}<span class="opiniones"> (${producto.opiniones || 0})</span></div>
            <span class="precio">${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(precio)}</span>
        </div>
        <button type="button" class="ver-detalle">${txtVerDetalle}</button>
        <button type="button" class="btn-anadir-carrito" 
            data-producto-id="${producto.id}"
        >${txtComprar}</button>
    `;

    // meto el objeto entero en el botón para que el carrito lo pille fácil.
    const btn = tarjeta.querySelector('.btn-anadir-carrito');
    btn.productoData = {
        ...producto,
        nombre_producto: nombre, // pasamos ya el nombre traducido
        precio: precio
    };
    tarjeta.querySelector('.ver-detalle').productoId = producto.id;

    contenedor.appendChild(tarjeta);
}

// traigo los productos del json y los divido en los dos bloques de la portada.
async function cargarYMostrarDestacados() {
    const cont1 = document.getElementById('destacados-1');
    const cont2 = document.getElementById('destacados-2');
    if (!cont1 || !cont2) return;

    try {
        // Obtenemos la URL del json de productos desde idioma.js
        const urlProductos = window.rutaJson ? window.rutaJson() : 'http://localhost:3000/products';
        const resp = await fetch(urlProductos, { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const productos = Array.isArray(data) ? data : [];

        const bloque1 = productos.slice(0, 6);
        const bloque2 = productos.slice(6, 12);

        cont1.innerHTML = '';
        cont2.innerHTML = '';
        bloque1.forEach(p => renderProducto(p, cont1));
        bloque2.forEach(p => renderProducto(p, cont2));

    } catch (error) {
        if (cont1) cont1.innerHTML = `<p style="color:red;">error al cargar productos</p>`;
        console.error(error);
    }
}

function mostrarDetalle(id) {
    if (!id) return;
    window.location.href = `detalle_producto.html?id=${encodeURIComponent(id)}`;
}

// Exponemos la función globalmente para que idioma.js pueda llamarla
window.cargarYMostrarDestacados = cargarYMostrarDestacados;

// Ya no añadimos listeners duplicados ni logica de idiomaLocal aquí.
// nav_footer.js se encarga de llamar a window.cargarYMostrarProductos() cuando todo esté listo.
