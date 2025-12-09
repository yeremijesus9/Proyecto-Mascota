// ====================================================================
// LÓGICA DE TRADUCCIÓN (Añadida)
// ====================================================================

/**
 * Función principal para cambiar el idioma y recargar todos los contenidos dinámicos.
 * @param {string} nuevoIdioma - El código del nuevo idioma ('es', 'en').
 * * Requiere que detalle.js defina: window.idiomaActual, window.rutaJson, window.cargarYMostrarProductos.
 */
function cambiarIdioma(nuevoIdioma) {
    if (!window.idiomaActual || window.idiomaActual === nuevoIdioma) return; 
    
    // 1. Actualiza la variable global en detalle.js
    window.idiomaActual = nuevoIdioma;
    console.log(`Cambiando idioma a: ${nuevoIdioma}`);
    
    // 2. Cargar las traducciones de la interfaz (nav, footer, textos fijos)
    if (typeof window.rutaJson === 'function') {
        loadTranslations(window.rutaJson()); 
    }
    
    // 3. RECARGAR LOS PRODUCTOS (Llamamos a la función de detalle.js)
    if (typeof window.cargarYMostrarProductos === 'function') {
        window.cargarYMostrarProductos(); 
    }
}


/**
 * Carga el archivo JSON de traducciones de la interfaz y las aplica.
 */
function loadTranslations(filePath) {
    fetch(filePath)
        .then(response => response.json())
        .then(translations => {
            applyTranslations(translations);
        })
        .catch(error => {
            console.error("Error al cargar o aplicar las traducciones:", error);
        });
}


/**
 * Aplica las traducciones a los elementos de la página usando data-key.
 */
function applyTranslations(translations) {
    // Traducir textos
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });

    // Traducir placeholders
    document.querySelectorAll('[data-placeholder-key]').forEach(element => {
        const key = element.getAttribute('data-placeholder-key');
        if (translations[key]) {
            element.placeholder = translations[key];
        }
    });
    console.log("Traducciones de interfaz aplicadas.");
}

// ====================================================================
// LÓGICA DE CARGA DE HTML (nav_footer.js) - MODIFICADA
// ====================================================================

document.addEventListener("DOMContentLoaded", () => {
    loadHTML("nav-container", "/nav.html");
    loadHTML("footer-container", "/footer.html");
});

/**
 * Carga el contenido de un archivo HTML en un contenedor específico.
 */
function loadHTML(containerId, filePath) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al cargar " + filePath);
            }
            return response.text();
        })
        .then(data => {
            const container = document.getElementById(containerId);
            if (container) {
                 container.innerHTML = data;
            }
           
            // Si cargamos la navegación, inicializamos listeners y la traducción inicial
            if (containerId === "nav-container") {
                initLoginListeners();
                
                // 💡 TRADUCCIÓN INICIAL: Aplicar el idioma por defecto y cargar productos al final de la carga del NAV
                if (window.idiomaActual && window.rutaJson && window.cargarYMostrarProductos) {
                    loadTranslations(window.rutaJson()); // Traduce la interfaz
                    window.cargarYMostrarProductos(); // Carga los productos
                }
            }
        })
        .catch(err => console.error(err));
}

// ====================================================================
// LÓGICA DEL POPUP DE LOGIN (login.js) - SIN CAMBIOS
// ====================================================================
async function showLogin() {
    let popup = document.getElementById("dynamicLoginPopup");

    if (popup) {
        const wrapper = popup.querySelector(".wrapper");
        popup.classList.add("popup-activo");
        wrapper?.classList.add("active-popup");
        return;
    }

    popup = document.createElement("div");
    popup.id = "dynamicLoginPopup";
    popup.classList.add("popup-contenedor");
    document.body.appendChild(popup);

    try {
        const response = await fetch("/login.html");
        const html = await response.text();

        popup.innerHTML = html;

        if (window.Iconify?.scan) Iconify.scan();

        initLoginComponent();
        
        const wrapper = popup.querySelector(".wrapper");
        
        popup.classList.add("popup-activo");
        wrapper?.classList.add("active-popup");

    } catch (error) {
        console.error("Error cargando login:", error);
    }
}

function initLoginComponent() {
    const wrapper = document.querySelector(".wrapper");
    if (!wrapper) return;

    const loginLink = document.querySelector(".login-link");
    const registerLink = document.querySelector(".register-link");
    const btnClose = document.getElementById("iconClose");
    const popup = document.getElementById("dynamicLoginPopup");

    registerLink?.addEventListener("click", (e) => {
        e.preventDefault();
        wrapper.classList.add("active");
    });

    loginLink?.addEventListener("click", (e) => {
        e.preventDefault();
        wrapper.classList.remove("active");
    });

    btnClose?.addEventListener("click", () => {
        wrapper.classList.remove("active-popup");
        popup.classList.remove("popup-activo");
        wrapper.classList.remove("active");
    });
}

function initLoginListeners() {
    // El listener del login ahora está delegado en el listener principal de click
    // para evitar duplicar escuchadores en el mismo DOM.
}


// ====================================================================
// LÓGICA DEL DROPDOWN DE IDIOMAS (MODIFICADA) y LOGIN DELEGADO
// ====================================================================

document.addEventListener("click", (e) => {
    // ----------------------------------------------------
    // Lógica del BOTÓN DE LOGIN (Trasladada aquí)
    const btnLogin = e.target.closest("#btnOpenLogin");
    if (btnLogin) {
        e.preventDefault();
        showLogin();
        return; 
    }
    // ----------------------------------------------------

    // ----------------------------------------------------
    // Lógica del MENÚ DE IDIOMAS (Con conexión a cambiarIdioma)
    const langButton = e.target.closest("#btnOpenLanguage");
    const langMenu = document.getElementById("languageMenu");
    const langOption = e.target.closest(".dropdown-menu a"); // Nueva: captura las opciones

    if (langButton) {
        e.preventDefault();
        // Alternar la clase 'visible'
        langMenu?.classList.toggle("visible");

    } else if (langOption) {
        // Se ha hecho clic en una opción de idioma
        e.preventDefault();
        const lang = langOption.getAttribute('lang');
        
        if (lang) {
            cambiarIdioma(lang); // 🔑 LLAMADA CLAVE para recargar todo
        }
        
        // Ocultar el menú
        langMenu?.classList.remove("visible");

    } else if (langMenu && langMenu.classList.contains("visible") && !e.target.closest(".dropdown-menu")) {
        // Cierra el menú si está abierto y el clic no fue dentro del menú
        langMenu.classList.remove("visible");
    }
    // ----------------------------------------------------
});