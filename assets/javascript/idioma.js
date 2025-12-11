
/**
 * @type {string} idiomaActual - Código del idioma actual, inicia en español.
 */
window.idiomaActual = "es";

/**
 * Retorna la ruta del archivo JSON de productos para el idioma actual.
 * @returns {string} La ruta completa al archivo JSON.
 */
window.rutaJson = function () {
    return `/assets/JSON/${window.idiomaActual}_mascota.json`;
};

/**
 * Retorna la ruta del archivo JSON de interfaz para el idioma actual.
 * @returns {string} La ruta completa al archivo JSON de interfaz.
 */
window.rutaInterfaceJson = function () {
    return `/assets/JSON/${window.idiomaActual}_interface.json`;
};

window.cambiarIdioma = async function(nuevoIdioma) {
    if (window.idiomaActual === nuevoIdioma) return;

    window.idiomaActual = nuevoIdioma;
    localStorage.setItem('idiomaSeleccionado', nuevoIdioma);

    if (typeof window.rutaInterfaceJson === 'function') {
        loadTranslations(window.rutaInterfaceJson());
    }

    if (typeof window.cargarDetalleYRelacionados === "function") {
        await window.cargarDetalleYRelacionados();
    }
};
