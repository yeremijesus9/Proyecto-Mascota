
function iniciarEfectoPortada() {
    const miwuffLogo = document.getElementById('miwuff-logo');

    if (!miwuffLogo) return;

    let procesando = false;
    

       function actualizarPortada() {
        // Desactivar efecto en móvil/tablet
        if (window.innerWidth <= 820) {
            miwuffLogo.style.marginTop = '0px';
            procesando = false;
            return;
        }
    }
    function actualizarPortada() {
        // Desactivar efecto en móvil/tablet
        if (window.innerWidth <= 820) {
            miwuffLogo.style.marginTop = '0px';
            procesando = false;
            return;
        }

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
<<<<<<< HEAD
 
=======
>>>>>>> home
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarEfectoPortada();


    if (typeof window.cargarYMostrarProductos === 'function') {
        window.cargarYMostrarProductos();
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const popup = document.getElementById("popup-oferta");
    const btnCerrar = document.getElementById("popup-cerrar");

    // Aparece de inmediato
    popup.classList.add("activo");

    // Se cierra automáticamente después de 7 segundos
    setTimeout(() => {
        popup.classList.remove("activo");
    }, 7000);

    // También puede cerrarse manualmente
    btnCerrar.addEventListener("click", () => {
        popup.classList.remove("activo");
    });
});