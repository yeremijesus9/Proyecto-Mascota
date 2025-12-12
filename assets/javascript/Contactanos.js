const datosUsuario = {
  nombre: 'Jaime',
  apellidos: 'Lopez Perez',
  correo: 'Jaime.lorez@ejemplo.com',
  telefono: '555-123-456'
};

// Paso 1: Convertir el objeto JavaScript a una cadena JSON
const datosJSON = JSON.stringify(datosUsuario);

// Paso 2: Guardar la cadena JSON en localStorage
// Le daremos el nombre clave 'datosContacto'
localStorage.setItem('datosContacto', datosJSON);

console.log("Datos guardados con éxito.");

// Paso 1: Obtener la cadena JSON de localStorage
const datosGuardados = localStorage.getItem('datosContacto');

if (datosGuardados) {
  // Paso 2: Convertir la cadena JSON de vuelta a un objeto JavaScript
  const usuario = JSON.parse(datosGuardados);

  // Ahora puedes acceder a cada dato fácilmente:
  console.log(`Nombre completo: ${usuario.nombre} ${usuario.apellidos}`);
  console.log(`Correo: ${usuario.correo}`);
  console.log(`Teléfono: ${usuario.telefono}`);

} else {
  console.log("No se encontraron datos de usuario guardados.");
}

/**
 * Guarda los datos de contacto del usuario en el localStorage del navegador.
 * @param {string} nombre El nombre del usuario.
 * @param {string} apellidos Los apellidos del usuario.
 * @param {string} correo El correo electrónico del usuario.
 * @param {string} telefono El número de teléfono del usuario.
 */
function guardarDatosContacto(nombre, apellidos, correo, telefono) {
  // 1. Crear un objeto con los datos
  const datosUsuario = {
    nombre: nombre,
    apellidos: apellidos,
    correo: correo,
    telefono: telefono
  };

  // 2. Convertir el objeto JavaScript a una cadena JSON (Serialización)
  const datosJSON = JSON.stringify(datosUsuario);

  // 3. Almacenar la cadena JSON en localStorage
  localStorage.setItem('datosContactoGuardados', datosJSON);

  console.log("✅ Datos de contacto guardados en localStorage.");
}

// --- EJEMPLO DE USO ---
// Puedes llamar a esta función cuando el usuario haga clic en el botón de enviar del formulario:
//
// const inputNombre = document.getElementById('nombreInput').value;
// const inputApellido = document.getElementById('apellidoInput').value;
// ...etc.
//
// guardarDatosContacto(inputNombre, inputApellido, inputCorreo, inputTelefono);

guardarDatosContacto('Jaime', 'Lopez Perez', 'Jaime.lorez@mail.es', '555-123-456');