// ============================================
// SISTEMA DE AUTENTICACIÓN CON LOCAL STORAGE
// ============================================

/**
 * Funciones de gestión de usuarios en localStorage
 */
const AuthSystem = {
    // Obtener todos los usuarios registrados
    getUsers: function () {
        const users = localStorage.getItem('miwuff_users');
        return users ? JSON.parse(users) : [];
    },

    // Guardar usuarios en localStorage
    saveUsers: function (users) {
        localStorage.setItem('miwuff_users', JSON.stringify(users));
    },

    // Registrar un nuevo usuario
    register: function (username, email, password) {
        const users = this.getUsers();

        // Verificar si el email ya existe
        if (users.some(user => user.email === email)) {
            return { success: false, message: '❌ Este correo electrónico ya está registrado' };
        }

        // Crear nuevo usuario
        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            password: password, // En producción, deberías encriptar la contraseña
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);

        return { success: true, message: '✅ ¡Registro exitoso! Ya puedes iniciar sesión', user: newUser };
    },

    // Iniciar sesión
    login: function (email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Guardar sesión activa
            localStorage.setItem('miwuff_current_user', JSON.stringify(user));
            return { success: true, message: '✅ ¡Bienvenido de nuevo!', user: user };
        }

        return { success: false, message: '❌ Correo o contraseña incorrectos' };
    },

    // Cerrar sesión
    logout: function () {
        localStorage.removeItem('miwuff_current_user');
        window.location.reload(); // Recargar la página
    },

    // Obtener usuario actual logueado
    getCurrentUser: function () {
        const user = localStorage.getItem('miwuff_current_user');
        return user ? JSON.parse(user) : null;
    },

    // Verificar si hay un usuario logueado
    isLoggedIn: function () {
        return this.getCurrentUser() !== null;
    }
};

// ============================================
// MANEJO DE FORMULARIOS
// ============================================

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function () {
    initFormHandlers();
});

function initFormHandlers() {
    const wrapper = document.querySelector('.wrapper');
    const loginLink = document.querySelector('.login-link');
    const registerLink = document.querySelector('.register-link');
    const btnPopUp = document.getElementById('btnPopUp');
    const iconClose = document.getElementById('iconClose');

    // Toggle entre login y registro
    if (registerLink) {
        registerLink.addEventListener('click', function (e) {
            e.preventDefault();
            wrapper?.classList.add('active');
        });
    }

    if (loginLink) {
        loginLink.addEventListener('click', function (e) {
            e.preventDefault();
            wrapper?.classList.remove('active');
        });
    }

    // Abrir popup de login
    if (btnPopUp) {
        btnPopUp.addEventListener('click', function () {
            wrapper?.classList.add('active-popup');
        });
    }

    // Cerrar el wrapper
    if (wrapper) {
        wrapper.addEventListener('click', function (e) {
            if (e.target.closest('.icon-close')) {
                wrapper.classList.remove('active-popup');
                wrapper.classList.remove('active');
            }
        });
    }

    // Manejar formulario de REGISTRO
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('registerUsername').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const acceptTerms = document.getElementById('acceptTerms').checked;

            if (!acceptTerms) {
                showMessage('❌ Debes aceptar los términos y condiciones', 'error');
                return;
            }

            if (username.length < 3) {
                showMessage('❌ El nombre de usuario debe tener al menos 3 caracteres', 'error');
                return;
            }

            if (password.length < 6) {
                showMessage('❌ La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }

            const result = AuthSystem.register(username, email, password);

            if (result.success) {
                showMessage(result.message, 'success');
                registerForm.reset();

                // Cambiar al formulario de login después de 1.5 segundos
                setTimeout(() => {
                    wrapper?.classList.remove('active');
                }, 1500);
            } else {
                showMessage(result.message, 'error');
            }
        });
    }

    // Manejar formulario de LOGIN
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            const result = AuthSystem.login(email, password);

            if (result.success) {
                showMessage(result.message, 'success');
                loginForm.reset();

                // Cerrar el popup y recargar después de 1 segundo
                setTimeout(() => {
                    wrapper?.classList.remove('active-popup');

                    // Si estamos en un popup dinámico, también cerrar el popup
                    const popup = document.getElementById('dynamicLoginPopup');
                    if (popup) {
                        popup.classList.remove('popup-activo');
                    }

                    // Recargar para actualizar el icono del navbar
                    window.location.reload();
                }, 1000);
            } else {
                showMessage(result.message, 'error');
            }
        });
    }
}

// ============================================
// FUNCIÓN PARA MOSTRAR MENSAJES
// ============================================
function showMessage(message, type = 'info') {
    // Eliminar mensajes anteriores
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message auth-message-${type}`;
    messageDiv.textContent = message;

    // Estilos inline para el mensaje
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 30px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 8px;
        font-weight: bold;
        z-index: 100000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease-out;
    `;

    document.body.appendChild(messageDiv);

    // Eliminar mensaje después de 3 segundos
    setTimeout(() => {
        messageDiv.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Agregar estilos de animación
if (!document.getElementById('auth-animations')) {
    const style = document.createElement('style');
    style.id = 'auth-animations';
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        @keyframes slideUp {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================
window.AuthSystem = AuthSystem;
window.initFormHandlers = initFormHandlers;
