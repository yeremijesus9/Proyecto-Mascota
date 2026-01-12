const categorias ={
  es: {
    QuienesSomos: "Quienes Somos",
    Formulario: "Formulario",
    contacto: "Contacto",
  },
  en: {
    QuienesSomos: "About Us",
    Formulario: "Form",
    contacto: "Contact",
  }
};

function cambiarIdioma(idioma) {
  document.getElementById("categoria").textContent =
    categorias[idioma].contacto;
}
