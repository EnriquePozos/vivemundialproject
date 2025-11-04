<?php
// backend/api/quinielas.php

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, ngrok-skip-browser-warning, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_log("🔵 quinielas.php - Iniciando script");
error_log("🔵 REQUEST_URI: " . $_SERVER['REQUEST_URI']);
error_log("🔵 METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("🔵 GET params: " . json_encode($_GET));


// Manejar OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Quiniela.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

try {
    // Conectar a la base de datos
    $database = new Database();
    $db = $database->getConnection();

    // ============================================
    // AUTENTICACIÓN CON TOKEN HASH (como tareas.php)
    // ============================================
    
    // Obtener el token del header Authorization
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        // Extraer token (formato: "Bearer TOKEN")
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        } else {
            $token = $authHeader;
        }
    }
    
    // Verificar que el token exista
    if (!$token) {
        Response::error('Token no proporcionado', 401);
        exit();
    }
    
    // Buscar el token en la base de datos
    $query = "SELECT s.id_Usuario, u.nombre_Usuario, u.Puntos 
              FROM Sesiones s 
              INNER JOIN Usuario u ON s.id_Usuario = u.id_Usuario 
              WHERE s.token = :token AND s.activa = 1 
              LIMIT 1";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->execute();
    
    $sesion = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$sesion) {
        Response::error('Token inválido o expirado', 401);
        exit();
    }
    
    // Usuario autenticado
    $id_Usuario = $sesion['id_Usuario'];
    $nombre_Usuario = $sesion['nombre_Usuario'];
    $puntos_Usuario = $sesion['Puntos'];
    
    // ============================================
    // CREAR INSTANCIA DEL MODELO
    // ============================================
    
    $quinielaModel = new Quiniela($db);
    
    // ============================================
    // ENRUTAMIENTO
    // ============================================
    
    $method = $_SERVER['REQUEST_METHOD'];
    $ruta = isset($_GET['ruta']) ? $_GET['ruta'] : '';

    switch ($method) {
        case 'GET':
            switch ($ruta) {
                case 'disponibles':
                    // GET /api/quinielas.php?ruta=disponibles
                    $quinielas = $quinielaModel->listarDisponibles();
                    Response::success('Quinielas disponibles obtenidas', [
                        'quinielas' => $quinielas,
                        'total' => count($quinielas)
                    ]);
                    break;
                
                case 'listar':
                    // GET /api/quinielas.php?ruta=listar&id_Chat=X
                    if (!isset($_GET['id_Chat']) || empty($_GET['id_Chat'])) {
                        Response::error('Falta el parámetro id_Chat', 400);
                        exit();
                    }
                    
                    $id_Chat = $_GET['id_Chat'];
                    
                    if (!is_numeric($id_Chat)) {
                        Response::error('id_Chat debe ser numérico', 400);
                        exit();
                    }
                    
                    // Verificar pertenencia al chat
                    if (!$quinielaModel->perteneceAlChat($id_Usuario, $id_Chat)) {
                        Response::error('No tienes acceso a este chat', 403);
                        exit();
                    }
                    
                    $quinielas = $quinielaModel->listarPorChat($id_Chat);
                    Response::success('Quinielas del chat obtenidas', [
                        'quinielas' => $quinielas,
                        'total' => count($quinielas)
                    ]);
                    break;
                
                case 'detalles':
                    // GET /api/quinielas.php?ruta=detalles&id=X
                    if (!isset($_GET['id']) || empty($_GET['id'])) {
                        Response::error('Falta el parámetro id', 400);
                        exit();
                    }
                    
                    $id_Quiniela_Chat = $_GET['id'];
                    
                    if (!is_numeric($id_Quiniela_Chat)) {
                        Response::error('ID debe ser numérico', 400);
                        exit();
                    }
                    
                    $detalles = $quinielaModel->obtenerDetalles($id_Quiniela_Chat);
                    
                    if (!$detalles) {
                        Response::error('Quiniela no encontrada', 404);
                        exit();
                    }
                    
                    $participaciones = $quinielaModel->listarParticipaciones($id_Quiniela_Chat);
                    $miParticipacion = $quinielaModel->obtenerParticipacion($id_Quiniela_Chat, $id_Usuario);
                    
                    Response::success('Detalles de quiniela obtenidos', [
                        'quiniela' => $detalles,
                        'participaciones' => $participaciones,
                        'mi_participacion' => $miParticipacion,
                        'total_participaciones' => count($participaciones),
                        'puedo_finalizar' => ($detalles['agregado_Por'] == $id_Usuario && $detalles['estado'] == 'activa')
                    ]);
                    break;
                
                case 'participaciones':
                    // GET /api/quinielas.php?ruta=participaciones&id=X
                    if (!isset($_GET['id']) || empty($_GET['id'])) {
                        Response::error('Falta el parámetro id', 400);
                        exit();
                    }
                    
                    $id_Quiniela_Chat = $_GET['id'];
                    
                    if (!is_numeric($id_Quiniela_Chat)) {
                        Response::error('ID debe ser numérico', 400);
                        exit();
                    }
                    
                    $participaciones = $quinielaModel->listarParticipaciones($id_Quiniela_Chat);
                    
                    Response::success('Participaciones obtenidas', [
                        'participaciones' => $participaciones,
                        'total' => count($participaciones)
                    ]);
                    break;
                
                case 'mi-participacion':
                    // GET /api/quinielas.php?ruta=mi-participacion&id=X
                    if (!isset($_GET['id']) || empty($_GET['id'])) {
                        Response::error('Falta el parámetro id', 400);
                        exit();
                    }
                    
                    $id_Quiniela_Chat = $_GET['id'];
                    
                    if (!is_numeric($id_Quiniela_Chat)) {
                        Response::error('ID debe ser numérico', 400);
                        exit();
                    }
                    
                    $participacion = $quinielaModel->obtenerParticipacion($id_Quiniela_Chat, $id_Usuario);
                    
                    if (!$participacion) {
                        Response::success('No has participado en esta quiniela', [
                            'participacion' => null,
                            'ha_participado' => false
                        ]);
                        exit();
                    }
                    
                    Response::success('Participación obtenida', [
                        'participacion' => $participacion,
                        'ha_participado' => true
                    ]);
                    break;
                
                default:
                    Response::error('Ruta no encontrada', 404);
            }
            break;

        case 'POST':
            switch ($ruta) {
                case 'agregar':
                    // POST /api/quinielas.php?ruta=agregar
                    $data = json_decode(file_get_contents('php://input'), true);
                    
                    $camposRequeridos = ['id_Quiniela', 'id_Chat'];
                    $validacion = Validator::validarCamposRequeridos($data, $camposRequeridos);
                    
                    if (!$validacion['valido']) {
                        Response::error($validacion['mensaje'], 400);
                        exit();
                    }
                    
                    $id_Quiniela = $data['id_Quiniela'];
                    $id_Chat = $data['id_Chat'];
                    
                    if (!is_numeric($id_Quiniela) || !is_numeric($id_Chat)) {
                        Response::error('IDs deben ser numéricos', 400);
                        exit();
                    }
                    
                    $resultado = $quinielaModel->agregarAChat($id_Quiniela, $id_Chat, $id_Usuario);
                    
                    if ($resultado['success']) {
                        $detalles = $quinielaModel->obtenerDetalles($resultado['id']);
                        
                        Response::success('Quiniela agregada al chat exitosamente', [
                            'id_Quiniela_Chat' => $resultado['id'],
                            'quiniela' => $detalles
                        ], 201);
                    } else {
                        Response::error($resultado['message'], 400);
                    }
                    break;
                
                case 'participar':
                    // POST /api/quinielas.php?ruta=participar
                    $data = json_decode(file_get_contents('php://input'), true);
                    
                    $camposRequeridos = ['id_Quiniela_Chat', 'puntos_Apostados', 'prediccion'];
                    $validacion = Validator::validarCamposRequeridos($data, $camposRequeridos);
                    
                    if (!$validacion['valido']) {
                        Response::error($validacion['mensaje'], 400);
                        exit();
                    }
                    
                    $id_Quiniela_Chat = $data['id_Quiniela_Chat'];
                    $puntos_Apostados = $data['puntos_Apostados'];
                    $prediccion = $data['prediccion'];
                    
                    if (!is_numeric($id_Quiniela_Chat) || !is_numeric($puntos_Apostados)) {
                        Response::error('IDs y puntos deben ser numéricos', 400);
                        exit();
                    }
                    
                    if ($puntos_Apostados <= 0) {
                        Response::error('Debes apostar al menos 1 punto', 400);
                        exit();
                    }
                    
                    if (empty(trim($prediccion))) {
                        Response::error('Debes hacer una predicción', 400);
                        exit();
                    }
                    
                    $resultado = $quinielaModel->participar(
                        $id_Quiniela_Chat, 
                        $id_Usuario, 
                        $puntos_Apostados, 
                        $prediccion
                    );
                    
                    if ($resultado['success']) {
                        $detalles = $quinielaModel->obtenerDetalles($id_Quiniela_Chat);
                        
                        Response::success('Participación registrada exitosamente', [
                            'id_Participacion' => $resultado['id'],
                            'puntos_apostados' => $puntos_Apostados,
                            'prediccion' => $prediccion,
                            'quiniela' => $detalles
                        ], 201);
                    } else {
                        Response::error($resultado['message'], 400);
                    }
                    break;
                
                default:
                    Response::error('Ruta no encontrada', 404);
            }
            break;

        case 'PUT':
            switch ($ruta) {
                case 'finalizar':
                    // PUT /api/quinielas.php?ruta=finalizar
                    $data = json_decode(file_get_contents('php://input'), true);
                    
                    $camposRequeridos = ['id_Quiniela_Chat', 'resultado'];
                    $validacion = Validator::validarCamposRequeridos($data, $camposRequeridos);
                    
                    if (!$validacion['valido']) {
                        Response::error($validacion['mensaje'], 400);
                        exit();
                    }
                    
                    $id_Quiniela_Chat = $data['id_Quiniela_Chat'];
                    $resultado = $data['resultado'];
                    
                    if (!is_numeric($id_Quiniela_Chat)) {
                        Response::error('ID debe ser numérico', 400);
                        exit();
                    }
                    
                    if (empty(trim($resultado))) {
                        Response::error('Debes especificar un resultado', 400);
                        exit();
                    }
                    
                    $resultadoFinal = $quinielaModel->finalizar(
                        $id_Quiniela_Chat, 
                        $resultado, 
                        $id_Usuario
                    );
                    
                    if ($resultadoFinal['success']) {
                        $detalles = $quinielaModel->obtenerDetalles($id_Quiniela_Chat);
                        
                        Response::success('Quiniela finalizada exitosamente', [
                            'resultado' => $resultadoFinal['resultado'],
                            'total_ganadores' => $resultadoFinal['total_ganadores'],
                            'ganadores' => $resultadoFinal['ganadores'],
                            'quiniela' => $detalles
                        ]);
                    } else {
                        Response::error($resultadoFinal['message'], 400);
                    }
                    break;
                
                default:
                    Response::error('Ruta no encontrada', 404);
            }
            break;

        default:
            Response::error('Método no permitido', 405);
    }

} catch (Exception $e) {
    error_log("Error en api/quinielas.php: " . $e->getMessage());
    Response::error('Error en el servidor', 500);
}
?>