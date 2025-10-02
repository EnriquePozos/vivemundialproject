<?php
/**
 * Middleware de Autenticación
 * Verifica que el usuario esté autenticado antes de acceder a endpoints protegidos
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware {
    private static $db;
    
    /**
     * Verificar token y obtener ID del usuario
     * @return int ID del usuario autenticado
     */
    public static function verificarToken() {
        // Obtener headers
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        
        // Verificar que exista el header
        if (!$authHeader) {
            Response::unauthorized("Token no proporcionado");
        }
        
        // Extraer token (formato: "Bearer token123...")
        $token = str_replace('Bearer ', '', $authHeader);
        $token = trim($token);
        
        // Verificar que el token no esté vacío
        if (empty($token)) {
            Response::unauthorized("Token inválido");
        }
        
        // Obtener usuario asociado al token
        $id_Usuario = self::obtenerUsuarioPorToken($token);
        
        if (!$id_Usuario) {
            Response::unauthorized("Token inválido o sesión expirada");
        }
        
        return $id_Usuario;
    }
    
    /**
     * Buscar usuario por token en la base de datos
     * @param string $token
     * @return int|null ID del usuario o null si no existe
     */
    private static function obtenerUsuarioPorToken($token) {
        // Obtener conexión a la base de datos
        $database = new Database();
        self::$db = $database->getConnection();
        
        $query = "SELECT s.id_Usuario, u.Estado 
                  FROM Sesiones s
                  INNER JOIN Usuario u ON s.id_Usuario = u.id_Usuario
                  WHERE s.token = :token AND s.activa = 1 
                  LIMIT 1";
        
        $stmt = self::$db->prepare($query);
        $stmt->bindParam(":token", $token);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row['id_Usuario'];
        }
        
        return null;
    }
    
    /**
     * Obtener datos completos del usuario autenticado
     * @param int $id_Usuario
     * @return array|null Datos del usuario
     */
    public static function obtenerUsuario($id_Usuario) {
        $database = new Database();
        self::$db = $database->getConnection();
        
        $query = "SELECT id_Usuario, nombre_Usuario, Correo, Estado, Puntos, IconoPerfil, id_Socket
                  FROM Usuario 
                  WHERE id_Usuario = :id_Usuario 
                  LIMIT 1";
        
        $stmt = self::$db->prepare($query);
        $stmt->bindParam(":id_Usuario", $id_Usuario);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        return null;
    }
    
    /**
     * Verificar que el usuario tenga puntos suficientes
     * @param int $id_Usuario
     * @param int $puntos_necesarios
     * @return bool
     */
    public static function verificarPuntos($id_Usuario, $puntos_necesarios) {
        $usuario = self::obtenerUsuario($id_Usuario);
        
        if (!$usuario) {
            return false;
        }
        
        return $usuario['Puntos'] >= $puntos_necesarios;
    }
}
?>