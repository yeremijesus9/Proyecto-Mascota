// página de productos por categoría - muestro solo los de la categoría seleccionada

// idiomas que soporto
const idiomasDisponibles = ['es', 'en'];
let idiomaSeleccionado = localStorage.getItem('idiomaSeleccionado');
// si el idioma guardado es válido lo uso, si no español
window.idiomaActual = idiomasDisponibles.includes(idiomaSeleccionado) ? idiomaSeleccionado : 'es';
localStorage.setItem('idiomaSeleccionado', window.idiomaActual);

// funciones para obtener las rutas de los json según idioma
function getMascotaJSON() {
    // timestamp para evitar caché
    return `assets/JSON/${window.idiomaActual}_mascota.json?t=${Date.now()}`;
}

function getInterfaceJSON() {
    return `assets/JSON/${window.idiomaActual}_interface.json?t=${Date.now()}`;
}

// cargo las traducciones de botones y textos
async function cargarInterface() {
    try {
        const resp = await fetch(getInterfaceJSON(), { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const textos = await resp.json();
        window.textosInterface = textos;

        // actualizo los textos de elementos con data-key
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if (textos[key]) {
                // si es input cambio placeholder, si no el contenido
                if ('placeholder' in el) el.placeholder = textos[key];
                else el.innerHTML = textos[key];
            }
        });
        
        // actualizo también los botones de las tarjetas ya renderizadas
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

// creo las estrellitas de puntuación
function crearEstrellas(puntuacion) {
    // me aseguro que esté entre 0 y 5
    const p = Math.max(0, Math.min(5, Math.round(Number(puntuacion) || 0)));
    return `<span class="stars" aria-hidden="true">${'★'.repeat(p)}${'☆'.repeat(5 - p)}</span>`;
}

// renderizo una tarjeta de producto
function renderProducto(producto, contenedor) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-producto';

    // creo el html de la tarjeta
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

    // guardo el objeto completo en el botón para acceso rápido
    const btn = tarjeta.querySelector('.btn-anadir-carrito');
    btn.productoData = producto;

    // guardo el id en el botón de ver detalle
    tarjeta.querySelector('.ver-detalle').productoId = producto.id;

    contenedor.appendChild(tarjeta);
}

// mapa de categorías en cada idioma
const categoriasMap = {
    es: { perro: "perro", gato: "gato", roedores: "roedores", pez: "pez", pajaro: "pajaro", otro: "otro" },
    en: { perro: "dog", gato: "cat", roedores: "rodents", pez: "fish", pajaro: "bird", otro: "other" }
};

// obtengo la categoría de la url
function getCategoria() {
    const categoriaUrl = new URLSearchParams(location.search).get('categoria')?.toLowerCase() || 'gato';
    // devuelvo la categoría traducida según el idioma actual
    return categoriasMap[window.idiomaActual][categoriaUrl] || categoriaUrl;
}

// cargo todos los productos del json
async function cargarProductos() {
    const ruta = getMascotaJSON();
    const resp = await fetch(ruta, { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const productos = await resp.json();
    return Array.isArray(productos) ? productos : [];
}

// muestro solo los productos de la categoría seleccionada
async function mostrarProductos() {
    const contenedor = document.getElementById('productos-contenedor');
    const tituloCategoria = document.getElementById('nombre-categoria');
    const categoria = getCategoria();

    // actualizo el título con la categoría
    if (tituloCategoria) {
        tituloCategoria.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
    }

    try {
        const productos = await cargarProductos();
        // filtro solo los productos de esta categoría
        const filtrados = productos.filter(p => p.categoria?.toLowerCase() === categoria.toLowerCase());

        // si no hay productos, muestro mensaje
        contenedor.innerHTML = filtrados.length
            ? ''
            : `<p style="text-align:center; color:#666;">no hay productos en esta categoría</p>`;

        // renderizo cada producto filtrado
        filtrados.forEach(p => renderProducto(p, contenedor));
    } catch (error) {
        contenedor.innerHTML = '<p style="color:red;">error al cargar productos</p>';
        console.error(error);
    }
}

// redirijo a la página de detalle
function mostrarDetalle(id) {
    if (!id) return;
    window.location.href = `detalle_producto.html?id=${encodeURIComponent(id)}`;
}

// cambio de idioma y recargo todo
async function cambiarIdioma(nuevoIdioma) {
    // si es el mismo no hago nada
    if (!nuevoIdioma || nuevoIdioma === window.idiomaActual) return;

    // guardo el nuevo idioma
    window.idiomaActual = nuevoIdioma;
    localStorage.setItem('idiomaSeleccionado', nuevoIdioma);

    // recargo interfaz y productos a la vez
    await Promise.all([cargarInterface(), mostrarProductos()]);
}

// expongo la función globalmente para que la use nav_footer
window.cambiarIdioma = cambiarIdioma;

// cuando carga la página inicio todo
document.addEventListener('DOMContentLoaded', () => {
    cargarInterface();
    mostrarProductos();

    // configuro los botones de idioma
    document.querySelectorAll('#languageMenu a').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            cambiarIdioma(btn.getAttribute('lang'));
        });
    });
});
