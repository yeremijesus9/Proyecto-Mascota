/* SISTEMA DE AUTENTICACIÓN (Simplificado) */

const SistemaAuth = {
    // 1. Obtener lista de usuarios guardados
    obtenerUsuarios: function () {
        const usuarios = localStorage.getItem('usuarios_tienda');
        return usuarios ? JSON.parse(usuarios) : [];
    },

    // 2. Registrar un nuevo usuario
    registrar: function (usuario, email, clave) {
        const usuarios = this.obtenerUsuarios();

        // Comprobar si el correo ya existe
        const existe = usuarios.find(u => u.email === email);
        if (existe) {
            return { exito: false, mensaje: 'El correo ya está registrado' };
        }

        // Crear y guardar el nuevo usuario
        const nuevoUsuario = {
            id: Date.now(),
            username: usuario, // "username" para compatibilidad con nav
            email: email,
            clave: clave
        };

        usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios_tienda', JSON.stringify(usuarios));

        return { exito: true, mensaje: '¡Registro exitoso! Iniciando sesión...' };
    },

    // 3. Iniciar sesión (Login)
    login: function (email, clave) {
        const usuarios = this.obtenerUsuarios();

        // Buscar usuario que coincida
        const usuarioEncontrado = usuarios.find(u => u.email === email && u.clave === clave);

        if (usuarioEncontrado) {
            // Guardar al usuario en "sesión activa"
            localStorage.setItem('usuario_activo', JSON.stringify(usuarioEncontrado));
            return { exito: true, mensaje: 'Bienvenido a Miwuff' };
        }

        return { exito: false, mensaje: 'Correo o contraseña incorrectos' };
    },

    // 4. Cerrar sesión
    logout: function () {
        localStorage.removeItem('usuario_activo');
        location.reload();
    },

    // 5. Verificar si hay alguien conectado
    estaConectado: function () {
        return localStorage.getItem('usuario_activo') !== null;
    },

    // 6. Obtener datos del usuario conectado
    obtenerUsuarioActual: function () {
        return JSON.parse(localStorage.getItem('usuario_activo'));
    }
};

/* Manejo de Formularios */

function iniciarGestorFormularios() {
    // Referencias a elementos del HTML
    const contenedor = document.querySelector('.wrapper');
    const linkRegistro = document.querySelector('.register-link');
    const linkLogin = document.querySelector('.login-link');
    const botonCerrar = document.getElementById('iconClose');

    // -- Animación de cambio entre Login y Registro --
    if (linkRegistro && contenedor) {
        linkRegistro.addEventListener('click', (e) => {
            e.preventDefault();
            contenedor.classList.add('active'); // Muestra el panel de registro
        });
    }

    if (linkLogin && contenedor) {
        linkLogin.addEventListener('click', (e) => {
            e.preventDefault();
            contenedor.classList.remove('active'); // Vuelve al panel de login
        });
    }

    // -- Botón Cerrar (X) --
    if (botonCerrar && contenedor) {
        botonCerrar.addEventListener('click', () => {
            contenedor.classList.remove('active-popup');

            // Si el login se abrió como popup dinámico, ciérralo también
            const popupDinamico = document.getElementById('dynamicLoginPopup');
            if (popupDinamico) popupDinamico.classList.remove('popup-activo');
        });
    }

    // -- Proceso de REGISTRO --
    const formRegistro = document.getElementById('registerForm');
    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();

            // Obtener valores
            const usuario = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const clave = document.getElementById('registerPassword').value;
            const aceptaTerminos = document.getElementById('acceptTerms').checked;

            if (!aceptaTerminos) {
                alert('Por favor, acepta los términos y condiciones');
                return;
            }

            // Intentar registrar
            const resultado = SistemaAuth.registrar(usuario, email, clave);
            alert(resultado.mensaje);

            if (resultado.exito) {
                formRegistro.reset();
                contenedor.classList.remove('active'); // Cambiar visualmente al login
            }
        });
    }

    // -- Proceso de LOGIN --
    const formLogin = document.getElementById('loginForm');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const clave = document.getElementById('loginPassword').value;

            const resultado = SistemaAuth.login(email, clave);
            alert(resultado.mensaje);

            if (resultado.exito) {
                // Cerrar todo y recargar para actualizar el icono del nav
                if (contenedor) contenedor.classList.remove('active-popup');
                const popupDinamico = document.getElementById('dynamicLoginPopup');
                if (popupDinamico) popupDinamico.classList.remove('popup-activo');

                setTimeout(() => location.reload(), 500);
            }
        });
    }
}

// Iniciar lógica al cargar la página
document.addEventListener('DOMContentLoaded', iniciarGestorFormularios);

/* cambio de nombres de variables para que funcione con el nav y footer */

window.AuthSystem = {
    isLoggedIn: SistemaAuth.estaConectado,
    getCurrentUser: SistemaAuth.obtenerUsuarioActual,
    logout: SistemaAuth.logout
};

window.initFormHandlers = iniciarGestorFormularios;