/**
 * Configuración global de la API
 * Detecta automáticamente si está en entorno local o en producción (Render)
 */
const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://proyecto-mascota.onrender.com";

// Exportar para que sea fácil de identificar (opcional en scripts simples)
console.log("Conectado a la API en:", API_URL);
