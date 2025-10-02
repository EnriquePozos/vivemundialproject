<?php
/**
 * API de Autenticación
 */

// Headers CORS - Permitir cualquier origen para túneles
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Manejar peticiones OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../utils/Response.php';

// Obtener el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obtener la acción de la URL o del query string
$request_uri = $_SERVER['REQUEST_URI'];
$path_parts = explode('/', trim($request_uri, '/'));
$action = end($path_parts);

// Si viene por query string (?action=registro)
if (isset($_GET['action'])) {
    $action = $_GET['action'];
}

// Crear instancia del controlador
$controller = new AuthController();

// Enrutar según la acción
switch ($action) {
    case 'registro':
        if ($method === 'POST') {
            $controller->registro();
        } else {
            Response::error("Método no permitido", 405);
        }
        break;

    case 'login':
        if ($method === 'POST') {
            $controller->login();
        } else {
            Response::error("Método no permitido", 405);
        }
        break;

    case 'logout':
        if ($method === 'POST') {
            $controller->logout();
        } else {
            Response::error("Método no permitido", 405);
        }
        break;

    case 'me':
        if ($method === 'GET') {
            $controller->me();
        } else {
            Response::error("Método no permitido", 405);
        }
        break;

    default:
        Response::error("Endpoint no encontrado", 404);
        break;
}
?>