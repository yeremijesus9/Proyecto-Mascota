// sistema de idiomas: español e inglés
// por defecto arranco en español
window.idiomaActual = "es";

// esta función me da la ruta del json de productos según el idioma actual
window.rutaJson = () =>
    `/assets/JSON/${window.idiomaActual}_mascota.json`;

// esta función me da la ruta del json de textos de interfaz según el idioma
window.rutaInterfaceJson = () =>
    `/assets/JSON/${window.idiomaActual}_interface.json`;

// función para cambiar de idioma
window.cambiarIdioma = async function(nuevoIdioma) {
    // si es el mismo idioma que ya tengo, no hago nada
    if (window.idiomaActual === nuevoIdioma) return;

    // cambio el idioma y lo guardo en localstorage
    window.idiomaActual = nuevoIdioma;
    localStorage.setItem('idiomaSeleccionado', nuevoIdioma);

    // cargo las traducciones de la interfaz si la función existe
    if (typeof window.rutaInterfaceJson === 'function') {
        loadTranslations(window.rutaInterfaceJson());
    }

    // recargo los productos en la página de detalle si existe esa función
    if (typeof window.cargarDetalleYRelacionados === "function") {
        await window.cargarDetalleYRelacionados();
    }
};
