// ====================================================================
// PRODUCTOS POR CATEGORÍA - Sistema de filtrado
// ====================================================================

const CATEGORIAS = {
    'gato': { nombre: 'Gatos', icon: 'mdi:cat' },
    'perro': { nombre: 'Perros', icon: 'mdi:dog' },
    'pez': { nombre: 'Peces', icon: 'mdi:fish' },
    'roedor': { nombre: 'Roedores', icon: 'mdi:rodent' },
    'pajaro': { nombre: 'Pájaros', icon: 'mdi:bird' },
    'otro': { nombre: 'Otros', icon: 'mdi:paw' }
};

// ====================================================================
// FUNCIÓN AUXILIAR PARA CREAR ESTRELLAS
// ====================================================================
function crearEstrellas(puntuacion) {
    const p = Number(puntuacion) || 0;
    let s = '';
    for (let i = 1; i <= 5; i++) {
        s += i <= p ? '★' : '☆';
    }
    return `<span class="stars">${s}</span>`;
}

// ====================================================================
// OBTENER CATEGORÍA DE LA URL
// ====================================================================
function obtenerCategoriaDeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('categoria') || 'gato'; // Por defecto gato
}

// ====================================================================
// ACTUALIZAR TÍTULO DE LA PÁGINA
// ====================================================================
function actualizarTitulo(categoria) {
    const tituloElement = document.getElementById('titulo-categoria');
    const categoriaInfo = CATEGORIAS[categoria];

    if (categoriaInfo && tituloElement) {
        tituloElement.innerHTML = `
            <span class="iconify" data-icon="${categoriaInfo.icon}" style="vertical-align: middle;"></span>
            Productos para ${categoriaInfo.nombre}
        `;

        // Actualizar título del documento
        document.title = `${categoriaInfo.nombre} - Miwuff`;
    }
}

// ====================================================================
// CARGAR Y FILTRAR PRODUCTOS POR CATEGORÍA
// ====================================================================
async function cargarProductosPorCategoria() {
    const contenedor = document.getElementById('productos-contenedor');
    const categoria = obtenerCategoriaDeURL();

    if (!contenedor) {
        console.warn("Contenedor 'productos-contenedor' no encontrado.");
        return;
    }

    // Actualizar título
    actualizarTitulo(categoria);

    try {
        // Cargar el JSON de productos en español
        const respuesta = await fetch('/assets/JSON/es_mascota.json');

        if (!respuesta.ok) {
            contenedor.innerHTML = '<p style="color: red;">¡Error! No se pudieron cargar los productos.</p>';
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const todosLosProductos = await respuesta.json();

        // Filtrar productos por categoría
        const productosFiltrados = todosLosProductos.filter(producto => {
            return producto.categoria && producto.categoria.toLowerCase() === categoria.toLowerCase();
        });

        contenedor.innerHTML = '';

        // Verificar si hay productos en esta categoría
        if (productosFiltrados.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 50px; grid-column: 1/-1;">
                    <p style="font-size: 1.5em; color: #666;">
                        No hay productos disponibles en esta categoría todavía.
                    </p>
                    <a href="index.html" style="color: #D37C39; text-decoration: underline;">
                        Volver al inicio
                    </a>
                </div>
            `;
            return;
        }

        // Generar tarjetas de productos filtrados
        productosFiltrados.forEach(producto => {
            const {
                id,
                nombre_producto,
                marca,
                precio,
                puntuacion,
                opiniones,
                imagen_principal
            } = producto;

            const tarjetaProducto = document.createElement('div');
            tarjetaProducto.className = 'tarjeta-producto';

            tarjetaProducto.innerHTML = `
                <img src="${imagen_principal}" alt="Imagen de ${nombre_producto}" class="producto-imagen">

                <h3 class="producto-nombre">${nombre_producto}</h3>

                <p class="producto-marca">Marca: <strong>${marca}</strong></p>
                
                <div class="producto-detalle">
                    <div class="puntuacion">
                        ${crearEstrellas(puntuacion)}
                        <span class="opiniones">(${opiniones})</span>
                    </div>
                    <span class="precio">${precio.toFixed(2)} €</span>
                </div>
                
                <button onclick="mostrarDetalle('${id}')">Ver Detalles</button>
            `;

            contenedor.appendChild(tarjetaProducto);
        });

        // Mostrar contador de productos
        const categoriaInfo = CATEGORIAS[categoria];
        if (categoriaInfo) {
            const contador = document.createElement('p');
            contador.style.cssText = 'text-align: center; color: #666; margin-top: 20px; grid-column: 1/-1;';
            contador.textContent = `Mostrando ${productosFiltrados.length} producto(s) de ${categoriaInfo.nombre}`;
            contenedor.appendChild(contador);
        }

    } catch (error) {
        console.error("Error al cargar o filtrar productos:", error);
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 50px; color: red; grid-column: 1/-1;">
                <p>Error al cargar los productos. Por favor, intenta de nuevo más tarde.</p>
            </div>
        `;
    }
}

// ====================================================================
// FUNCIÓN DE REDIRECCIÓN AL DETALLE DEL PRODUCTO
// ====================================================================
function mostrarDetalle(id) {
    window.location.href = `detalle_producto.html?id=${id}`;
}

// ====================================================================
// EJECUTAR AL CARGAR LA PÁGINA
// ====================================================================
// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Dar un pequeño delay para que se cargue el nav primero
    setTimeout(cargarProductosPorCategoria, 100);
});
