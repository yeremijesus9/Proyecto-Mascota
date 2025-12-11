const mascota = '/assets/JSON/es_mascota.json';

// Crea la representación de estrellas (0-5)
function crearEstrellas(puntuacion) {
    const p = Math.max(0, Math.min(5, Math.round(Number(puntuacion) || 0)));
    let s = '';
    for (let i = 1; i <= 5; i++) {
        s += i <= p ? '★' : '☆';
    }
    return `<span class="stars" aria-hidden="true">${s}</span>`;
}

// Renderiza una tarjeta de producto dentro de un contenedor (DOM-safe)
function renderProducto(producto, contenedor) {
    const id = String(producto.id ?? '');
    const nombre = producto.nombre_producto ?? 'Producto sin nombre';
    const marca = producto.marca ?? 'Marca desconocida';
    const precioRaw = producto.precio;
    const precio = Number(typeof precioRaw === 'string' ? precioRaw.replace(',', '.') : precioRaw);
    const precioValido = Number.isFinite(precio) ? precio : 0;
    const puntuacion = producto.puntuacion ?? 0;
    const opiniones = Number(producto.opiniones) || 0;
    const imagen = producto.imagen_principal ?? '';

    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-producto';

    const img = document.createElement('img');
    img.className = 'producto-imagen';
    img.alt = `Imagen de ${nombre}`;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = imagen;

    const h3 = document.createElement('h3');
    h3.className = 'producto-nombre';
    h3.textContent = nombre;

    const pMarca = document.createElement('p');
    pMarca.className = 'producto-marca';
    pMarca.textContent = 'Marca: ';
    const strong = document.createElement('strong');
    strong.textContent = marca;
    pMarca.appendChild(strong);

    const detalle = document.createElement('div');
    detalle.className = 'producto-detalle';

    const divPuntuacion = document.createElement('div');
    divPuntuacion.className = 'puntuacion';
    divPuntuacion.innerHTML = crearEstrellas(puntuacion);

    const spanOpiniones = document.createElement('span');
    spanOpiniones.className = 'opiniones';
    spanOpiniones.textContent = ` (${opiniones})`;
    divPuntuacion.appendChild(spanOpiniones);

    const spanPrecio = document.createElement('span');
    spanPrecio.className = 'precio';
    spanPrecio.textContent = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(precioValido);

    detalle.appendChild(divPuntuacion);
    detalle.appendChild(spanPrecio);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ver-detalle';
    btn.textContent = 'Ver Detalles';
    btn.addEventListener('click', () => mostrarDetalle(id));

    tarjeta.appendChild(img);
    tarjeta.appendChild(h3);
    tarjeta.appendChild(pMarca);
    tarjeta.appendChild(detalle);
    tarjeta.appendChild(btn);

    contenedor.appendChild(tarjeta);
}

// Carga productos y los reparte en dos contenedores, 4 en cada uno
async function cargarYMostrarDestacados() {
    const cont1 = document.getElementById('destacados-1');
    const cont2 = document.getElementById('destacados-2');

    if (!cont1 || !cont2) {
        console.warn("Uno o ambos contenedores de destacados no existen (destacados-1, destacados-2).");
        return;
    }

    // Mensaje de carga
    cont1.innerHTML = '<p class="loading">Cargando...</p>';
    cont2.innerHTML = '';

    try {
        const resp = await fetch(mascota, { cache: 'no-cache' });
        if (!resp.ok) {
            cont1.innerHTML = '<p style="color:red;">Error al cargar productos.</p>';
            throw new Error(`HTTP ${resp.status}`);
        }

        const productos = await resp.json();
        // Aseguramos que es array
        const lista = Array.isArray(productos) ? productos : [];

        // Seleccionar bloques (si hay menos de 8, se mostrarán los disponibles)
        const bloque1 = lista.slice(0, 5);
        const bloque2 = lista.slice(5, 10);

        // Limpiar contenedores
        cont1.innerHTML = '';
        cont2.innerHTML = '';

        const frag1 = document.createDocumentFragment();
        const frag2 = document.createDocumentFragment();

        // Renderizar en fragmentos
        bloque1.forEach(p => renderProducto(p, frag1));
        bloque2.forEach(p => renderProducto(p, frag2));

        // Si prefieres mostrar aleatorios en lugar de por índice, sustituye arriba por:
        // const shuffled = lista.sort(() => Math.random() - 0.5);
        // const bloque1 = shuffled.slice(0,4); const bloque2 = shuffled.slice(4,8);

        cont1.appendChild(frag1);
        cont2.appendChild(frag2);

    } catch (error) {
        console.error('Error al procesar productos:', error);
        cont1.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        cont2.innerHTML = '';
    }
}

function mostrarDetalle(id) {
    if (!id) return;
    window.location.href = `detalle_producto.html?id=${encodeURIComponent(id)}`;
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarYMostrarDestacados);
