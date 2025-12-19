// aquí controlo la home: productos destacados y el cambio de idioma.
const idiomasDisponibles = ['es', 'en'];
let langGuardado = localStorage.getItem('lang');
window.idiomaActual = idiomasDisponibles.includes(langGuardado) ? langGuardado : 'es';
localStorage.setItem('lang', window.idiomaActual);

window.textosInterface = {};

// busco los elementos con data-key y les enchufo el texto traducido.
async function cargarInterface() {
    try {
        // uso la ruta global de idioma.js
        const resp = await fetch(window.rutaInterfaceJson(), { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const textos = await resp.json();
        window.textosInterface = textos;

        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if (textos[key]) {
                if ('placeholder' in el) {
                    el.placeholder = textos[key];
                } else {
                    el.innerHTML = textos[key];
                }
            }
        });
    } catch (error) {
        console.error('error al cargar interfaz:', error);
    }
}

// dibujo las estrellas de la puntuación (máximo 5).
function crearEstrellas(puntuacion) {
    const p = Math.max(0, Math.min(5, Math.round(Number(puntuacion) || 0)));
    return `<span class="stars" aria-hidden="true">${'★'.repeat(p)}${'☆'.repeat(5 - p)}</span>`;
}

// creo el html de cada tarjeta de producto y le paso los datos al botón de compra.
function renderProducto(producto, contenedor) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-producto';

    tarjeta.innerHTML = `
        <img class="producto-imagen" src="${producto.imagen_principal}" alt="imagen de ${producto.nombre_producto}" loading="lazy" decoding="async">
        <h3 class="producto-nombre">${producto.nombre_producto}</h3>
        <p class="producto-marca">marca: <strong>${producto.marca}</strong></p>
        <div class="producto-detalle">
            <div class="puntuacion">${crearEstrellas(producto.puntuacion)}<span class="opiniones"> (${producto.opiniones || 0})</span></div>
            <span class="precio">${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(producto.precio || 0))}</span>
        </div>
        <button type="button" class="ver-detalle">${window.textosInterface?.ver_detalle || 'ver detalle'}</button>
        <button type="button" class="btn-anadir-carrito" 
            data-producto-id="${producto.id}"
        >${window.textosInterface?.detalle_agregar_carrito || 'comprar'}</button>
    `;

    // meto el objeto entero en el botón para que el carrito lo pille fácil.
    const btn = tarjeta.querySelector('.btn-anadir-carrito');
    btn.productoData = producto;
    tarjeta.querySelector('.ver-detalle').productoId = producto.id;

    contenedor.appendChild(tarjeta);
}

// traigo los productos del json y los divido en los dos bloques de la portada.
async function cargarYMostrarDestacados() {
    const cont1 = document.getElementById('destacados-1');
    const cont2 = document.getElementById('destacados-2');
    if (!cont1 || !cont2) return;

    try {
        await cargarInterface();
        // uso la ruta global de idioma.js
        const resp = await fetch(window.rutaJson(), { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const productos = await resp.json();

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

// recargo todo si el usuario cambia el idioma en el selector.
async function cambiarIdioma(nuevoIdioma) {
    if (!nuevoIdioma || nuevoIdioma === window.idiomaActual) return;

    window.idiomaActual = nuevoIdioma;
    localStorage.setItem('lang', nuevoIdioma);

    const cont1 = document.getElementById('destacados-1');
    const cont2 = document.getElementById('destacados-2');
    if (cont1 && cont2) {
        cont1.innerHTML = '<p class="loading">cargando...</p>';
        cont2.innerHTML = '';
    }

    await cargarInterface();
    await cargarYMostrarDestacados();
}

document.addEventListener('DOMContentLoaded', () => {
    cargarYMostrarDestacados();
    cargarInterface();

    document.querySelectorAll('#languageMenu a').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            cambiarIdioma(btn.getAttribute('lang'));
        });
    });
});
