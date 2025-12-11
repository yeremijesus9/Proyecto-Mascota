
/**
 * Función principal para cambiar el idioma y recargar todos los contenidos dinámicos.
 * @param {string} nuevoIdioma 
 */
function cambiarIdioma(nuevoIdioma) {
    if (!window.idiomaActual || window.idiomaActual === nuevoIdioma) return;


    window.idiomaActual = nuevoIdioma;
    console.log(`Cambiando idioma a: ${nuevoIdioma}`);


    if (typeof window.rutaInterfaceJson === 'function') {
        loadTranslations(window.rutaInterfaceJson());
    }

   
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



function applyTranslations(translations) {
   
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[key]) {
            element.innerHTML = translations[key];
        }
    });

    
    document.querySelectorAll('[data-placeholder-key]').forEach(element => {
        const key = element.getAttribute('data-placeholder-key');
        if (translations[key]) {
            element.placeholder = translations[key];
        }
    });
    console.log("Traducciones de interfaz aplicadas.");
}


document.addEventListener("DOMContentLoaded", () => {
    loadHTML("nav-container", "/nav.html");
    loadHTML("footer-container", "/footer.html");
});


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

    
            if (containerId === "nav-container") {
                initLoginListeners();

                if (window.idiomaActual && window.rutaInterfaceJson && window.cargarYMostrarProductos) {
                    loadTranslations(window.rutaInterfaceJson()); 
                    window.cargarYMostrarProductos(); 
                }
            }
        })
        .catch(err => console.error(err));
}


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

}



document.addEventListener("click", (e) => {
    // ----------------------------------------------------
   
    const btnLogin = e.target.closest("#btnOpenLogin");
    if (btnLogin) {
        e.preventDefault();
        showLogin();
        return;
    }
    // ----------------------------------------------------


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
            cambiarIdioma(lang); 
        }

        
        langMenu?.classList.remove("visible");

    } else if (langMenu && langMenu.classList.contains("visible") && !e.target.closest(".dropdown-menu")) {
        // Cierra el menú si está abierto y el clic no fue dentro del menú
        langMenu.classList.remove("visible");
    }
    // ----------------------------------------------------
});