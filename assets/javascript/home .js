// página principal (home) - muestro productos destacados y manejo idiomas

// idiomas disponibles: español e inglés
const idiomasDisponibles = ['es', 'en'];
let langGuardado = localStorage.getItem('lang');
// si el idioma guardado es válido lo uso, si no uso español
window.idiomaActual = idiomasDisponibles.includes(langGuardado) ? langGuardado : 'es';
localStorage.setItem('lang', window.idiomaActual);

// funciones para obtener las rutas de los json según el idioma actual
function getMascotaJSON() {
    // añado un timestamp para evitar caché del navegador
    return `assets/JSON/${window.idiomaActual}_mascota.json?t=${Date.now()}`;
}

function getInterfaceJSON() {
    return `assets/JSON/${window.idiomaActual}_interface.json?t=${Date.now()}`;
}

// aquí guardo los textos de la interfaz (botones, labels, etc)
window.textosInterface = {};


// cargo las traducciones de botones y textos de la interfaz
async function cargarInterface() {
    try {
        const resp = await fetch(getInterfaceJSON(), { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const textos = await resp.json();
        window.textosInterface = textos;

        // cambio los textos en elementos que tengan data-key
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if (textos[key]) {
                // si es un input, cambio el placeholder, si no, el contenido
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

// creo las estrellas de puntuación según el número que me pase
function crearEstrellas(puntuacion) {
    // me aseguro que esté entre 0 y 5
    const p = Math.max(0, Math.min(5, Math.round(Number(puntuacion) || 0)));
    // devuelvo estrellas llenas (★) y vacías (☆)
    return `<span class="stars" aria-hidden="true">${'★'.repeat(p)}${'☆'.repeat(5 - p)}</span>`;
}

// renderizo una tarjeta de producto y la añado al contenedor
function renderProducto(producto, contenedor) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-producto';

    // creo el html de la tarjeta con toda la info del producto
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

    // guardo el objeto completo del producto en el botón para acceso directo
    const btn = tarjeta.querySelector('.btn-anadir-carrito');
    btn.productoData = producto;

    // guardo el id en el botón de detalle
    tarjeta.querySelector('.ver-detalle').productoId = producto.id;

    contenedor.appendChild(tarjeta);
}

// cargo y muestro los productos destacados en las dos secciones
async function cargarYMostrarDestacados() {
    const cont1 = document.getElementById('destacados-1');
    const cont2 = document.getElementById('destacados-2');
    if (!cont1 || !cont2) return;

    // muestro mensaje de carga mientras traigo los datos
    cont1.innerHTML = '<p class="loading">cargando...</p>';
    cont2.innerHTML = '';

    try {
        // cargo primero la interfaz y luego los productos
        await cargarInterface();
        const resp = await fetch(getMascotaJSON(), { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const productos = await resp.json();

        // divido los productos en dos bloques de 6
        const bloque1 = productos.slice(0, 6);
        const bloque2 = productos.slice(6, 12);

        // limpio los contenedores y añado los productos
        cont1.innerHTML = '';
        cont2.innerHTML = '';
        bloque1.forEach(p => renderProducto(p, cont1));
        bloque2.forEach(p => renderProducto(p, cont2));

    } catch (error) {
        cont1.innerHTML = `<p style="color:red;">error al cargar productos</p>`;
        console.error(error);
    }
}

// redirijo a la página de detalle del producto
function mostrarDetalle(id) {
    if (!id) return;
    window.location.href = `detalle_producto.html?id=${encodeURIComponent(id)}`;
}

// cambio el idioma y recargo todo el contenido
async function cambiarIdioma(nuevoIdioma) {
    // si es el mismo idioma no hago nada
    if (!nuevoIdioma || nuevoIdioma === window.idiomaActual) return;

    // guardo el nuevo idioma
    window.idiomaActual = nuevoIdioma;
    localStorage.setItem('lang', nuevoIdioma);

    // muestro loader mientras recargo
    const cont1 = document.getElementById('destacados-1');
    const cont2 = document.getElementById('destacados-2');
    if (cont1 && cont2) {
        cont1.innerHTML = '<p class="loading">cargando...</p>';
        cont2.innerHTML = '';
    }

    // recargo la interfaz y los productos con el nuevo idioma
    await cargarInterface();
    await cargarYMostrarDestacados();
}

// cuando carga la página ejecuto todo
document.addEventListener('DOMContentLoaded', () => {
    // cargo productos y textos del idioma guardado
    cargarYMostrarDestacados();
    cargarInterface();

    // configuro los botones de cambio de idioma
    document.querySelectorAll('#languageMenu a').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            cambiarIdioma(btn.getAttribute('lang'));
        });
    });
});
