<?php
/**
 * Rutas de API para Videollamadas
 * Endpoints: /api/videocall/token, /api/videocall/iniciar, /api/videocall/finalizar
 */

// Headers CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning");
header("Content-Type: application/json; charset=UTF-8");

// Manejar peticiones OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../controllers/VideoCallController.php';

$videoCallController = new VideoCallController();

// Obtener el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obtener la ruta
$requestUri = $_SERVER['REQUEST_URI'];

// Determinar qué endpoint se está llamando
if (strpos($requestUri, '/videocall/token') !== false) {
    // Endpoint: /api/videocall/token
    if ($method === 'POST') {
        $videoCallController->generarToken();
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    }

} elseif (strpos($requestUri, '/videocall/iniciar') !== false) {
    // Endpoint: /api/videocall/iniciar
    if ($method === 'POST') {
        $videoCallController->iniciarLlamada();
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    }

} elseif (strpos($requestUri, '/videocall/finalizar') !== false) {
    // Endpoint: /api/videocall/finalizar
    if ($method === 'POST') {
        $videoCallController->finalizarLlamada();
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    }

} else {
    // Ruta no encontrada
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Ruta no encontrada']);
}
?>