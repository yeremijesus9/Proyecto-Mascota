// Rutas globales centralizadas
(function(){
    // configuración por defecto (puedes sobrescribir `window.RUTAS` antes de cargar este script)
    window.RUTAS = window.RUTAS || {};

    window.RUTAS.host = window.RUTAS.host || 'http://localhost';
    window.RUTAS.productosPort = window.RUTAS.productosPort || '12001';
    window.RUTAS.interfacePort = window.RUTAS.interfacePort || '12000';

    window.RUTAS.productos = window.RUTAS.productos || function() {
        return `${window.RUTAS.host}:${window.RUTAS.productosPort}/productos?t=${Date.now()}`;
    };

    window.RUTAS.interface = window.RUTAS.interface || function() {
        return `${window.RUTAS.host}:${window.RUTAS.interfacePort}/interface?t=${Date.now()}`;
    };

    // compatibilidad con el código existente que usa estas funciones globales
    window.rutaJson = window.rutaJson || window.RUTAS.productos;
    window.rutaInterfaceJson = window.rutaInterfaceJson || window.RUTAS.interface;

})();
