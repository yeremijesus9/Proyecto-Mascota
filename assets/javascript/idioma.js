// ====================================================================
// CONFIGURACIÓN GLOBAL DE IDIOMA Y RUTA
// Estas variables se hacen globales para ser usadas en script.js
// ====================================================================

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
