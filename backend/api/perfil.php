<?php
/**
 * API de Perfil de Usuario (PROTEGIDA)
 * Endpoint: /api/perfil y /api/perfil/todos
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

// --- NUEVAS INCLUSIONES ---
require_once __DIR__ . '/../config/database.php'; 
require_once __DIR__ . '/../models/Usuario.php'; 
// --------------------------

// Obtener el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Solo permitir GET
if ($method !== 'GET') {
    Response::error("Método no permitido", 405);
}

// USAR EL MIDDLEWARE - Verificar autenticación
$id_Usuario = AuthMiddleware::verificarToken();

// Determinar si la petición es para obtener todos los usuarios
$request_uri = $_SERVER['REQUEST_URI'];
// Usamos strpos para ver si la URL contiene '/perfil/todos'
$is_all_users_request = strpos($request_uri, '/perfil/todos') !== false;

// --- LÓGICA: OBTENER TODOS LOS USUARIOS ---
if ($is_all_users_request) {
    $database = new Database();
    $db = $database->getConnection();
    $usuario_model = new Usuario($db);

    // Obtener todos los usuarios de la base de datos
    $usuarios = $usuario_model->obtenerTodos();

    // Filtrar al usuario actual de la lista para que no se pueda agregar a sí mismo
    $usuarios_filtrados = array_filter($usuarios, function($u) use ($id_Usuario) {
        return $u['id_Usuario'] != $id_Usuario;
    });

    // Reindexar el array para asegurar un JSON válido para el frontend
    $usuarios_filtrados = array_values($usuarios_filtrados);

    Response::success($usuarios_filtrados, "Lista de usuarios obtenida exitosamente");

} else {
// --- LÓGICA ORIGINAL para /perfil ---

    // Obtener datos del usuario
    $usuario = AuthMiddleware::obtenerUsuario($id_Usuario);

    if ($usuario) {
        Response::success($usuario, "Perfil obtenido exitosamente");
    } else {
        Response::error("Usuario no encontrado", 404);
    }
}
?>