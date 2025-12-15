// -------------------------
// Idioma actual
// -------------------------
const idiomasDisponibles = ['es', 'en'];
let idiomaSeleccionado = localStorage.getItem('idiomaSeleccionado');
window.idiomaActual = idiomasDisponibles.includes(idiomaSeleccionado) ? idiomaSeleccionado : 'es';
localStorage.setItem('idiomaSeleccionado', window.idiomaActual);

// -------------------------
// Funciones para obtener JSON según idioma
// -------------------------
function getMascotaJSON() {
    return `/assets/JSON/${window.idiomaActual}_mascota.json?t=${Date.now()}`;
}

function getInterfaceJSON() {
    return `/assets/JSON/${window.idiomaActual}_interface.json?t=${Date.now()}`;
}

// -------------------------
// Cargar traducciones de la interfaz
// -------------------------
async function cargarInterface() {
    try {
        const resp = await fetch(getInterfaceJSON(), { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const textos = await resp.json();

        // Cambiar los textos en elementos con data-key
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if (textos[key]) {
                if ('placeholder' in el) {
                    el.placeholder = textos[key];
                } else {
                    el.innerHTML = textos[key]; // Mantener HTML dentro del elemento
                }
            }
        });
    } catch (error) {
        console.error('Error al cargar interfaz:', error);
    }
}

// -------------------------
// Representación de estrellas
// -------------------------
function crearEstrellas(puntuacion) {
    const p = Math.max(0, Math.min(5, Math.round(Number(puntuacion) || 0)));
    return `<span class="stars" aria-hidden="true">${'★'.repeat(p)}${'☆'.repeat(5 - p)}</span>`;
}

// -------------------------
// Renderizar producto
// -------------------------
function renderProducto(producto, contenedor) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-producto';

    tarjeta.innerHTML = `
        <img class="producto-imagen" src="${producto.imagen_principal}" alt="Imagen de ${producto.nombre_producto}" loading="lazy" decoding="async">
        <h3 class="producto-nombre">${producto.nombre_producto}</h3>
        <p class="producto-marca">Marca: <strong>${producto.marca}</strong></p>
        <div class="producto-detalle">
            <div class="puntuacion">${crearEstrellas(producto.puntuacion)}<span class="opiniones"> (${producto.opiniones || 0})</span></div>
            <span class="precio">${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(producto.precio || 0))}</span>
        </div>
        <button type="button" class="ver-detalle">Ver Detalles</button>
    `;
    tarjeta.querySelector('button').addEventListener('click', () => mostrarDetalle(producto.id));
    contenedor.appendChild(tarjeta);
}

// -------------------------
// Categorías multilingüe
// -------------------------
const categoriasMap = {
    es: { perro: "perro", gato: "gato", roedores: "roedores", pez: "pez", pajaro: "pajaro", otro: "otro" },
    en: { perro: "dog", gato: "cat", roedores: "rodents", pez: "fish", pajaro: "bird", otro: "other" }
};

function getCategoria() {
    const categoriaUrl = new URLSearchParams(location.search).get('categoria')?.toLowerCase() || 'gato';
    return categoriasMap[window.idiomaActual][categoriaUrl] || categoriaUrl;
}

// -------------------------
// Cargar productos
// -------------------------
async function cargarProductos() {
    const ruta = getMascotaJSON();
    const resp = await fetch(ruta, { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const productos = await resp.json();
    return Array.isArray(productos) ? productos : [];
}

// -------------------------
// Mostrar productos
// -------------------------
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
            : `<p style="text-align:center; color:#666;">No hay productos en esta categoría</p>`;

        filtrados.forEach(p => renderProducto(p, contenedor));
    } catch (error) {
        contenedor.innerHTML = '<p style="color:red;">Error al cargar productos</p>';
        console.error(error);
    }
}

// -------------------------
// Mostrar detalle de producto
// -------------------------
function mostrarDetalle(id) {
    if (!id) return;
    window.location.href = `detalle_producto.html?id=${encodeURIComponent(id)}`;
}

// -------------------------
// Cambiar idioma
// -------------------------
async function cambiarIdioma(nuevoIdioma) {
    if (!nuevoIdioma || nuevoIdioma === window.idiomaActual) return;

    window.idiomaActual = nuevoIdioma;
    localStorage.setItem('idiomaSeleccionado', nuevoIdioma);

    // Recargar interfaz y productos
    await Promise.all([cargarInterface(), mostrarProductos()]);
}

window.cambiarIdioma = cambiarIdioma; // Exponer globalmente

// -------------------------
// Inicialización al cargar página
// -------------------------
document.addEventListener('DOMContentLoaded', () => {
    cargarInterface();
    mostrarProductos();

    // Botones de idioma
    document.querySelectorAll('#languageMenu a').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            cambiarIdioma(btn.getAttribute('lang'));
        });
    });
});
