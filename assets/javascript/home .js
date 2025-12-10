const mascota = '/assets/JSON/es_mascota.json';

function crearEstrellas(puntuacion) {
    const p = Number(puntuacion) || 0;
    let s = '';
    for (let i = 1; i <= 5; i++) {
        s += i <= p ? '★' : '☆';
    }
    return `<span class="stars" style="color: #ff0000ff; font-size: 1.2rem;">${s}</span>`;
}

// ====================================================================
// FUNCIÓN PRINCIPAL DE CARGA Y RENDERIZADO DE PRODUCTOS
// ====================================================================
async function cargarYMostrarProductos() {
    const contenedor = document.getElementById('productos-contenedor');

    if (!contenedor) {
        console.warn("Contenedor 'productos-contenedor' no encontrado.");
        return;
    }

    try {
        const respuesta = await fetch(mascota);

        if (!respuesta.ok) {
            contenedor.innerHTML = '<p style="color: red;">¡Error! No se pudo acceder a mascota.json.</p>';
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const productos = await respuesta.json();

        contenedor.innerHTML = '';

        // Generar tarjetas de productos
        productos.forEach(producto => {

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

    } catch (error) {
        console.error("No se pudo cargar o procesar el JSON:", error);
    }
}

// ====================================================================
// FUNCIÓN DE REDIRECCIÓN AL DETALLE DEL PRODUCTO
// ====================================================================
function mostrarDetalle(id) {
    window.location.href = `detalle_producto.html?id=${id}`;
}

// Ejecutar al cargar
cargarYMostrarProductos();
