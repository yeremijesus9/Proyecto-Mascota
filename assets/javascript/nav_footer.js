
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
                updateLoginIcon(); // Actualizar icono según estado de login

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

    // Inicializar handlers de formularios si existen
    if (typeof window.initFormHandlers === 'function') {
        window.initFormHandlers();
    }
}

function initLoginListeners() {

}

// ============================================
// GESTIÓN DE ESTADO DE AUTENTICACIÓN
// ============================================

/**
 * Actualiza el icono de login en el navbar según el estado de autenticación
 */
function updateLoginIcon() {
    const btnLogin = document.getElementById('btnOpenLogin');
    if (!btnLogin) return;

    // Verificar si hay un usuario logueado
    const isLoggedIn = window.AuthSystem ? window.AuthSystem.isLoggedIn() : false;
    const currentUser = window.AuthSystem ? window.AuthSystem.getCurrentUser() : null;

    if (isLoggedIn && currentUser) {
        // Usuario logueado - cambiar icono y comportamiento
        const iconSpan = btnLogin.querySelector('.iconify');
        if (iconSpan) {
            iconSpan.setAttribute('data-icon', 'mdi:account');
            if (window.Iconify?.scan) window.Iconify.scan();
        }

        // Crear dropdown de usuario
        createUserDropdown(btnLogin, currentUser);
    } else {
        // Usuario no logueado - mantener icono original
        const iconSpan = btnLogin.querySelector('.iconify');
        if (iconSpan) {
            iconSpan.setAttribute('data-icon', 'mdi:user-plus');
            if (window.Iconify?.scan) window.Iconify.scan();
        }
    }
}

/**
 * Crea un dropdown de usuario con opciones de perfil y logout
 */
function createUserDropdown(btnLogin, user) {
    // Evitar duplicados
    let existingDropdown = document.getElementById('userDropdownMenu');
    if (existingDropdown) {
        existingDropdown.remove();
    }

    // Crear contenedor del dropdown
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'user-dropdown-container';
    dropdownContainer.style.position = 'relative';
    dropdownContainer.style.display = 'inline-block';

    // Mover el botón dentro del contenedor
    btnLogin.parentNode.insertBefore(dropdownContainer, btnLogin);
    dropdownContainer.appendChild(btnLogin);

    // Crear menú dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'userDropdownMenu';
    dropdown.className = 'dropdown-menu user-dropdown';
    dropdown.innerHTML = `
        <div class="user-info">
            <span class="iconify" data-icon="mdi:account-circle" style="font-size: 24px;"></span>
            <div>
                <strong>${user.username}</strong>
                <small>${user.email}</small>
            </div>
        </div>
        <hr style="margin: 8px 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
        <a href="#" id="btnLogout">
            <span class="iconify" data-icon="mdi:logout" style="margin-right: 8px;"></span>
            Cerrar Sesión
        </a>
    `;

    // Estilos específicos para el dropdown de usuario
    dropdown.style.cssText = `
        min-width: 220px;
        padding: 10px;
    `;

    dropdownContainer.appendChild(dropdown);

    // Escanear iconos de Iconify
    if (window.Iconify?.scan) window.Iconify.scan();

    // Manejar click en logout
    const btnLogout = dropdown.querySelector('#btnLogout');
    btnLogout?.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.AuthSystem) {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                window.AuthSystem.logout();
            }
        }
    });

    // Toggle dropdown al hacer click en el botón
    btnLogin.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('visible');
    });

    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!dropdownContainer.contains(e.target)) {
            dropdown.classList.remove('visible');
        }
    });
}



document.addEventListener("click", (e) => {
    // ----------------------------------------------------

    const btnLogin = e.target.closest("#btnOpenLogin");
    if (btnLogin) {
        e.preventDefault();

        // Verificar si el usuario está logueado
        const isLoggedIn = window.AuthSystem ? window.AuthSystem.isLoggedIn() : false;

        if (!isLoggedIn) {
            // Si no está logueado, mostrar el formulario de login
            showLogin();
        }
        // Si está logueado, el dropdown se maneja en updateLoginIcon()
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