// sistema de autenticación - login y registro de usuarios

const SistemaAuth = {
    // obtengo la lista de todos los usuarios guardados en localstorage
    obtenerUsuarios: function () {
        const usuarios = localStorage.getItem('usuarios_tienda');
        return usuarios ? JSON.parse(usuarios) : [];
    },

    // registro un nuevo usuario
    registrar: function (usuario, email, clave) {
        const usuarios = this.obtenerUsuarios();

        // compruebo si el correo ya está registrado
        const existe = usuarios.find(u => u.email === email);
        if (existe) {
            return { exito: false, mensaje: 'el correo ya está registrado' };
        }

        // creo el objeto del nuevo usuario
        const nuevoUsuario = {
            id: Date.now(), // uso timestamp como id único
            username: usuario, // uso "username" para que funcione con nav
            email: email,
            clave: clave
        };

        // lo añado a la lista y guardo en localstorage
        usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios_tienda', JSON.stringify(usuarios));

        return { exito: true, mensaje: '¡registro exitoso! iniciando sesión...' };
    },

    // inicio sesión con email y contraseña
    login: function (email, clave) {
        const usuarios = this.obtenerUsuarios();

        // busco un usuario que coincida con el email y contraseña
        const usuarioEncontrado = usuarios.find(u => u.email === email && u.clave === clave);

        if (usuarioEncontrado) {
            // si lo encuentro, lo guardo como "usuario activo"
            localStorage.setItem('usuario_activo', JSON.stringify(usuarioEncontrado));
            return { exito: true, mensaje: 'bienvenido a miwuff' };
        }

        return { exito: false, mensaje: 'correo o contraseña incorrectos' };
    },

    // cierro sesión eliminando el usuario activo
    logout: function () {
        localStorage.removeItem('usuario_activo');
        location.reload(); // recargo la página para actualizar la interfaz
    },

    // verifico si hay alguien con sesión iniciada
    estaConectado: function () {
        return localStorage.getItem('usuario_activo') !== null;
    },

    // obtengo los datos del usuario que está conectado actualmente
    obtenerUsuarioActual: function () {
        return JSON.parse(localStorage.getItem('usuario_activo'));
    }
};

// manejo de los formularios de login y registro
function iniciarGestorFormularios() {
    // obtengo referencias a los elementos del html
    const contenedor = document.querySelector('.wrapper');
    const linkRegistro = document.querySelector('.register-link');
    const linkLogin = document.querySelector('.login-link');
    const botonCerrar = document.getElementById('iconClose');

    // cambio entre el panel de login y registro
    if (linkRegistro && contenedor) {
        linkRegistro.addEventListener('click', (e) => {
            e.preventDefault();
            contenedor.classList.add('active'); // muestro el panel de registro
        });
    }

    if (linkLogin && contenedor) {
        linkLogin.addEventListener('click', (e) => {
            e.preventDefault();
            contenedor.classList.remove('active'); // vuelvo al panel de login
        });
    }

    // botón para cerrar el popup
    if (botonCerrar && contenedor) {
        botonCerrar.addEventListener('click', () => {
            contenedor.classList.remove('active-popup');

            // si es un popup dinámico también lo cierro
            const popupDinamico = document.getElementById('dynamicLoginPopup');
            if (popupDinamico) popupDinamico.classList.remove('popup-activo');
        });
    }

    // proceso del formulario de registro
    const formRegistro = document.getElementById('registerForm');
    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();

            // obtengo los valores del formulario
            const usuario = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const clave = document.getElementById('registerPassword').value;
            const aceptaTerminos = document.getElementById('acceptTerms').checked;

            // valido que acepte los términos
            if (!aceptaTerminos) {
                alert('por favor, acepta los términos y condiciones');
                return;
            }

            // intento registrar al usuario
            const resultado = SistemaAuth.registrar(usuario, email, clave);
            alert(resultado.mensaje);

            // si el registro fue exitoso, vuelvo al panel de login
            if (resultado.exito) {
                formRegistro.reset();
                contenedor.classList.remove('active');
            }
        });
    }

    // proceso del formulario de login
    const formLogin = document.getElementById('loginForm');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();

            // obtengo email y contraseña
            const email = document.getElementById('loginEmail').value;
            const clave = document.getElementById('loginPassword').value;

            // intento iniciar sesión
            const resultado = SistemaAuth.login(email, clave);
            alert(resultado.mensaje);

            // si el login fue exitoso, cierro todo y recargo la página
            if (resultado.exito) {
                if (contenedor) contenedor.classList.remove('active-popup');
                const popupDinamico = document.getElementById('dynamicLoginPopup');
                if (popupDinamico) popupDinamico.classList.remove('popup-activo');

                // espero medio segundo antes de recargar
                setTimeout(() => location.reload(), 500);
            }
        });
    }
}

// inicio toda la lógica cuando carga la página
document.addEventListener('DOMContentLoaded', iniciarGestorFormularios);

// expongo las funciones con nombres en inglés para que funcionen con nav y footer
window.AuthSystem = {
    isLoggedIn: SistemaAuth.estaConectado,
    getCurrentUser: SistemaAuth.obtenerUsuarioActual,
    logout: SistemaAuth.logout
};

window.initFormHandlers = iniciarGestorFormularios;
