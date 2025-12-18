// ==================================================
// Variables globales
// ==================================================
if (!window.idiomaActual) window.idiomaActual = 'es';
let reloj; // Se asignará después de cargar el navbar

// ==================================================
// Función para cambiar idioma y recargar contenidos
// ==================================================
function cambiarIdioma(nuevoIdioma) {
    if (!window.idiomaActual || window.idiomaActual === nuevoIdioma) return;

    window.idiomaActual = nuevoIdioma;
    console.log(`Cambiando idioma a: ${nuevoIdioma}`);

    // Cargar traducciones de la interfaz
    if (typeof window.rutaInterfaceJson === 'function') {
        loadTranslations(window.rutaInterfaceJson());
    }

    // Recargar productos si existe la función
    if (typeof window.cargarYMostrarProductos === 'function') {
        window.cargarYMostrarProductos();
    }

}