// Idioma actual (por defecto español)
window.idiomaActual = "es";

// Devuelve la ruta del JSON de productos según el idioma
window.rutaJson = () =>
    `/assets/JSON/${window.idiomaActual}_mascota.json`;

// Devuelve la ruta del JSON de interfaz según el idioma
window.rutaInterfaceJson = () =>
    `/assets/JSON/${window.idiomaActual}_interface.json`;

// Función para cambiar idioma
window.cambiarIdioma = async function(nuevoIdioma) {
    if (window.idiomaActual === nuevoIdioma) return;

    window.idiomaActual = nuevoIdioma;
    localStorage.setItem('idiomaSeleccionado', nuevoIdioma);

    // Cargar traducciones de la interfaz si existe la función
    if (typeof window.rutaInterfaceJson === 'function') {
        loadTranslations(window.rutaInterfaceJson());
    }

    // Recargar detalle de productos si la función existe
    if (typeof window.cargarDetalleYRelacionados === "function") {
        await window.cargarDetalleYRelacionados();
    }
};
