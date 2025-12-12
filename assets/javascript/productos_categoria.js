window.idiomaActual = localStorage.getItem('idiomaSeleccionado') || 'es';

const categoriasMap = {
    es: { perro: "perro", gato: "gato", roedores: "roedores", pez: "pez", pajaro: "pajaro", otro: "otro" },
    en: { perro: "dog", gato: "cat", roedores: "rodents", pez: "fish", pajaro: "bird", otro: "other" }
};

//  Función para cambiar idioma
window.cambiarIdioma = async function(nuevoIdioma) {
    if (window.idiomaActual === nuevoIdioma) return;

    window.idiomaActual = nuevoIdioma;
    localStorage.setItem('idiomaSeleccionado', nuevoIdioma);
    await mostrarProductos(); // recarga productos con nuevo idioma
};


// 1. Obtener la categoría desde la URL y mapear según el idioma
function getCategoria() {
    const lang = window.idiomaActual || 'es'; 
    const categoriaUrl = new URLSearchParams(location.search).get('categoria')?.toLowerCase() || 'gato';
    return categoriasMap[lang][categoriaUrl] || categoriaUrl;
}

// 2. Cargar productos del JSON (soporta cambio de idioma)
async function cargarProductos() {
    const ruta = typeof window.rutaJson === 'function'
        ? window.rutaJson()
        : '/assets/JSON/es_mascota.json';

    const respuesta = await fetch(ruta);
    return respuesta.json();
}

// 3. Crear tarjeta de producto
function crearTarjeta(producto) {
    return `
        <div class="tarjeta-producto">
            <img src="${producto.imagen_principal}" alt="${producto.nombre_producto}" class="producto-imagen">
            <h3 class="producto-nombre">${producto.nombre_producto}</h3>
            <p class="producto-marca">Marca: <strong>${producto.marca}</strong></p>
            <div class="producto-detalle">
                <span class="precio">${producto.precio.toFixed(2)} €</span>
            </div>
            <button onclick="location.href='detalle_producto.html?id=${producto.id}'">Ver Detalles</button>
        </div>
    `;
}

// 4. Mostrar productos en pantalla
async function mostrarProductos() {
    const categoria = getCategoria();
    const contenedor = document.getElementById('productos-contenedor');
    const tituloCategoria = document.getElementById('nombre-categoria');

    // Actualizar título si existe
    if (tituloCategoria) {
        tituloCategoria.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
    }

    try {
        const productos = await cargarProductos();
        const filtrados = productos.filter(p => p.categoria?.toLowerCase() === categoria.toLowerCase());

        if (!filtrados.length) {
            contenedor.innerHTML = `<p style="text-align:center; color:#666;">
                No hay productos en esta categoría
            </p>`;
            return;
        }

        contenedor.innerHTML = filtrados.map(crearTarjeta).join('');

    } catch (error) {
        contenedor.innerHTML = '<p style="color:red;">Error al cargar productos</p>';
        console.error(error);
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', mostrarProductos);

// Exponer globalmente (necesario para cambio de idioma)
window.cargarYMostrarProductos = mostrarProductos;
window.getCategoria = getCategoria;