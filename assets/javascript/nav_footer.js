let reloj; // Se asignará después de cargar el navbar

function actualizarExtrasNav() {
    // Actualizar reloj
    actualizarReloj();
}

// Funciones de traducciones
async function traducirInterfaz(idioma) {
    const archivo = idioma === 'en'
        ? 'en_interface.json'
        : 'es_interface.json';

    const response = await fetch(archivo);
    const textos = await response.json();

    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.dataset.key;
        if (textos[key]) el.innerHTML = textos[key];
    });

    document.querySelectorAll('[data-placeholder-key]').forEach(el => {
        const key = el.dataset.placeholderKey;
        if (textos[key]) el.placeholder = textos[key];
    });
}

// ==================================================
// Funciones de carga dinámica de HTML
// ==================================================
function loadHTML(containerId, filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar " + filePath);
            return response.text();
        })
        .then(data => {
            const container = document.getElementById(containerId);
            if (container) container.innerHTML = data;

            if (containerId === "nav-container") {
                // Notificamos al sistema de login que el nav ya está listo
                if (typeof window.inicializarInterfazLogin === 'function') {
                    window.inicializarInterfazLogin();
                }

                reloj = document.getElementById("reloj");
                setInterval(actualizarReloj, 1000);
                actualizarReloj();

                // Inicializar el carrito después de cargar el navbar
                if (typeof window.configurarEventListeners === 'function') {
                    window.configurarEventListeners();
                }

                if (window.idiomaActual && window.rutaInterfaceJson && window.cargarYMostrarProductos) {
                    loadTranslations(window.rutaInterfaceJson());
                    window.cargarYMostrarProductos();
                }
            }
        })
        .catch(err => console.error(err));
}

// ==================================================
// Función principal del reloj
// ==================================================
function actualizarReloj() {
    if (!reloj) return;
    const ahora = new Date();
    const opciones = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    reloj.textContent = ahora.toLocaleDateString(window.idiomaActual || 'es', opciones);
}

// ==================================================
// Event listeners globales
// ==================================================
document.addEventListener("click", e => {
    // Modo Oscuro
    const btnDarkMode = e.target.closest("#btn-dark-mode");
    if (btnDarkMode) {
        e.preventDefault();
        document.body.classList.toggle("dark-mode");
        return;
    }

    // Idioma
    const langButton = e.target.closest("#btnOpenLanguage");
    const langMenu = document.getElementById("languageMenu");
    const langOption = e.target.closest(".dropdown-menu a");

    if (langButton) {
        e.preventDefault();
        langMenu?.classList.toggle("visible");
    } else if (langOption) {
        e.preventDefault();
        const lang = langOption.getAttribute('lang');
        if (lang) cambiarIdioma(lang);
        langMenu?.classList.remove("visible");
    } else if (langMenu?.classList.contains("visible") && !e.target.closest(".dropdown-menu")) {
        langMenu.classList.remove("visible");
    }
});

// ==================================================
// Inicialización
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
    loadHTML("nav-container", "nav.html");
    loadHTML("footer-container", "footer.html");
});
