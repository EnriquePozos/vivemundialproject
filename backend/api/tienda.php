<?php
/**
 * API de Tienda (PROTEGIDA)
 * Endpoints:
 * - GET /api/tienda              → Obtener iconos disponibles
 * - GET /api/tienda/mis-iconos   → Obtener iconos del usuario
 * - POST /api/tienda/comprar     → Comprar un icono
 * - POST /api/tienda/equipar     → Equipar un icono
 * - POST /api/tienda/desequipar  → Desequipar icono actual
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning");
header("Content-Type: application/json; charset=UTF-8");

// Manejar peticiones OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../middlewares/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Tienda.php';

// Obtener el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// USAR EL MIDDLEWARE - Verificar autenticación
$id_Usuario = AuthMiddleware::verificarToken();

// Crear conexión a la base de datos
$database = new Database();
$db = $database->getConnection();
$tienda_model = new Tienda($db);

// Determinar la acción según la URL
$request_uri = $_SERVER['REQUEST_URI'];

// Extraer la ruta después de /api/tienda
$path = parse_url($request_uri, PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Buscar el índice de 'tienda' en la ruta
$tienda_index = array_search('tienda', $path_parts);
$action = isset($path_parts[$tienda_index + 1]) ? $path_parts[$tienda_index + 1] : '';

// ============================================
// RUTAS DE LA API
// ============================================

// GET /api/tienda → Obtener iconos disponibles
if ($method === 'GET' && $action === '') {
    try {
        $iconos = $tienda_model->obtenerIconosDisponibles();
        Response::success($iconos, "Iconos de la tienda obtenidos exitosamente");
    } catch (Exception $e) {
        Response::error("Error al obtener iconos: " . $e->getMessage(), 500);
    }
}

// GET /api/tienda/mis-iconos → Obtener iconos del usuario
elseif ($method === 'GET' && $action === 'mis-iconos') {
    try {
        $iconos = $tienda_model->obtenerIconosUsuario($id_Usuario);
        
        // También obtener el icono equipado
        $icono_equipado = $tienda_model->obtenerIconoEquipado($id_Usuario);
        
        Response::success([
            'iconos' => $iconos,
            'icono_equipado' => $icono_equipado
        ], "Iconos del usuario obtenidos exitosamente");
    } catch (Exception $e) {
        Response::error("Error al obtener iconos del usuario: " . $e->getMessage(), 500);
    }
}

// POST /api/tienda/comprar → Comprar un icono
elseif ($method === 'POST' && $action === 'comprar') {
    try {
        // Obtener datos del cuerpo de la petición
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar que se envió el id_Icono
        if (!isset($data['id_Icono']) || empty($data['id_Icono'])) {
            Response::error("El id_Icono es requerido", 400);
        }
        
        $id_Icono = (int)$data['id_Icono'];
        
        // Procesar la compra
        $resultado = $tienda_model->comprarIcono($id_Usuario, $id_Icono);
        
        if ($resultado['success']) {
            Response::success($resultado['data'], $resultado['message']);
        } else {
            Response::error($resultado['message'], 400);
        }
        
    } catch (Exception $e) {
        Response::error("Error al procesar la compra: " . $e->getMessage(), 500);
    }
}

// POST /api/tienda/equipar → Equipar un icono
elseif ($method === 'POST' && $action === 'equipar') {
    try {
        // Obtener datos del cuerpo de la petición
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar que se envió el id_Icono
        if (!isset($data['id_Icono']) || empty($data['id_Icono'])) {
            Response::error("El id_Icono es requerido", 400);
        }
        
        $id_Icono = (int)$data['id_Icono'];
        
        // Equipar el icono
        $resultado = $tienda_model->equiparIcono($id_Usuario, $id_Icono);
        
        if ($resultado['success']) {
            Response::success($resultado['data'], $resultado['message']);
        } else {
            Response::error($resultado['message'], 400);
        }
        
    } catch (Exception $e) {
        Response::error("Error al equipar icono: " . $e->getMessage(), 500);
    }
}

// POST /api/tienda/desequipar → Desequipar icono actual
elseif ($method === 'POST' && $action === 'desequipar') {
    try {
        // Desequipar el icono
        $resultado = $tienda_model->desequiparIcono($id_Usuario);
        
        if ($resultado['success']) {
            Response::success(null, $resultado['message']);
        } else {
            Response::error($resultado['message'], 400);
        }
        
    } catch (Exception $e) {
        Response::error("Error al desequipar icono: " . $e->getMessage(), 500);
    }
}

// Ruta no encontrada
else {
    Response::error("Endpoint no encontrado", 404);
}
?>