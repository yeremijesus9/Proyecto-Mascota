// navegación y footer - cargo estos componentes dinámicamente en todas las páginas

// inicializo el idioma si no existe ya
if (!window.idiomaActual) window.idiomaActual = 'es';
let reloj; // esta variable la asigno después de cargar el navbar

// función para cambiar idioma y recargar todo el contenido
function cambiarIdioma(nuevoIdioma) {
    // si es el mismo idioma no hago nada
    if (!window.idiomaActual || window.idiomaActual === nuevoIdioma) return;

    window.idiomaActual = nuevoIdioma;
    console.log(`cambiando idioma a: ${nuevoIdioma}`);

    // cargo traducciones de la interfaz si existe la función
    if (typeof window.rutaInterfaceJson === 'function') {
        loadTranslations(window.rutaInterfaceJson());
    }

    // recargo productos si existe la función
    if (typeof window.cargarYMostrarProductos === 'function') {
        window.cargarYMostrarProductos();
    }

    // actualizo el reloj con el nuevo idioma
    actualizarReloj();
}

// cargo el archivo json de traducciones
function loadTranslations(filePath) {
    fetch(filePath)
        .then(response => response.json())
        .then(translations => applyTranslations(translations))
        .catch(error => console.error("error al cargar traducciones:", error));
}

// aplico las traducciones a todos los elementos con data-key
function applyTranslations(translations) {
    // actualizo contenido de elementos
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[key]) element.innerHTML = translations[key];
    });

    // actualizo placeholders de inputs
    document.querySelectorAll('[data-placeholder-key]').forEach(element => {
        const key = element.getAttribute('data-placeholder-key');
        if (translations[key]) element.placeholder = translations[key];
    });

    console.log("traducciones aplicadas.");
}

// muestro el popup de login cargándolo dinámicamente
async function showLogin() {
    let popup = document.getElementById("dynamicLoginPopup");
    if (!popup) {
        // creo el popup si no existe
        popup = document.createElement("div");
        popup.id = "dynamicLoginPopup";
        popup.classList.add("popup-contenedor");
        document.body.appendChild(popup);
    }

    try {
        // cargo el html del login
        const response = await fetch("login.html");
        popup.innerHTML = await response.text();
        // escaneo los iconos si iconify está disponible
        if (window.Iconify?.scan) Iconify.scan();
        initLoginComponent();
        // muestro el popup
        const wrapper = popup.querySelector(".wrapper");
        popup.classList.add("popup-activo");
        wrapper?.classList.add("active-popup");
    } catch (error) {
        console.error("error cargando login:", error);
    }
}

// inicializo los eventos del componente de login
function initLoginComponent() {
    const wrapper = document.querySelector(".wrapper");
    if (!wrapper) return;

    const loginLink = document.querySelector(".login-link");
    const registerLink = document.querySelector(".register-link");
    const btnClose = document.getElementById("iconClose");
    const popup = document.getElementById("dynamicLoginPopup");

    // cambio entre login y registro
    registerLink?.addEventListener("click", e => {
        e.preventDefault();
        wrapper.classList.add("active"); // muestro el registro
    });

    loginLink?.addEventListener("click", e => {
        e.preventDefault();
        wrapper.classList.remove("active"); // vuelvo al login
    });

    // cierro el popup
    btnClose?.addEventListener("click", () => {
        wrapper.classList.remove("active-popup");
        popup.classList.remove("popup-activo");
        wrapper.classList.remove("active");
    });

    // inicializo los formularios si la función existe
    if (typeof window.initFormHandlers === 'function') window.initFormHandlers();
}

// actualizo el icono de login según si hay sesión iniciada
function updateLoginIcon() {
    const btnLogin = document.getElementById('btnOpenLogin');
    if (!btnLogin) return;

    // verifico si hay un usuario conectado
    const isLoggedIn = window.AuthSystem ? window.AuthSystem.isLoggedIn() : false;
    const currentUser = window.AuthSystem ? window.AuthSystem.getCurrentUser() : null;

    if (isLoggedIn && currentUser) {
        // si hay sesión, cambio el icono a "account"
        const iconSpan = btnLogin.querySelector('.iconify');
        if (iconSpan) iconSpan.setAttribute('data-icon', 'mdi:account');
        if (window.Iconify?.scan) window.Iconify.scan();
        // creo el dropdown con info del usuario
        createUserDropdown(btnLogin, currentUser);
    } else {
        // si no hay sesión, muestro "user-plus"
        const iconSpan = btnLogin.querySelector('.iconify');
        if (iconSpan) iconSpan.setAttribute('data-icon', 'mdi:user-plus');
        if (window.Iconify?.scan) window.Iconify.scan();
    }
}

// creo el menú dropdown del usuario conectado
function createUserDropdown(btnLogin, user) {
    // elimino dropdown anterior si existe
    let existingDropdown = document.getElementById('userDropdownMenu');
    if (existingDropdown) existingDropdown.remove();

    // creo un contenedor para el dropdown
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'user-dropdown-container';
    dropdownContainer.style.position = 'relative';
    dropdownContainer.style.display = 'inline-block';
    btnLogin.parentNode.insertBefore(dropdownContainer, btnLogin);
    dropdownContainer.appendChild(btnLogin);

    // creo el menú dropdown
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
            cerrar sesión
        </a>
    `;
    dropdown.style.cssText = "min-width: 220px; padding: 10px;";
    dropdownContainer.appendChild(dropdown);
    if (window.Iconify?.scan) window.Iconify.scan();

    // evento para cerrar sesión
    dropdown.querySelector('#btnLogout')?.addEventListener('click', e => {
        e.preventDefault();
        if (window.AuthSystem && confirm('¿seguro que quieres cerrar sesión?')) {
            window.AuthSystem.logout();
        }
    });

    // toggle del dropdown al hacer click
    btnLogin.addEventListener('click', e => {
        e.preventDefault();
        dropdown.classList.toggle('visible');
    });

    // cierro el dropdown si hago click fuera
    document.addEventListener('click', e => {
        if (!dropdownContainer.contains(e.target)) dropdown.classList.remove('visible');
    });
}

// cargo archivos html dinámicamente en un contenedor
function loadHTML(containerId, filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error("error al cargar " + filePath);
            return response.text();
        })
        .then(data => {
            const container = document.getElementById(containerId);
            if (container) container.innerHTML = data;

            // si estoy cargando el nav, hago configuraciones extra
            if (containerId === "nav-container") {
                updateLoginIcon();

                // inicio el reloj
                reloj = document.getElementById("reloj");
                setInterval(actualizarReloj, 1000);
                actualizarReloj();

                // inicializo el carrito si existe la función
                if (typeof window.configurarEventListeners === 'function') {
                    window.configurarEventListeners();
                }

                // cargo traducciones y productos si existen las funciones
                if (window.idiomaActual && window.rutaInterfaceJson && window.cargarYMostrarProductos) {
                    loadTranslations(window.rutaInterfaceJson());
                    window.cargarYMostrarProductos();
                }
            }
        })
        .catch(err => console.error(err));
}

// actualizo el reloj con la fecha y hora actual
function actualizarReloj() {
    if (!reloj) return;
    const ahora = new Date();
    // configuración del formato de fecha
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
    // formateo según el idioma actual
    reloj.textContent = ahora.toLocaleDateString(window.idiomaActual || 'es', opciones);
}

// listener global para todos los clicks de la página
document.addEventListener("click", e => {
    // click en el botón de login
    const btnLogin = e.target.closest("#btnOpenLogin");
    if (btnLogin) {
        e.preventDefault();
        const isLoggedIn = window.AuthSystem ? window.AuthSystem.isLoggedIn() : false;
        // si no hay sesión, muestro el login
        if (!isLoggedIn) showLogin();
        return;
    }

    // click en el botón de modo oscuro
    const btnDarkMode = e.target.closest("#btn-dark-mode");
    if (btnDarkMode) {
        e.preventDefault();
        document.body.classList.toggle("dark-mode");
        return;
    }

    // manejo del menú de idioma
    const langButton = e.target.closest("#btnOpenLanguage");
    const langMenu = document.getElementById("languageMenu");
    const langOption = e.target.closest(".dropdown-menu a");

    if (langButton) {
        // toggle del menú de idioma
        e.preventDefault();
        langMenu?.classList.toggle("visible");
    } else if (langOption) {
        // selección de un idioma
        e.preventDefault();
        const lang = langOption.getAttribute('lang');
        if (lang) cambiarIdioma(lang);
        langMenu?.classList.remove("visible");
    } else if (langMenu?.classList.contains("visible") && !e.target.closest(".dropdown-menu")) {
        // cierro el menú si hago click fuera
        langMenu.classList.remove("visible");
    }
});

// cuando carga la página, cargo nav y footer
document.addEventListener("DOMContentLoaded", () => {
    loadHTML("nav-container", "nav.html");
    loadHTML("footer-container", "footer.html");
});
