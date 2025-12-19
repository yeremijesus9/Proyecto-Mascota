
// efecto parallax del logo en la portada
function iniciarEfectoPortada() {
    const miwuffLogo = document.getElementById('miwuff-logo');

    if (!miwuffLogo) return;

    let procesando = false;
    function actualizarPortada() {
        // desactivo el efecto en móviles y tablets para que no se vea raro
        if (window.innerWidth <= 820) {
            miwuffLogo.style.marginTop = '0px';
            procesando = false;
            return;
        }

        // obtengo cuánto ha hecho scroll el usuario
        const valorScroll = window.scrollY;

        // muevo el logo según el scroll, multiplico por 0.55 para que no sea tan rápido
        miwuffLogo.style.marginTop = `${valorScroll * 0.55}px`;

        procesando = false;
    }

    // escucho el evento scroll y actualizo el logo
    window.addEventListener('scroll', () => {
        if (!procesando) {
            window.requestAnimationFrame(actualizarPortada);
            procesando = true;
        }
    });
}

// cuando carga la página ejecuto todo esto
document.addEventListener('DOMContentLoaded', () => {
    // inicio el efecto parallax de la portada
    iniciarEfectoPortada();

    // cargo productos si existe esa función (viene de home.js)
    if (typeof window.cargarYMostrarProductos === 'function') {
        window.cargarYMostrarProductos();
    }

    // configuración del popup de oferta
    const popup = document.getElementById("popup-oferta");
    const btnCerrar = document.getElementById("popup-cerrar");

    if (popup && btnCerrar) {
        // el popup aparece inmediatamente al cargar
        popup.classList.add("activo");

        // se cierra automáticamente después de 7 segundos
        setTimeout(() => {
            popup.classList.remove("activo");
        }, 7000);

        // también se puede cerrar manualmente con la X
        btnCerrar.addEventListener("click", () => {
            popup.classList.remove("activo");
        });
    }
});