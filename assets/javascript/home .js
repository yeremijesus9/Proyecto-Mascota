// -------------------------
// Inicialización de idioma
// -------------------------
const idiomasDisponibles = ['es', 'en'];
let langGuardado = localStorage.getItem('lang');
window.idiomaActual = idiomasDisponibles.includes(langGuardado) ? langGuardado : 'es';
localStorage.setItem('lang', window.idiomaActual);
// -------------------------
// Funciones para obtener JSON según idioma
// -------------------------
function getMascotaJSON() {
    return `assets/JSON/${window.idiomaActual}_mascota.json?t=${Date.now()}`;
}

function getInterfaceJSON() {
    return `assets/JSON/${window.idiomaActual}_interface.json?t=${Date.now()}`;
}

window.textosInterface = {};


// -------------------------
// Cargar traducciones de la interfaz
// -------------------------
async function cargarInterface() {
    try {
        const resp = await fetch(getInterfaceJSON(), { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const textos = await resp.json();
        window.textosInterface = textos;

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
// Crear representación de estrellas
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
        <button type="button" class="ver-detalle">${window.textosInterface?.ver_detalle || 'Ver Detalle'}</button>
        <button type="button" class="btn-anadir-carrito" 
            data-producto-id="${producto.id}"
        >${window.textosInterface?.detalle_agregar_carrito || 'Comprar'}</button>
    `;

    // Guardar OBJETO COMPLETO para referencia directa (Método preferido)
    const btn = tarjeta.querySelector('.btn-anadir-carrito');
    btn.productoData = producto;

    tarjeta.querySelector('.ver-detalle').productoId = producto.id;

    contenedor.appendChild(tarjeta);
}

// -------------------------
// Cargar productos destacados
// -------------------------
async function cargarYMostrarDestacados() {
    const cont1 = document.getElementById('destacados-1');
    const cont2 = document.getElementById('destacados-2');
    if (!cont1 || !cont2) return;

    // Mostrar loader
    cont1.innerHTML = '<p class="loading">Cargando...</p>';
    cont2.innerHTML = '';

    try {
        await cargarInterface();
        const resp = await fetch(getMascotaJSON(), { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const productos = await resp.json();

        const bloque1 = productos.slice(0, 6);
        const bloque2 = productos.slice(6, 12);

        cont1.innerHTML = '';
        cont2.innerHTML = '';
        bloque1.forEach(p => renderProducto(p, cont1));
        bloque2.forEach(p => renderProducto(p, cont2));

    } catch (error) {
        cont1.innerHTML = `<p style="color:red;">Error al cargar productos</p>`;
        console.error(error);
    }
}

// -------------------------
// Mostrar detalle del producto
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
    localStorage.setItem('lang', nuevoIdioma);

    // Mostrar loader mientras se recargan
    const cont1 = document.getElementById('destacados-1');
    const cont2 = document.getElementById('destacados-2');
    if (cont1 && cont2) {
        cont1.innerHTML = '<p class="loading">Cargando...</p>';
        cont2.innerHTML = '';
    }

    // Recargar productos y textos de interfaz simultáneamente
    await cargarInterface();
    await cargarYMostrarDestacados();
}
// -------------------------
// Inicialización al cargar página
// -------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Cargar productos y textos del idioma guardado o por defecto
    cargarYMostrarDestacados();
    cargarInterface();

    // Manejar botones de cambio de idioma
    document.querySelectorAll('#languageMenu a').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            cambiarIdioma(btn.getAttribute('lang'));
        });
    });
});
