<?php
/**
 * API de Chats
 * Endpoints: /api/chats/*
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../controllers/ChatController.php';
require_once __DIR__ . '/../utils/Response.php';

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

$uri_without_query = strtok($request_uri, '?');
$path_parts = explode('/', trim($uri_without_query, '/'));
$action = end($path_parts);


$controller = new ChatController();

switch ($action) {
    case 'crear':
        if ($method === 'POST') {
            $controller->crearChat();
        } else {
            Response::error("Método no permitido", 405);
        }
        break;

    case 'mis-chats':
        if ($method === 'GET') {
            $controller->obtenerMisChats();
        } else {
            Response::error("Método no permitido", 405);
        }
        break;

    case 'info':
        if ($method === 'GET') {
            $controller->obtenerChat();
        } else {
            Response::error("Método no permitido", 405);
        }
        break;

    case 'mensajes':
        if ($method === 'GET') {
            $controller->obtenerMensajes();
        } else {
            Response::error("Método no permitido", 405);
        }
        break;

    case 'enviar':
        if ($method === 'POST') {
            $controller->enviarMensaje();
        } else {
            Response::error("Método no permitido", 405);
        }
        break;

    default:
        Response::error("Endpoint no encontrado", 404);
        break;
}
?>