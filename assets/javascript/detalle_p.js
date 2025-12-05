const mascota = '/assets/JSON/mascota.json';

async function cargarYMostrarProductos() {
    const contenedor = document.getElementById('productos-contenedor');
    
    try {
        const respuesta = await fetch(mascota); 
        
        if (!respuesta.ok) {
            contenedor.innerHTML = '<p style="color: red;">¡Error! No se pudo acceder a mascota.json.</p>';
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const productos = await respuesta.json(); 

        contenedor.innerHTML = ''; 

        // 4. Iterar y generar HTML por cada producto
        productos.forEach(producto => {
            // Desestructuración para acceder fácilmente a las propiedades
            const { 
                id, 
                nombre_producto, 
                marca, 
                precio, 
                puntuacion, 
                opiniones,
                imagen_principal,
                descripcion
            } = producto;

            const tarjetaProducto = document.createElement('div');
            tarjetaProducto.className = 'tarjeta-producto';

            // Generar el HTML de la tarjeta
            tarjetaProducto.innerHTML = `
                <img src "${imagen_principal}" alt=imagen de ${nombre_producto} class="producto-imagen">
                <h3 class="producto-nombre">${nombre_producto}</h3>
                <p class="producto-marca">Marca: <strong>${marca}</strong></p>
                <p class="producto-descripcion">${descripcion.substring(0, 100)}...</p>
                
                <div class="producto-detalle">
                    <span class="precio">${precio.toFixed(2)} €</span>
                    <span class="puntuacion">⭐ ${puntuacion} (${opiniones})</span>
                </div>
                
                <button onclick="mostrarDetalle('${id}', '${nombre_producto}')">Ver Detalles</button>
            `;

            contenedor.appendChild(tarjetaProducto);
        });

    } catch (error) {
        console.error("No se pudo cargar o procesar el JSON:", error);
    }
}

// Función de ejemplo para un botón
function mostrarDetalle(id, nombre) {
    alert(`Has hecho clic en: ${nombre} (ID: ${id})`);
    // Aquí podrías redirigir a una página de detalle:
    // window.location.href = \`detalle.html?id=${id}\`;
}

// Iniciar la carga de datos al cargar el script
cargarYMostrarProductos();