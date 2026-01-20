// aquí controlo el cambio global de idioma para que todo se actualice a la vez.
window.idiomaActual = localStorage.getItem("idiomaSeleccionado") || "es";

// monto las rutas de los json según el idioma que esté puesto ahora.
// les pongo un pequeño talle de tiempo para que no se queden antiguos en el navegador.
window.rutaJson = () => 'http://localhost:3000/products';

window.rutaInterfaceJson = () =>
  `/assets/JSON/${window.idiomaActual}_interface.json?t=${Date.now()}`;

// guardo el nuevo idioma y aviso a la interfaz y a los productos para que se recarguen.
window.cambiarIdioma = async function (nuevoIdioma) {
  if (window.idiomaActual === nuevoIdioma) return;

  window.idiomaActual = nuevoIdioma;
  localStorage.setItem("idiomaSeleccionado", nuevoIdioma);

  // refresco los textos de los botones y menús.
  if (typeof window.loadTranslations === "function") {
    await window.loadTranslations(window.rutaInterfaceJson());
  }

  // si estamos en la home, que se refresquen los destacados.
  if (typeof window.cargarYMostrarDestacados === "function") {
    await window.cargarYMostrarDestacados();
  }

  // si estamos en una categoría, que se refresquen los productos.
  if (typeof window.mostrarProductos === "function") {
    await window.mostrarProductos();
  }

  // si estoy en la página de un producto, que cambie también su descripción.
  if (typeof window.cargarDetalleYRelacionados === "function") {
    await window.cargarDetalleYRelacionados();
  }
};
