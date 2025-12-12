# 🔐 Sistema de Autenticación con LocalStorage - Miwuff

## ✅ Características Implementadas

### 1. **Registro de Usuarios**
- Los usuarios pueden crear una cuenta con:
  - Nombre de usuario (mínimo 3 caracteres)
  - Correo electrónico
  - Contraseña (mínimo 6 caracteres)
- Validación de email duplicado
- Requiere aceptar términos y condiciones
- Los datos se guardan en `localStorage` del navegador

### 2. **Inicio de Sesión**
- Login con correo electrónico y contraseña
- Validación de credenciales contra usuarios registrados
- Opción "Recordarme" (funcionalidad base implementada)
- Mensajes de éxito/error visuales

### 3. **Gestión de Sesión**
- El sistema detecta automáticamente si hay un usuario logueado
- Cambia el icono del navbar de `mdi:user-plus` ➜ `mdi:account`
- Muestra información del usuario en un dropdown
- Persiste la sesión entre recargas de página

### 4. **Cerrar Sesión**
- Opción de logout en el dropdown del usuario
- Confirmación antes de cerrar sesión
- Limpia los datos de sesión y recarga la página

---

## 🎨 Cambios Visuales

### **Icono del Navbar**
- **Usuario NO logueado**: Icono `mdi:user-plus` (persona con +)
- **Usuario logueado**: Icono `mdi:account` (persona simple)

### **Dropdown de Usuario** (solo visible si está logueado)
Cuando haces clic en el icono de usuario logueado, aparece un menú con:
- 👤 Nombre de usuario
- 📧 Correo electrónico
- 🚪 Botón "Cerrar Sesión"

---

## 📂 Archivos Modificados

### 1. `/login.html`
- ✅ Agregados IDs a todos los inputs para acceso desde JavaScript
- ✅ IDs de formularios: `loginForm` y `registerForm`

### 2. `/assets/javascript/login.js` (reescrito completamente)
**Funciones principales:**
- `AuthSystem.register()` - Registrar nuevos usuarios
- `AuthSystem.login()` - Iniciar sesión
- `AuthSystem.logout()` - Cerrar sesión
- `AuthSystem.getCurrentUser()` - Obtener usuario actual
- `AuthSystem.isLoggedIn()` - Verificar si hay sesión activa
- `showMessage()` - Mostrar mensajes de éxito/error

### 3. `/assets/javascript/nav_footer.js`
**Funciones añadidas:**
- `updateLoginIcon()` - Actualiza el icono según el estado de login
- `createUserDropdown()` - Crea el menú dropdown del usuario
- Manejo de clicks en el botón de login según el estado

### 4. `/assets/css/navfooterStyles.css`
- ✅ Estilos para el dropdown de usuario
- ✅ Estilos para información del usuario
- ✅ Animaciones y transiciones

---

## 🔧 Cómo Usar el Sistema

### **Registrar un nuevo usuario:**
1. Haz clic en el icono de usuario en el navbar
2. Selecciona "Registrate"
3. Completa el formulario:
   - Usuario (mínimo 3 caracteres)
   - Email
   - Contraseña (mínimo 6 caracteres)
   - Acepta los términos
4. Haz clic en "Registrarse"
5. Si el registro es exitoso, automáticamente cambia al formulario de login

### **Iniciar Sesión:**
1. Haz clic en el icono de usuario en el navbar
2. Ingresa tu email y contraseña
3. Haz clic en "Iniciar Sesión"
4. Si las credenciales son correctas, la página se recarga y el icono cambia a `mdi:account`

### **Ver Información del Usuario:**
1. Una vez logueado, haz clic en el icono `mdi:account`
2. Aparecerá el dropdown con tu información

### **Cerrar Sesión:**
1. Haz clic en el icono de usuario logueado
2. Selecciona "Cerrar Sesión"
3. Confirma la acción
4. La sesión se elimina y la página se recarga

---

## 💾 Almacenamiento en LocalStorage

El sistema utiliza dos claves en localStorage:

1. **`miwuff_users`**: Array con todos los usuarios registrados
   ```json
   [
     {
       "id": 1670000000000,
       "username": "juan",
       "email": "juan@example.com",
       "password": "123456",
       "createdAt": "2025-12-12T10:30:00.000Z"
     }
   ]
   ```

2. **`miwuff_current_user`**: Usuario actualmente logueado
   ```json
   {
     "id": 1670000000000,
     "username": "juan",
     "email": "juan@example.com",
     "password": "123456",
     "createdAt": "2025-12-12T10:30:00.000Z"
   }
   ```

---

## ⚠️ Notas Importantes

### **Seguridad:**
- ⚠️ Las contraseñas se almacenan en **texto plano** en localStorage
- ⚠️ Este sistema es solo para **desarrollo/demostración**
- 🔒 Para **producción**, debes:
  - Usar un backend real (Node.js, PHP, etc.)
  - Encriptar contraseñas (bcrypt, argon2)
  - Usar tokens JWT para sesiones
  - Implementar HTTPS

### **Persistencia:**
- Los datos persisten mientras no se limpie el localStorage del navegador
- Si el usuario borra el caché/cookies, perderá su cuenta
- Los datos son específicos del navegador y dominio

---

## 🧪 Probar el Sistema

### **Usuarios de prueba** (si quieres crearlos manualmente):
Puedes abrir la consola del navegador y ejecutar:

```javascript
// Crear un usuario de prueba
AuthSystem.register('admin', 'admin@miwuff.com', 'admin123');

// Ver todos los usuarios registrados
console.log(AuthSystem.getUsers());

// Ver usuario actual
console.log(AuthSystem.getCurrentUser());

// Verificar si hay sesión
console.log(AuthSystem.isLoggedIn());
```

---

## 🎯 Próximas Mejoras Sugeridas

1. **Recuperación de contraseña** via email simulation
2. **Editar perfil de usuario**
3. **Validación de email** con regex mejorado
4. **Fuerza de contraseña** con indicador visual
5. **Historial de pedidos** por usuario
6. **Favoritos/Wishlist** por usuario
7. **Carrito de compras** persistente por usuario
8. **Avatar de usuario** con subida de imagen

---

## 📞 Soporte

Si encuentras algún problema:
1. Abre la consola del navegador (F12)
2. Revisa si hay errores en la pestaña "Console"
3. Verifica que localStorage esté habilitado en tu navegador
4. Asegúrate de que todos los archivos estén en sus ubicaciones correctas

---

## ✨ Funcionalidades Adicionales Implementadas

### **Mensajes Visuales:**
- ✅ Mensajes de éxito (verde)
- ❌ Mensajes de error (rojo)
- ℹ️ Mensajes informativos (azul)
- Aparecen arriba de la pantalla y se ocultan automáticamente

### **Validaciones:**
- Email duplicado al registrarse
- Contraseña mínima de 6 caracteres
- Usuario mínimo de 3 caracteres
- Aceptación de términos obligatoria

### **UX/UI:**
- Cambio automático de login ➜ registro y viceversa
- Cierre automático del popup después del login exitoso
- Dropdown con diseño coherente al tema del sitio
- Animaciones suaves en todas las transiciones

---

**¡El sistema está listo para usar! 🎉**
