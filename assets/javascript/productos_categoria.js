// ====================================================================
// PRODUCTOS POR CATEGORÍA - Simple y directo
// ====================================================================

// Obtener la categoría de la URL
function obtenerCategoria() {
    const params = new URLSearchParams(window.location.search);
    return params.get('categoria') || 'gato';
}

// Cargar y mostrar productos de la categoría
async function mostrarProductosCategoria() {
    const categoria = obtenerCategoria();
    const contenedor = document.getElementById('productos-contenedor');
    const titulo = document.getElementById('titulo-categoria');

    // Actualizar título
    titulo.textContent = `Productos de ${categoria}`;

    try {
        // Cargar productos del JSON
        const respuesta = await fetch('/assets/JSON/es_mascota.json');
        const productos = await respuesta.json();

        // Filtrar por categoría (sin importar mayúsculas/minúsculas)
        const productosFiltrados = productos.filter(p =>
            p.categoria && p.categoria.toLowerCase() === categoria.toLowerCase()
        );

        // Limpiar contenedor
        contenedor.innerHTML = '';

        // Si no hay productos, mostrar mensaje
        if (productosFiltrados.length === 0) {
            contenedor.innerHTML = '<p style="text-align: center; color: #666;">No hay productos en esta categoría</p>';
            return;
        }

        // Mostrar cada producto
        productosFiltrados.forEach(producto => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta-producto';
            tarjeta.innerHTML = `
                <img src="${producto.imagen_principal}" alt="${producto.nombre_producto}" class="producto-imagen">
                <h3 class="producto-nombre">${producto.nombre_producto}</h3>
                <p class="producto-marca">Marca: <strong>${producto.marca}</strong></p>
                <div class="producto-detalle">
                    <span class="precio">${producto.precio.toFixed(2)} €</span>
                </div>
                <button onclick="window.location.href='detalle_producto.html?id=${producto.id}'">Ver Detalles</button>
            `;
            contenedor.appendChild(tarjeta);
        });

    } catch (error) {
        contenedor.innerHTML = '<p style="color: red;">Error al cargar productos</p>';
    }
}

// Ejecutar cuando cargue la página
document.addEventListener('DOMContentLoaded', mostrarProductosCategoria);
