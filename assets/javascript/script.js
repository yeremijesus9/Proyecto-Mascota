
function iniciarEfectoPortada() {
    const miwuffLogo = document.getElementById('miwuff-logo');

    if (!miwuffLogo) return;

    let procesando = false;

    function actualizarPortada() {
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

    // Iniciar carga de productos si la función existe (desde detalle_p.js)
    if (typeof window.cargarYMostrarProductos === 'function') {
        window.cargarYMostrarProductos();
    }
});
