<?php
/**
 * API de Tareas (PROTEGIDA)
 * Endpoints para gestión de tareas en chats grupales
 */

// Headers CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning");
header("Content-Type: application/json; charset=UTF-8");

// Manejar peticiones OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../controllers/TareaController.php';
require_once __DIR__ . '/../utils/Response.php';

// Crear instancia del controlador
$tareaController = new TareaController();

// Obtener el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obtener la ruta
$requestUri = $_SERVER['REQUEST_URI'];

// Determinar qué acción se está llamando
// Las rutas pueden venir como:
// - /api/tareas/crear
// - /api/tareas/listar?id_Chat=123
// - /api/tareas/completar?id=456
// - /api/tareas/eliminar?id=456
// - /api/tareas/obtener?id=456

if (strpos($requestUri, '/tareas/crear') !== false) {
    // POST /api/tareas/crear
    if ($method === 'POST') {
        $tareaController->crear();
    } else {
        Response::error("Método no permitido. Use POST", 405);
    }

} elseif (strpos($requestUri, '/tareas/listar') !== false) {
    // GET /api/tareas/listar?id_Chat=123
    if ($method === 'GET') {
        $tareaController->listar();
    } else {
        Response::error("Método no permitido. Use GET", 405);
    }

} elseif (strpos($requestUri, '/tareas/completar') !== false) {
    // PUT /api/tareas/completar?id=456
    if ($method === 'PUT') {
        $tareaController->completar();
    } else {
        Response::error("Método no permitido. Use PUT", 405);
    }

} elseif (strpos($requestUri, '/tareas/eliminar') !== false) {
    // DELETE /api/tareas/eliminar?id=456
    if ($method === 'DELETE') {
        $tareaController->eliminar();
    } else {
        Response::error("Método no permitido. Use DELETE", 405);
    }

} elseif (strpos($requestUri, '/tareas/obtener') !== false) {
    // GET /api/tareas/obtener?id=456
    if ($method === 'GET') {
        $tareaController->obtener();
    } else {
        Response::error("Método no permitido. Use GET", 405);
    }

} else {
    // Ruta no encontrada
    Response::error("Endpoint no encontrado. Rutas disponibles: /crear, /listar, /completar, /eliminar, /obtener", 404);
}
?>