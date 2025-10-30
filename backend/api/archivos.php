<?php
/**
 * API de Archivos (PROTEGIDA)
 * Endpoint: /api/archivos/subir
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Manejar peticiones OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../middlewares/AuthMiddleware.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Mensaje.php';
require_once __DIR__ . '/../utils/Response.php';

// Solo permitir POST
$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
    Response::error("Método no permitido", 405);
}

// Verificar autenticación
$id_Usuario = AuthMiddleware::verificarToken();

// Obtener datos del formulario
$id_Chat = $_POST['id_Chat'] ?? null;
$tipo = $_POST['tipo'] ?? null; // 'imagen' o 'archivo'
$encriptado = isset($_POST['encriptado']) && $_POST['encriptado'] === 'true' ? 1 : 0;

// Validar datos requeridos
if (!$id_Chat || !$tipo) {
    Response::error("Faltan datos requeridos (id_Chat, tipo)", 400);
}

// Validar que se haya subido un archivo
if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
    Response::error("No se recibió ningún archivo o hubo un error en la subida", 400);
}

$archivo = $_FILES['archivo'];

// Validar tamaño máximo (10MB)
$max_size = 10 * 1024 * 1024; // 10MB
if ($archivo['size'] > $max_size) {
    Response::error("El archivo es muy grande. Máximo 10MB", 400);
}

// Obtener información del archivo
$nombre_original = basename($archivo['name']);
$extension = strtolower(pathinfo($nombre_original, PATHINFO_EXTENSION));

// Validar extensiones permitidas según tipo
if ($tipo === 'imagen') {
    $extensiones_permitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $carpeta_destino = 'imagenes';
} else if ($tipo === 'archivo') {
    $extensiones_permitidas = ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls'];
    $carpeta_destino = 'documentos';
} else {
    Response::error("Tipo de archivo no válido", 400);
}

if (!in_array($extension, $extensiones_permitidas)) {
    Response::error("Extensión de archivo no permitida para tipo '$tipo'", 400);
}

// Generar nombre único para evitar colisiones
$timestamp = time();
$nombre_unico = "archivo_{$id_Usuario}_{$timestamp}_{$nombre_original}";
$nombre_unico = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $nombre_unico); // Sanitizar nombre

// Definir ruta de destino
$ruta_uploads = __DIR__ . '/../uploads/' . $carpeta_destino . '/';
$ruta_completa = $ruta_uploads . $nombre_unico;

// Mover archivo a la carpeta de destino
if (!move_uploaded_file($archivo['tmp_name'], $ruta_completa)) {
    Response::error("Error al guardar el archivo en el servidor", 500);
}

// Generar URL pública del archivo
// IMPORTANTE: Ajusta esta URL según tu configuración de servidor
$url_base = 'https://uneroded-forest-untasked.ngrok-free.dev/POI/vivemundialproject/vivemundialproject/backend/uploads';
$url_archivo = $url_base . '/' . $carpeta_destino . '/' . $nombre_unico;

// Guardar mensaje en la base de datos
try {
    $database = new Database();
    $db = $database->getConnection();
    $mensaje_model = new Mensaje($db);

    $tipo_mensaje = $tipo; // 'imagen' o 'archivo'
    
    // El mensaje será el nombre del archivo
    $mensaje_texto = $nombre_original;

    $id_Mensaje = $mensaje_model->crear(
        $id_Chat,
        $id_Usuario,
        $mensaje_texto,
        $encriptado,
        $tipo_mensaje,
        $url_archivo,
        $nombre_original,
        $archivo['size']
    );

    if ($id_Mensaje) {
        Response::success([
            'id_Mensaje' => $id_Mensaje,
            'url_Archivo' => $url_archivo,
            'nombre_Archivo' => $nombre_original,
            'tamano_Archivo' => $archivo['size'],
            'tipo_Mensaje' => $tipo_mensaje
        ], "Archivo subido exitosamente");
    } else {
        // Si falla guardar en BD, eliminar el archivo subido
        unlink($ruta_completa);
        Response::error("Error al guardar el mensaje en la base de datos", 500);
    }

} catch (Exception $e) {
    // Si hay error, eliminar el archivo subido
    if (file_exists($ruta_completa)) {
        unlink($ruta_completa);
    }
    Response::error("Error al procesar el archivo: " . $e->getMessage(), 500);
}
?>