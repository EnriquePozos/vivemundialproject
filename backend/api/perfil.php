<?php
/**
 * API de Perfil de Usuario (PROTEGIDA)
 * Endpoint: /api/perfil
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Manejar peticiones OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../middlewares/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

// Obtener el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Solo permitir GET
if ($method !== 'GET') {
    Response::error("Método no permitido", 405);
}

// USAR EL MIDDLEWARE - Verificar autenticación
$id_Usuario = AuthMiddleware::verificarToken();

// Si llegamos aquí, el usuario está autenticado
// Obtener datos del usuario
$usuario = AuthMiddleware::obtenerUsuario($id_Usuario);

if ($usuario) {
    Response::success($usuario, "Perfil obtenido exitosamente");
} else {
    Response::error("Usuario no encontrado", 404);
}
?>