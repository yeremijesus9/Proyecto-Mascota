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