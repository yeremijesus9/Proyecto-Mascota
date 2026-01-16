// aquí meto el efecto de la portada y el popup de ofertas.
function iniciarEfectoPortada() {
    const miwuffLogo = document.getElementById('miwuff-logo');
    if (!miwuffLogo) return;

    let procesando = false;
    function actualizarPortada() {
        // el movimiento lo quito en móviles para que no vaya a saltos.
        if (window.innerWidth <= 820) {
            miwuffLogo.style.marginTop = '0px';
            procesando = false;
            return;
        }

        // muevo el logo un pelo más despacio que el scroll para que parezca que tiene fondo.
        const valorScroll = window.scrollY;
        miwuffLogo.style.marginTop = `${valorScroll * 0.55}px`;

        procesando = false;
    }

    window.addEventListener('scroll', () => {
        if (!procesando) {
            window.requestAnimationFrame(actualizarPortada);
            procesando = true;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarEfectoPortada();

    // si home.js está cargado, arranco la muestra de productos.
    if (typeof window.cargarYMostrarProductos === 'function') {
        window.cargarYMostrarProductos();
    }

    // el popup de ofertas que sale nada más entrar a la web.
    const popup = document.getElementById("popup-oferta");
    const btnCerrar = document.getElementById("popup-cerrar");

    if (popup && btnCerrar) {
        // Verificar si el usuario ya cerró el popup anteriormente
        if (localStorage.getItem("popupOfertaCerrado") === "true") {
            popup.style.display = "none"; // Asegurarnos de que no sea visible
            return;
        }

        popup.classList.add("activo");

        // que se quite solo a los 7 segundos si el usuario no hace nada.
        setTimeout(() => {
            popup.classList.remove("activo");
        }, 7000);

        btnCerrar.addEventListener("click", () => {
            popup.classList.remove("activo");
            // Guardar en localStorage que el usuario ya cerró el popup
            localStorage.setItem("popupOfertaCerrado", "true");
        });
    }
});