<?php
/**
 * Clase para manejar respuestas JSON estandarizadas
 */

class Response {
    
    /**
     * Enviar respuesta exitosa
     * @param mixed $data Datos a enviar
     * @param string $message Mensaje opcional
     * @param int $code Código HTTP (default: 200)
     */
    public static function success($data = null, $message = "Operación exitosa", $code = 200) {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Enviar respuesta de error
     * @param string $message Mensaje de error
     * @param int $code Código HTTP (default: 400)
     * @param mixed $errors Errores adicionales
     */
    public static function error($message = "Error en la operación", $code = 400, $errors = null) {
        http_response_code($code);
        $response = [
            'success' => false,
            'message' => $message
        ];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Enviar respuesta no autorizada
     * @param string $message Mensaje de error
     */
    public static function unauthorized($message = "No autorizado") {
        self::error($message, 401);
    }

    /**
     * Enviar respuesta no encontrado
     * @param string $message Mensaje de error
     */
    public static function notFound($message = "Recurso no encontrado") {
        self::error($message, 404);
    }

    /**
     * Enviar respuesta de validación fallida
     * @param array $errors Errores de validación
     */
    public static function validationError($errors) {
        self::error("Errores de validación", 422, $errors);
    }

    /**
     * Configurar headers CORS
     */
    public static function setCorsHeaders() {
        header("Access-Control-Allow-Origin: *");
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Max-Age: 3600");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
        
        // Manejar peticiones OPTIONS (preflight)
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
?>