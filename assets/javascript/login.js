// aquí guardo y busco los usuarios con localstorage.
const SistemaAuth = {
    // saco la lista de cuentas que ya se han registrado.
    obtenerUsuarios: function () {
        const usuarios = localStorage.getItem('usuarios_tienda');
        return usuarios ? JSON.parse(usuarios) : [];
    },

    // registro una cuenta nueva si el correo no está ya en la lista.
    registrar: function (usuario, email, clave) {
        const usuarios = this.obtenerUsuarios();
        const existe = usuarios.find(u => u.email === email);
        if (existe) {
            return { exito: false, mensaje: 'el correo ya está registrado' };
        }

        const nuevoUsuario = {
            id: Date.now(),
            username: usuario,
            email: email,
            clave: clave
        };

        usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios_tienda', JSON.stringify(usuarios));
        return { exito: true, mensaje: '¡registro exitoso! iniciando sesión...' };
    },

    // miro si la clave coincide y pongo al usuario como "activo".
    login: function (email, clave) {
        const usuarios = this.obtenerUsuarios();
        const usuarioEncontrado = usuarios.find(u => u.email === email && u.clave === clave);

        if (usuarioEncontrado) {
            localStorage.setItem('usuario_activo', JSON.stringify(usuarioEncontrado));
            return { exito: true, mensaje: 'bienvenido a miwuff' };
        }
        return { exito: false, mensaje: 'correo o contraseña incorrectos' };
    },

    logout: function () {
        localStorage.removeItem('usuario_activo');
        location.reload();
    },

    estaConectado: function () {
        return localStorage.getItem('usuario_activo') !== null;
    },

    obtenerUsuarioActual: function () {
        return JSON.parse(localStorage.getItem('usuario_activo'));
    }
};

// controlo cómo se ven los formularios y el cierre del popup.
function iniciarGestorFormularios() {
    const contenedor = document.querySelector('.wrapper');
    const linkRegistro = document.querySelector('.register-link');
    const linkLogin = document.querySelector('.login-link');
    const botonCerrar = document.getElementById('iconClose');

    // muevo el formulario con css usando la clase 'active'.
    if (linkRegistro && contenedor) {
        linkRegistro.addEventListener('click', (e) => {
            e.preventDefault();
            contenedor.classList.add('active');
        });
    }

    if (linkLogin && contenedor) {
        linkLogin.addEventListener('click', (e) => {
            e.preventDefault();
            contenedor.classList.remove('active');
        });
    }

    // quito el popup del medio al dar a la x.
    if (botonCerrar && contenedor) {
        botonCerrar.addEventListener('click', () => {
            contenedor.classList.remove('active-popup');
            const popupDinamico = document.getElementById('dynamicLoginPopup');
            if (popupDinamico) popupDinamico.classList.remove('popup-activo');
        });
    }

    // envío los datos de registro.
    const formRegistro = document.getElementById('registerForm');
    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();
            const usuario = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const clave = document.getElementById('registerPassword').value;
            const aceptaTerminos = document.getElementById('acceptTerms').checked;

            if (!aceptaTerminos) {
                alert('por favor, acepta los términos y condiciones');
                return;
            }

            const resultado = SistemaAuth.registrar(usuario, email, clave);
            alert(resultado.mensaje);

            if (resultado.exito) {
                formRegistro.reset();
                contenedor.classList.remove('active');
            }
        });
    }

    // compruebo el login y recargo si todo va bien.
    const formLogin = document.getElementById('loginForm');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const clave = document.getElementById('loginPassword').value;

            const resultado = SistemaAuth.login(email, clave);
            alert(resultado.mensaje);

            if (resultado.exito) {
                if (contenedor) contenedor.classList.remove('active-popup');
                const popupDinamico = document.getElementById('dynamicLoginPopup');
                if (popupDinamico) popupDinamico.classList.remove('popup-activo');

                setTimeout(() => location.reload(), 500);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', iniciarGestorFormularios);

// dejo estas funciones visibles para que el nav y el footer sepan si hay alguien dentro.
window.AuthSystem = {
    isLoggedIn: SistemaAuth.estaConectado,
    getCurrentUser: SistemaAuth.obtenerUsuarioActual,
    logout: SistemaAuth.logout
};

window.initFormHandlers = iniciarGestorFormularios;
