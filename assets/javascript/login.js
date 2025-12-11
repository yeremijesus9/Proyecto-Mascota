
const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopUp = document.getElementById('btnPopUp');
const iconClose = document.getElementById('iconClose');

registerLink.addEventListener('click', function () {
    wrapper.classList.add('active');
});

loginLink.addEventListener('click', function () {
    wrapper.classList.remove('active');
});


btnPopUp.addEventListener('click', function () {
    wrapper.classList.add('active-popup');
});

// Cerrar el wrapper al hacer clic en el icono de cerrar
wrapper.addEventListener('click', function (e) {
    if (e.target.closest('.icon-close')) {
        wrapper.classList.remove('active-popup');
        wrapper.classList.remove('active');
    }
});
