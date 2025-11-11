// js/config.js
function getBaseApiPath() {
    // Busca "/php" en el path actual y corta desde ahí (funciona en todas las páginas)
    var path = window.location.pathname;
    var idx = path.indexOf("/php");
    if(idx !== -1) {
        return path.substring(0, idx+4); // +4 para incluir '/php'
    }
    // Si no existe /php en la ruta, toma la raíz
    var parts = path.split('/');
    return '/' + (parts[1] || '') + '/php';
}

var API_BASE_URL = getBaseApiPath();


