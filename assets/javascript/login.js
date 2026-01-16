/* 
   =============================================================================
   FLUJO DE AUTENTICACION Y USUARIO
   =============================================================================
   Este archivo está ordenado siguiendo los pasos que realiza el usuario:
   
   PASO 1: El usuario hace clic en el icono de "Iniciar Sesión".
   PASO 2: Se abre la ventana modal (popup).
   PASO 3: El usuario interactúa (Login o Registro) y enviamos el formulario.
   PASO 4: El sistema valida o guarda los datos.
   PASO 5: Si todo es correcto, actualizamos la interfaz (Icono y Menú).
*/


// =============================================================================
// PASO 1: INICIALIZACION (ESCUCHAR EL CLIC DEL USUARIO)
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {

    // Escuchamos los clics en toda la página
    document.body.addEventListener('click', (evento) => {

        // Buscamos si el clic fue en el botón de login (#btnOpenLogin)
        const btnLogin = evento.target.closest('#btnOpenLogin');

        // Si clickeó en el botón Y NO hay nadie conectado...
        if (btnLogin && !obtenerUsuarioActivo()) {
            evento.preventDefault(); // Evitamos que recargue la página

            // -> PASAMOS AL PASO 2: ABRIR LA VENTANA
            abrirModalLogin();
        }
    });

    // Nota: Si ya hay usuario al cargar, el nav_footer.js nos avisará para pintar el icono correcto
});


// =============================================================================
// PASO 2: ABRIR VENTANA MODAL (VISUAL)
// =============================================================================

async function abrirModalLogin() {

    // 1️ Buscar si el contenedor del modal ya existe
    let contenedorModal = document.getElementById("dynamicLoginPopup");

    // 2️ Si no existe, lo creamos una sola vez
    if (!contenedorModal) {
        contenedorModal = document.createElement("div");
        contenedorModal.id = "dynamicLoginPopup";
        contenedorModal.className = "popup-contenedor";
        document.body.appendChild(contenedorModal);
    }

    try {
        // 3️ Cargar el HTML del login de forma asíncrona
        const respuesta = await fetch("login.html");

        // Si el archivo no se pudo cargar, lanzamos error
        if (!respuesta.ok) {
            throw new Error("No se pudo cargar login.html");
        }

        // 4️ Convertimos la respuesta en texto HTML
        const htmlLogin = await respuesta.text();

        // 5️ Insertamos el HTML dentro del modal
        contenedorModal.innerHTML = htmlLogin;

        // 6️ Hacemos visible el modal
        contenedorModal.classList.add("popup-activo");

        // 7️ Activamos la animación del formulario
        const cajaFormulario = contenedorModal.querySelector(".wrapper");
        if (cajaFormulario) {
            cajaFormulario.classList.add("active-popup");
        }

        // 8️ Re-escanear iconos (IMPORTANTE para que aparezca la X de cerrar)
        if (window.Iconify && window.Iconify.scan) window.Iconify.scan();

        // 9️ Activamos los eventos del modal (login, registro, cerrar)
        configurarEventosDelModal(contenedorModal);

    } catch (error) {
        console.error("Error al abrir el modal de login:", error);
    }
}


function cerrarModalLogin() {
    const popup = document.getElementById("dynamicLoginPopup");
    if (popup) {
        popup.classList.remove("popup-activo");
        const wrapper = popup.querySelector(".wrapper");
        if (wrapper) wrapper.classList.remove("active-popup");

        // Esperamos a que termine la animación visual antes de borrar el HTML
        setTimeout(() => {
            popup.innerHTML = "";
        }, 500);
    }
}


// =============================================================================
// PASO 3: INTERACCION DEL USUARIO (FORMULARIOS Y BOTONES)
// =============================================================================

function configurarEventosDelModal(popup) {
    // Referencias a elementos visuales dentro del modal
    const wrapper = popup.querySelector(".wrapper");
    const linkRegistro = popup.querySelector(".register-link"); // Botón "Registrarse"
    const linkLogin = popup.querySelector(".login-link");       // Botón "Iniciar Sesión"
    const botonCerrar = popup.querySelector("#iconClose");      // La 'X' de cerrar

    const formLogin = popup.querySelector("#loginForm");
    const formRegistro = popup.querySelector("#registerForm");

    // -- Cambio de vistas (Login <-> Registro) --
    if (linkRegistro) {
        linkRegistro.addEventListener("click", (e) => {
            e.preventDefault();
            wrapper.classList.add("active"); // Muestra panel de Registro
        });
    }

    if (linkLogin) {
        linkLogin.addEventListener("click", (e) => {
            e.preventDefault();
            wrapper.classList.remove("active"); // Vuelve al panel de Login
        });
    }

    // -- BOTON DE CERRAR ESTATICO O DINAMICO --
    // Intentamos asignar el evento a cualquier elemento que sea el botón de cerrar
    // (el span con id="iconClose" o un posible svg generado por Iconify)
    if (botonCerrar) {
        botonCerrar.addEventListener("click", () => {
            cerrarModalLogin();
        });
    }

    // También escuchamos clics en el propio contenedor negro para cerrar si se pulsa fuera
    popup.addEventListener("click", (e) => {
        if (e.target === popup) {
            cerrarModalLogin();
        }
    });

    // -- ENVIO DE FORMULARIO: LOGIN --
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = popup.querySelector("#loginEmail").value;
            const password = popup.querySelector("#loginPassword").value;

            // -> PASAMOS AL PASO 4: VALIDAR DATOS
            const usuario = verificarCredenciales(email, password);

            if (usuario) {
                // -> SI ES CORRECTO: PASAMOS AL FINAL (LOGIN EXITOSO)
                iniciarSesionUsuario(usuario);
            } else {
                alert("Correo o contraseña incorrectos.");
            }
        });
    }

    // -- ENVIO DE FORMULARIO: REGISTRO --
    if (formRegistro) {
        formRegistro.addEventListener("submit", (e) => {
            e.preventDefault();

            // Recogemos todos los datos (el ID y el ROL se gestionan en guardarNuevoUsuario)
            const datosNuevoUsuario = {
                username: popup.querySelector("#registerUsername").value,
                email: popup.querySelector("#registerEmail").value,
                clave: popup.querySelector("#registerPassword").value
            };
            const aceptaTerminos = popup.querySelector("#acceptTerms").checked;

            if (!aceptaTerminos) {
                alert("Debes aceptar los términos.");
                return;
            }

            // -> PASAMOS AL PASO 4: GUARDAR DATOS
            const listaUsuarios = obtenerTodosLosUsuarios();
            const existe = listaUsuarios.some(u => u.email === datosNuevoUsuario.email);

            if (existe) {
                alert("Este correo ya está registrado.");
            } else {
                guardarNuevoUsuario(datosNuevoUsuario);
                alert("¡Registro exitoso! Iniciando sesión...");

                // Redirigimos al usuario para que inicie sesión o lo logueamos directamente
                formRegistro.reset();
                wrapper.classList.remove("active"); // Volver a vista login
            }
        });
    }
}


// =============================================================================
// PASO 4: LOGICA DE DATOS (EL "CEREBRO" DEL SISTEMA)
// =============================================================================

const CLAVE_USUARIOS = 'sistema_usuarios_registrados';
const CLAVE_SESION = 'sistema_usuario_activo';

function obtenerTodosLosUsuarios() {
    const datos = localStorage.getItem(CLAVE_USUARIOS);
    let usuarios = datos ? JSON.parse(datos) : [];

    // Si la lista está vacía, definimos al administrador (ID 1)
    if (usuarios.length === 0) {
        usuarios.push({
            id: 1,
            username: 'admin',
            email: 'admin@miwuff.com',
            clave: 'admin123',
            rol: 'admin'
        });
        localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    }
    return usuarios;
}

function guardarNuevoUsuario(usuario) {
    const lista = obtenerTodosLosUsuarios();

    // El admin siempre es ID 1. Buscamos el ID más alto para seguir la secuencia.
    const maxId = lista.reduce((max, u) => (u.id > max ? u.id : max), 1);

    usuario.id = maxId + 1; // Los demás usuarios del 2 en adelante
    usuario.rol = 'cliente'; // Todo usuario nuevo es cliente

    lista.push(usuario);
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista));
}

function verificarCredenciales(email, password) {
    const lista = obtenerTodosLosUsuarios();
    // Buscamos coincidencia exacta de email Y contraseña
    return lista.find(u => u.email === email && u.clave === password) || null;
}

function iniciarSesionUsuario(usuario) {
    // Guardamos al usuario en la sesión activa
    localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
    alert(`¡Bienvenido, ${usuario.username}!`);

    cerrarModalLogin();

    // -> PASAMOS AL PASO 5: ACTUALIZAR LA PAGINA
    actualizarIconoUsuario();
    location.reload();
}

function cerrarSesionUsuario() {
    if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem(CLAVE_SESION); // Borramos la sesión
        location.reload(); // Recargamos para limpiar todo
    }
}

function obtenerUsuarioActivo() {
    const sesion = localStorage.getItem(CLAVE_SESION);
    return sesion ? JSON.parse(sesion) : null;
}


// =============================================================================
// PASO 5: ACTUALIZAR INTERFAZ (MOSTRAR MENU DE USUARIO)
// =============================================================================

function actualizarIconoUsuario() {
    const btnLogin = document.getElementById('btnOpenLogin');
    if (!btnLogin) return;

    // Aseguramos que el icono sea siempre el de "Usuario"
    const iconSpan = btnLogin.querySelector('.iconify');
    if (iconSpan) iconSpan.setAttribute('data-icon', 'mdi:account');

    // Comprobamos si hay sesión
    const usuario = obtenerUsuarioActivo();

    // SI EL USUARIO ESTA CONECTADO -> CREAMOS EL MENU DESPLEGABLE
    if (usuario) {
        // --- NUEVO: Botón de Panel Admin si es admin ---
        if (usuario.rol === 'admin') {
            const btnAdmin = document.createElement('a');
            btnAdmin.href = 'panel_del_admin.html';
            btnAdmin.id = 'btnAdminPanel';
            btnAdmin.className = 'admin-panel-link';
            btnAdmin.innerHTML = '<span class="iconify" data-icon="mdi:view-dashboard"></span>';
            btnAdmin.style.cssText = 'margin-right: 15px; display: inline-flex; align-items: center;';

            // Lo insertamos justo antes del botón de login (o su futuro contenedor)
            btnLogin.parentNode.insertBefore(btnAdmin, btnLogin);
        }

        // Creamos contenedor para agrupar
        const contenedor = document.createElement('div');
        contenedor.className = 'user-dropdown-container';
        contenedor.style.cssText = 'position: relative; display: inline-block;';

        btnLogin.parentNode.insertBefore(contenedor, btnLogin);
        contenedor.appendChild(btnLogin); // Metemos el botón dentro

        // Creamos el menú HTML
        const menu = document.createElement('div');
        menu.id = 'userDropdownMenu';
        menu.className = 'dropdown-menu user-dropdown';
        menu.innerHTML = `
            <div class="user-info">
                <strong>${usuario.username}</strong> <span class="badge-rol">${usuario.rol}</span><br>
                <small>${usuario.email}</small>
            </div>
            <hr>
            <a href="#" id="botonCerrarSesion">Cerrar Sesión</a>
        `;
        contenedor.appendChild(menu);

        // Re-escaneo de Iconify para el nuevo icono
        if (window.Iconify && window.Iconify.scan) window.Iconify.scan();

        // Evento Cerrar Sesión
        menu.querySelector('#botonCerrarSesion').addEventListener('click', (e) => {
            e.preventDefault();
            cerrarSesionUsuario();
        });

        // Evento Mostrar/Ocultar Menú
        btnLogin.onclick = (e) => {
            e.preventDefault();
            menu.classList.toggle('visible');
        };
    }
}

// Conexión externa para nav_footer.js
window.inicializarInterfazLogin = function () {
    actualizarIconoUsuario();
};
