# Miwuff - Tienda Online de Mascotas

Bienvenido a **Miwuff**, una plataforma de comercio electrónico moderna y dinámica diseñada para los amantes de las mascotas. Este proyecto ofrece una experiencia de usuario completa para la compra de productos para perros, gatos, roedores, peces y pájaros, combinando un diseño atractivo con funcionalidades esenciales de e-commerce.

![Miwuff Banner](assets/img/home/backgroundreadme-miwuff.png)
*(Imagen representativa del proyecto)*

## Descripción

Miwuff es una Single Page Application (SPA) simulada construida con tecnologías web estándar. El objetivo del proyecto es proporcionar una interfaz intuitiva y amigable donde los usuarios pueden navegar por categorías, ver detalles de productos, gestionar un carrito de compras y realizar pedidos simulados. El diseño se centra en la estética visual ("wow effect") y la facilidad de uso.

## Características Principales

*   **Página de Inicio Dinámica:**
    *   Carrusel de imágenes animado.
    *   Secciones de productos destacados cargados dinámicamente.
    *   Accesos directos visuales a las diferentes categorías de animales.
    *   Pop-up de ofertas promocionales.

*   **Carrito de Compras Funcional:**
    *   Agregar productos desde el catálogo o la página de detalles.
    *   Persistencia de datos utilizando `localStorage` (el carrito no se borra al recargar).
    *   Cálculo automático de totales.
    *   Gestión de cantidades y eliminación de artículos.

*   **Catálogo y Categorías:**
    *   Filtrado de productos por categoría (Perros, Gatos, Roedores, Peces, Pájaros).
    *   Carga de datos de productos desde archivos JSON locales.

*   **Detalles del Producto:**
    *   Vista detallada con descripción, precio, valoraciones y opciones de compra.

*   **Gestión de Usuarios:**
    *   Sistema de Login y Registro con validaciones visuales.
    *   Interfaz de autenticación con transiciones suaves.

*   **Sistema de Administración (Admin Panel):**
    *   Dashboard con estadísticas en tiempo real (pedidos, productos, ingresos).
    *   **CRUD Completo de Productos:**
        *   **Create:** Alta de nuevos productos con carga de imágenes (Drag & Drop) y conversión a Base64.
        *   **Read:** Listado visual de inventario.
        *   **Update:** Edición en caliente de precios, descripciones (multi-idioma) y categorías.
        *   **Delete:** Eliminación de productos.
    *   **Gestión de Pedidos:**
        *   Visualización de historial de pedidos.
        *   Edición de datos de envío y contacto.
        *   Búsqueda y filtrado de registros.

*   **Proceso de Checkout:**
    *   Formulario de pago y envío validado.
    *   Resumen de pedido antes de la confirmación.

*   **Internacionalización:**
    *   Soporte básico para cambio de idioma (implementado mediante `idioma.js`).

*   **Diseño Responsivo y Moderno:**
    *   Estilos personalizados con CSS puro (Glassmorphism, gradientes, animaciones).
    *   Adaptable a diferentes tamaños de pantalla.
    *   Modo Oscuro (Dark Mode) disponible.

## Tecnologías Utilizadas

Este proyecto ha sido desarrollado utilizando las siguientes tecnologías:

*   **HTML5:** Estructura semántica del contenido.
*   **CSS3:** Diseño visual, animaciones, Flexbox y Grid Layout. No se han utilizado frameworks CSS pesados, priorizando estilos personalizados.
*   **JavaScript (ES6+):** Lógica del lado del cliente, manipulación del DOM, gestión de eventos y almacenamiento local.
*   **JSON:** Almacenamiento y estructura de datos para el catálogo de productos.
*   **Iconify:** Iconos vectoriales para una interfaz limpia.
*   **Backend Simulado (JSON Server):** API REST completa para gestión de datos persistentes.

## Estructura del Proyecto

```text
Proyecto-Mascota/
├── BACK1/                # Backend Simulado
│   ├── db.json           # Base de datos (usuarios, productos, pedidos)
│   ├── server.js         # Script de inicio
│   └── package.json      # Dependencias del servidor (json-server)
├── assets/
│   ├── css/              # Estilos (panel_del_admin.css, style.css, etc.)
│   ├── img/              # Recursos gráficos
│   └── javascript/       # Lógica (panel_del_admin.js, nuevo.js, login.js)
├── index.html            # Home
├── panel_del_admin.html  # Dashboard de Administración
├── nuevo.html            # Formulario de creación de productos
├── productos.html        # Catálogo
├── detalle_producto.html # Vista detalle
├── carrito.html          # Carrito
├── checkout.html         # Pago
└── login.html            # Autenticación
```

## Instalación y Uso

Este proyecto requiere iniciar el servidor de backend (JSON Server) y servir los archivos del frontend.

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/yeremijesus9/Proyecto-Mascota.git
    ```

2.  **Iniciar el Backend (API REST):**
    Es necesario tener Node.js instalado.
    ```bash
    cd BACK1
    npm install         # Instalar dependencias
    npm run dev         # Iniciar servidor en puerto 3000
    ```

3.  **Iniciar el Frontend:**
    Abre el archivo `index.html` en tu navegador.
    > **Recomendación:** Usa la extensión "Live Server" de VS Code para evitar bloqueos por CORS al conectar con la API local.

4.  **Acceso Admin:**
    *   Para acceder al panel, inicia sesión con un usuario con rol `admin`.
    *   El sistema habilitará automáticamente el botón de acceso al **Dashboard** en el menú de usuario.

## Contribución

Las contribuciones son bienvenidas. Si deseas mejorar este proyecto, por favor:

1.  Haz un Fork del repositorio.
2.  Crea una rama para tu característica (`git checkout -b feature/NuevaCaracteristica`).
3.  Haz commit de tus cambios (`git commit -m 'Agrega nueva característica'`).
4.  Haz push a la rama (`git push origin feature/NuevaCaracteristica`).
5.  Abre un Pull Request.

## Autores

Este proyecto ha sido desarrollado por el siguiente equipo:

*   **Naia** 
*   **Yeremi** 
*   **Santiago Patiño**
*   **Eder**
*   **Gabriel Hernández**

## Licencia

Este proyecto es de uso libre para fines educativos y personales.

---
*Desarrollado con ❤️ para las mascotas.*
