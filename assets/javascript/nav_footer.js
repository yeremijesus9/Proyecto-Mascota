// aquí cargo el nav y el footer en todas las páginas para no repetir código.
if (!window.idiomaActual) window.idiomaActual = 'es';
let reloj; 

// cambio el idioma en toda la web (textos, productos y el reloj).
function cambiarIdioma(nuevoIdioma) {
    // uso la función global de idioma.js para que todo se actualice bien.
    if (typeof window.cambiarIdioma === 'function') {
        window.cambiarIdioma(nuevoIdioma);
    }
}

// expongo esta función para que otros scripts puedan forzar una traducción.
window.loadTranslations = function(filePath) {
    fetch(filePath)
        .then(response => response.json())
        .then(translations => applyTranslations(translations))
        .catch(error => console.error("error al cargar traducciones:", error));
};

// busco los elementos con data-key y les meto la traducción que toca.
function applyTranslations(translations) {
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[key]) element.innerHTML = translations[key];
    });

    document.querySelectorAll('[data-placeholder-key]').forEach(element => {
        const key = element.getAttribute('data-placeholder-key');
        if (translations[key]) element.placeholder = translations[key];
    });
}

// el login lo cargo solo cuando alguien pincha, para que la página cargue más rápido.
async function showLogin() {
    let popup = document.getElementById("dynamicLoginPopup");
    if (!popup) {
        popup = document.createElement("div");
        popup.id = "dynamicLoginPopup";
        popup.classList.add("popup-contenedor");
        document.body.appendChild(popup);
    }

    try {
        const response = await fetch("login.html");
        popup.innerHTML = await response.text();
        if (window.Iconify?.scan) Iconify.scan();
        initLoginComponent();

        const wrapper = popup.querySelector(".wrapper");
        popup.classList.add("popup-activo");
        wrapper?.classList.add("active-popup");
    } catch (error) {
        console.error("error cargando login:", error);
    }
}

// activo los clicks de los formularios una vez que se han inyectado en el html.
function initLoginComponent() {
    const wrapper = document.querySelector(".wrapper");
    if (!wrapper) return;

    const loginLink = document.querySelector(".login-link");
    const registerLink = document.querySelector(".register-link");
    const btnClose = document.getElementById("iconClose");
    const popup = document.getElementById("dynamicLoginPopup");

    registerLink?.addEventListener("click", e => {
        e.preventDefault();
        wrapper.classList.add("active");
    });

    loginLink?.addEventListener("click", e => {
        e.preventDefault();
        wrapper.classList.remove("active");
    });

    btnClose?.addEventListener("click", () => {
        wrapper.classList.remove("active-popup");
        popup.classList.remove("popup-activo");
        wrapper.classList.remove("active");
    });

    if (typeof window.initFormHandlers === 'function') window.initFormHandlers();
}

// pongo el icono de usuario si hay sesión, o el de añadir si está desconectado.
function updateLoginIcon() {
    const btnLogin = document.getElementById('btnOpenLogin');
    if (!btnLogin) return;

    const isLoggedIn = window.AuthSystem ? window.AuthSystem.isLoggedIn() : false;
    const currentUser = window.AuthSystem ? window.AuthSystem.getCurrentUser() : null;

    if (isLoggedIn && currentUser) {
        const iconSpan = btnLogin.querySelector('.iconify');
        if (iconSpan) iconSpan.setAttribute('data-icon', 'mdi:account');
        if (window.Iconify?.scan) window.Iconify.scan();
        createUserDropdown(btnLogin, currentUser);
    } else {
        const iconSpan = btnLogin.querySelector('.iconify');
        if (iconSpan) iconSpan.setAttribute('data-icon', 'mdi:user-plus');
        if (window.Iconify?.scan) window.Iconify.scan();
    }
}

// dibujo el menú pequeñito para cerrar sesión o ver mis datos.
function createUserDropdown(btnLogin, user) {
    let existingDropdown = document.getElementById('userDropdownMenu');
    if (existingDropdown) existingDropdown.remove();

    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'user-dropdown-container';
    dropdownContainer.style.position = 'relative';
    dropdownContainer.style.display = 'inline-block';
    btnLogin.parentNode.insertBefore(dropdownContainer, btnLogin);
    dropdownContainer.appendChild(btnLogin);

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

    dropdown.querySelector('#btnLogout')?.addEventListener('click', e => {
        e.preventDefault();
        if (window.AuthSystem && confirm('¿seguro que quieres cerrar sesión?')) {
            window.AuthSystem.logout();
        }
    });

    btnLogin.addEventListener('click', e => {
        e.preventDefault();
        dropdown.classList.toggle('visible');
    });

    document.addEventListener('click', e => {
        if (!dropdownContainer.contains(e.target)) dropdown.classList.remove('visible');
    });
}

// traigo el html del nav o del footer y arranco el reloj y la sesión al terminar.
function loadHTML(containerId, filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error("error al cargar " + filePath);
            return response.text();
        })
        .then(data => {
            const container = document.getElementById(containerId);
            if (container) container.innerHTML = data;

            if (containerId === "nav-container") {
                updateLoginIcon();
                reloj = document.getElementById("reloj");
                setInterval(actualizarReloj, 1000);
                actualizarReloj();

                if (typeof window.configurarEventListeners === 'function') {
                    window.configurarEventListeners();
                }

                if (window.idiomaActual && window.rutaInterfaceJson) {
                    window.loadTranslations(window.rutaInterfaceJson());
                }
            }
        })
        .catch(err => console.error(err));
}

function actualizarReloj() {
    if (!reloj) return;
    const ahora = new Date();
    const opciones = {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    };
    reloj.textContent = ahora.toLocaleDateString(window.idiomaActual || 'es', opciones);
}

// meto todos los clicks importantes aquí (login, modo oscuro, idioma).
document.addEventListener("click", e => {
    const btnLogin = e.target.closest("#btnOpenLogin");
    if (btnLogin) {
        e.preventDefault();
        const isLoggedIn = window.AuthSystem ? window.AuthSystem.isLoggedIn() : false;
        if (!isLoggedIn) showLogin();
        return;
    }

    const btnDarkMode = e.target.closest("#btn-dark-mode");
    if (btnDarkMode) {
        e.preventDefault();
        document.body.classList.toggle("dark-mode");
        return;
    }

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

// escucho cuando alguien pulsa enter en el buscador para llevarle a los resultados.
document.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        const inputBusqueda = e.target.closest(".input-busqueda");
        if (inputBusqueda && inputBusqueda.value.trim() !== "") {
            window.location.href = `productos.html?search=${encodeURIComponent(inputBusqueda.value.trim())}`;
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    loadHTML("nav-container", "nav.html");
    loadHTML("footer-container", "footer.html");
});
