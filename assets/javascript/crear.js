const idiomasDisponibles = ['es', 'en'];
let idiomaSeleccionado = localStorage.getItem('idiomaSeleccionado');
window.idiomaActual = idiomasDisponibles.includes(idiomaSeleccionado) ? idiomaSeleccionado : 'es';
localStorage.setItem('idiomaSeleccionado', window.idiomaActual);

// pongo los textos de la web y los botones de las tarjetas en el idioma que toque.
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
                if ('placeholder' in el) el.placeholder = textos[key];
                else el.innerHTML = textos[key];
            }
        });
        
        document.querySelectorAll('.tarjeta-producto').forEach(tarjeta => {
            const btnDetalle = tarjeta.querySelector('.ver-detalle');
            const btnCarrito = tarjeta.querySelector('.btn-anadir-carrito');
            if (btnDetalle) btnDetalle.innerHTML = textos.ver_detalle || 'ver detalle';
            if (btnCarrito) btnCarrito.innerHTML = textos.detalle_agregar_carrito || 'comprar';
        });

    } catch (error) {
        console.error('error al cargar interfaz:', error);
    }
}

function crearEstrellas(puntuacion) {
    const p = Math.max(0, Math.min(5, Math.round(Number(puntuacion) || 0)));
    return `<span class="stars" aria-hidden="true">${'★'.repeat(p)}${'☆'.repeat(5 - p)}</span>`;
}

// monto la tarjeta del producto y guardo los datos en el botón para que el carrito los lea.
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

    const btn = tarjeta.querySelector('.btn-anadir-carrito');
    btn.productoData = producto;
    tarjeta.querySelector('.ver-detalle').productoId = producto.id;

    contenedor.appendChild(tarjeta);
}

// traduzco el nombre de la categoría para que coincida con el json.
const categoriasMap = {
    es: { perro: "perro", gato: "gato", roedores: "roedores", pez: "pez", pajaro: "pajaro", otro: "otro" },
    en: { perro: "dog", gato: "cat", roedores: "rodents", pez: "fish", pajaro: "bird", otro: "other" }
};

// saco la categoría de la barra de direcciones del navegador.
function getCategoria() {
    const categoriaUrl = new URLSearchParams(location.search).get('categoria')?.toLowerCase() || 'gato';
    return categoriasMap[window.idiomaActual][categoriaUrl] || categoriaUrl;
}

async function cargarProductos() {
    // uso la ruta global de idioma.js
    const resp = await fetch(window.rutaJson(), { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const productos = await resp.json();
    return Array.isArray(productos) ? productos : [];
}

// busco los productos, los filtro y cambio el título de la página.
async function mostrarProductos() {
    const contenedor = document.getElementById('productos-contenedor');
    const tituloCategoria = document.getElementById('nombre-categoria');
    const categoria = getCategoria();

    if (tituloCategoria) {
        tituloCategoria.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
    }

    try {
        const productos = await cargarProductos();
        const filtrados = productos.filter(p => p.categoria?.toLowerCase() === categoria.toLowerCase());

        contenedor.innerHTML = filtrados.length
            ? ''
            : `<p style="text-align:center; color:#666;">no hay productos en esta categoría</p>`;

        filtrados.forEach(p => renderProducto(p, contenedor));
    } catch (error) {
        contenedor.innerHTML = '<p style="color:red;">error al cargar productos</p>';
        console.error(error);
    }
}

function mostrarDetalle(id) {
    if (!id) return;
    window.location.href = `detalle_producto.html?id=${encodeURIComponent(id)}`;
}

async function cambiarIdioma(nuevoIdioma) {
    if (!nuevoIdioma || nuevoIdioma === window.idiomaActual) return;

    window.idiomaActual = nuevoIdioma;
    localStorage.setItem('idiomaSeleccionado', nuevoIdioma);

    await Promise.all([cargarInterface(), mostrarProductos()]);
}

window.cambiarIdioma = cambiarIdioma;

document.addEventListener('DOMContentLoaded', () => {
    cargarInterface();
    mostrarProductos();

    document.querySelectorAll('#languageMenu a').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            cambiarIdioma(btn.getAttribute('lang'));
        });
    });
});

