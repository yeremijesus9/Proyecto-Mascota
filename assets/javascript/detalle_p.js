// ====================================================================
// CONFIGURACIÓN GLOBAL DE IDIOMA Y RUTA
// Estas variables se hacen globales para ser usadas en script.js
// ====================================================================

/**
 * @type {string} idiomaActual - Código del idioma actual, inicia en español.
 */
window.idiomaActual = "es";

/**
 * Retorna la ruta del archivo JSON de productos para el idioma actual.
 * @returns {string} La ruta completa al archivo JSON.
 */
window.rutaJson = function() {
    return `/assets/JSON/${window.idiomaActual}_mascota.json`;
};


// ====================================================================
// FUNCIÓN PRINCIPAL DE CARGA Y RENDERIZADO DE PRODUCTOS
// ====================================================================

/**
 * Función asíncrona que carga el JSON de productos según el idioma actual
 * y renderiza las tarjetas de producto en el contenedor.
 */
window.cargarYMostrarProductos = async function() {
    // Asegúrate de que este ID exista en tu HTML principal
    const contenedor = document.getElementById('productos-contenedor');
    
    if (!contenedor) {
        console.warn("Contenedor 'productos-contenedor' no encontrado. Asegúrate de que el ID es correcto.");
        return;
    }

    try {
        const ruta = window.rutaJson();
        const respuesta = await fetch(ruta);
        
        if (!respuesta.ok) {
            contenedor.innerHTML = `<p style="color: red;">¡Error! No se pudo acceder a ${ruta}.</p>`;
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const data = await respuesta.json(); 
        
        // 🔑 NOTA: Ajusta esta línea si tus productos vienen anidados, 
        // por ejemplo: const productos = data.mascotas;
        const productos = Array.isArray(data) ? data : data.mascotas; 

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
                imagen_principal
            } = producto;

            const tarjetaProducto = document.createElement('div');
            tarjetaProducto.className = 'tarjeta-producto';

            // Generar el HTML de la tarjeta
            // USAMOS data-key en los textos fijos para que script.js los traduzca.
            tarjetaProducto.innerHTML = `
                <img src="${imagen_principal}" alt="Imagen de ${nombre_producto}" class="producto-imagen">
                
                <h3 class="producto-nombre-compacto">${nombre_producto}</h3>
                <p class="producto-marca-compacta"><span data-key="card_marca">Marca:</span> <strong>${marca}</strong></p> 
                
                <div class="producto-detalle-compacto">
                    <span class="precio">${precio.toFixed(2)} €</span>
                    <span class="puntuacion-compacta">⭐ ${puntuacion} (<span data-key="card_opiniones">${opiniones}</span>)</span>
                </div>
                
                <button onclick="mostrarDetalle('${id}', '${nombre_producto}')" data-key="card_btn_detalle">Ver Detalles</button>
            `;

            contenedor.appendChild(tarjetaProducto);
        });

    } catch (error) {
        console.error("No se pudo cargar o procesar el JSON de productos:", error);
        // Si hay un error, puedes mostrar un mensaje genérico al usuario si el contenedor no está vacío
        if (contenedor.innerHTML === '') {
            contenedor.innerHTML = `<p style="color: red;" data-key="load_error">Error al cargar los productos. Inténtalo de nuevo más tarde.</p>`;
        }
    }
};

// Función de ejemplo para un botón de detalle (también debe ser global)
window.mostrarDetalle = function(id, nombre) {
    alert(`Has hecho clic en: ${nombre} (ID: ${id})`);
};

// **IMPORTANTE**: QUITAMOS la llamada inicial aquí (`cargarYMostrarProductos();`). 
// Ahora, la llamada inicial será manejada por `script.js` después de cargar el NAV, 
// asegurando que las funciones globales ya existan y se ejecuten en el orden correcto.