// aquí enseño los productos según la categoría que pinchen.

// En productos_categoria.js ya no inicializamos el idioma por nuestra cuenta.
// Confiamos en que idioma.js ya se ha ejecutado y ha configurado window.idiomaActual

// Aliamos la función para que idioma.js la pueda llamar
window.mostrarProductos = mostrarProductos;

function crearEstrellas(puntuacion) {
    const p = Math.max(0, Math.min(5, Math.round(Number(puntuacion) || 0)));
    return `<span class="stars" aria-hidden="true">${'★'.repeat(p)}${'☆'.repeat(5 - p)}</span>`;
}

// monto la tarjeta del producto y guardo los datos en el botón para que el carrito los lea.
function renderProducto(producto, contenedor) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-producto';

    // Si el nombre es un objeto sacamos el idioma, si no pues el texto
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

    const btn = tarjeta.querySelector('.btn-anadir-carrito');
    // Normalizamos para el carrito
    btn.productoData = {
        ...producto,
        nombre_producto: nombre,
        precio: precio
    };
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
    // Si la URL es category=dog, usamos 'dog'.
    // Pero si es category=perro, y estamos en EN, deberíamos buscar su equivalente EN?
    // O simplemente usar el valor que toca según el idioma actual para filtrar.
    
    // Lo más sencillo: obtener el valor de la URL
    const paramCategoria = new URLSearchParams(location.search).get('categoria')?.toLowerCase() || 'gato';
    
    // Si paramCategoria es 'perro' y estamos en 'en', necesitamos 'dog' para buscar en el JSON si el JSON tiene categorias en EN.
    // El JSON tiene:
    // "categoria": { "es": "gato", "en": "cat" }
    
    // Entonces para filtrar, comparamos con el valor del objeto categoria[idiomaActual].
    
    // PERO el titulo de la pagina debe mostrarse traducido.
    // Usamos el mapa para traducir el parametro de URL (que puede estar en ES o EN si el usuario navega) al idioma actual.
    
    // Intentamos encontrar la clave independientemente del idioma de entrada
    let key = null;
    for (const k in categoriasMap.es) {
        if (categoriasMap.es[k] === paramCategoria || categoriasMap.en[k] === paramCategoria) {
            key = k;
            break;
        }
    }
    
    if (key) {
        return categoriasMap[window.idiomaActual][key];
    }
    return paramCategoria;
}

async function cargarProductos() {
    // uso la ruta global de idioma.js
    const resp = await fetch(window.rutaJson(), { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const productosExistentes = Array.isArray(data) ? data : [];
    
    // También cargar productos nuevos desde el endpoint de nuevo_producto
    try {
        const respNuevos = await fetch(`${API_URL}/nuevo_producto`, { cache: 'no-cache' });
        if (respNuevos.ok) {
            const dataNuevos = await respNuevos.json();
            const productosNuevos = Array.isArray(dataNuevos) ? dataNuevos : [];
            return [...productosExistentes, ...productosNuevos];
        }
    } catch (error) {
        console.log('Info: No se pudieron cargar productos nuevos');
    }
    
    return productosExistentes;
}

// busco los productos, los filtro y cambio el título de la página.
async function mostrarProductos() {
    const contenedor = document.getElementById('productos-contenedor');
    const tituloCategoria = document.getElementById('nombre-categoria');
    
    // Obtenemos la categoría traducida al idioma actual
    const categoriaTarget = getCategoria(); 

    if (tituloCategoria) {
        tituloCategoria.textContent = categoriaTarget.charAt(0).toUpperCase() + categoriaTarget.slice(1);
    }

    try {
        const productos = await cargarProductos();
        const filtrados = productos.filter(p => {
            // Sacamos la categoría del producto en el idioma actual
            const catProd = typeof p.categoria === 'object' ? p.categoria[window.idiomaActual] : p.categoria;
            return catProd.toLowerCase() === categoriaTarget.toLowerCase();
        });

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

// Eliminamos el DOMContentLoaded listener porque nav_footer.js se encargará de llamar a mostrarProductos()
// una vez que se haya cargado el navbar y las traducciones.
// document.addEventListener('DOMContentLoaded', () => {
//     mostrarProductos();
// });
