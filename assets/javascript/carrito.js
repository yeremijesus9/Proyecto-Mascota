// 1. Definición de productos y estado del carrito
const productos = [
    { id: "CAT1", nombre: 'Grature Pienso de Pollo para Gatos Adultos Esterilizados', precio: 6.99 },
    { id: "CAT2", nombre: 'Purina Felix Crispies Snacks de Salmón y Trucha para Gatos', precio: 1.34 },
    { id: "CAT3", nombre: 'Castillo Rascador Grande Nilo Azul de Gloria Pets para Gatos', precio: 129.99 },
    { id: "CAT4", nombre: 'SUMSU Guante PRO Aseo para Perro y Gato', precio: 4.99 },
    { id: "CAT5", nombre: 'Sure Petcare Bebedero Inteligente Felaqua Connect', precio: 130.67 },
    { id: "PEZ1", nombre: 'Tetra Min Alimento en Copos para Peces Tropicales', precio: 8.99 },
    { id: "PEZ2", nombre: 'Eheim Filtro Externo Profesional 4+ 250 para Acuarios', precio: 189.99 },
    { id: "PEZ3", nombre: 'Aqua Ornaments Castillo Hundido con Plantas Decorativas para Acuario', precio: 24.99 },
    { id: "PEZ4", nombre: 'JBL NovoStick M Alimento en Palitos para Peces de Agua Dulce', precio: 5.49 },
    { id: "PEZ5", nombre: 'Sera Aquatan Acondicionador de Agua para Acuarios', precio: 12.99 },
    { id: "ROE1", nombre: 'JR Schmaus comida para cobayas', precio: 7.49 },
    { id: "ROE2", nombre: 'TIAKI Tug & Find juguete de inteligencia para roedores', precio: 38.49},
    { id: "ROE3", nombre:  'Villa TIAKI Jaula para animales pequeños', precio: 146.99},
    { id: "ROE4", nombre:  'Bebedero Classic de Luxe', precio: 129.99},
    { id: "ROE5", nombre:  'Pet Teezer De-shedding cepillo para mascotas', precio: 13.99}
];

let carrito = [];

// 2. Referencias a elementos del DOM
const listaProductosDOM = document.getElementById('lista-productos');
const carritoListaDOM = document.getElementById('carrito-lista');
const carritoTotalDOM = document.getElementById('carrito-total');
const vaciarCarritoBtn = document.getElementById('vaciar-carrito');

// 3. Funciones de Renderizado

// Genera y muestra los productos en la tienda
function renderizarProductos() {
    productos.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto');
        productoDiv.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio.toFixed(2)}</p>
            <button class="agregar-carrito" data-id="${producto.id}">Añadir al Carrito</button>
        `;
        listaProductosDOM.appendChild(productoDiv);
    });
}

// Actualiza la lista de elementos en el carrito y el total
function renderizarCarrito() {
    // Vaciar la lista actual del carrito
    carritoListaDOM.innerHTML = ''; 
    let total = 0;

    carrito.forEach(item => {
        const listItem = document.createElement('li');
        listItem.classList.add('item-carrito');
        
        // Calcular el subtotal del item
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        listItem.innerHTML = `
            <span>${item.nombre} x ${item.cantidad}</span>
            <span>$${subtotal.toFixed(2)} 
                <button class="eliminar-item" data-id="${item.id}">X</button>
            </span>
        `;
        carritoListaDOM.appendChild(listItem);
    });

    // Actualizar el total
    carritoTotalDOM.textContent = `$${total.toFixed(2)}`;
}

// 4. Funciones de Lógica del Carrito

function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    // Buscar si el producto ya está en el carrito
    const itemExistente = carrito.find(item => item.id === productoId);

    if (itemExistente) {
        // Si existe, aumentar la cantidad
        itemExistente.cantidad += 1;
    } else {
        // Si no existe, añadirlo con cantidad 1
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
    }

    renderizarCarrito();
}

function eliminarDelCarrito(productoId) {
    // Encontrar el índice del producto en el carrito
    const index = carrito.findIndex(item => item.id === productoId);

    if (index !== -1) {
        // Reducir la cantidad o eliminar si solo queda 1
        if (carrito[index].cantidad > 1) {
            carrito[index].cantidad -= 1;
        } else {
            // Eliminar el producto del array si la cantidad es 1
            carrito.splice(index, 1);
        }
    }

    renderizarCarrito();
}

function vaciarCarrito() {
    carrito = []; // Resetear el array del carrito
    renderizarCarrito();
}

// 5. Manejo de Eventos

// Delegación de eventos para los botones de la tienda (Añadir)
listaProductosDOM.addEventListener('click', (e) => {
    if (e.target.classList.contains('agregar-carrito')) {
        const id = parseInt(e.target.dataset.id);
        agregarAlCarrito(id);
    }
});

// Delegación de eventos para los botones del carrito (Eliminar)
carritoListaDOM.addEventListener('click', (e) => {
    if (e.target.classList.contains('eliminar-item')) {
        const id = parseInt(e.target.dataset.id);
        eliminarDelCarrito(id);
    }
});

// Evento para el botón de Vaciar Carrito
vaciarCarritoBtn.addEventListener('click', vaciarCarrito);

// 6. Inicialización
document.addEventListener('DOMContentLoaded', () => {
    renderizarProductos();
    renderizarCarrito(); // Asegurarse de que el total inicial sea 0.00
});