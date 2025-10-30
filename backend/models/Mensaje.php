<?php
/**
 * Modelo de Mensaje
 * Maneja las operaciones CRUD de mensajes
 */

class Mensaje {
    private $conn;
    private $table_name = "Mensajes";

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Crear un nuevo mensaje
     * 
     * @param int $id_Chat ID del chat
     * @param int $id_Remitente ID del usuario remitente
     * @param string $mensaje Contenido del mensaje
     * @param bool $encriptado Si el mensaje está encriptado
     * @param string $tipo_Mensaje Tipo: texto, imagen, archivo, ubicacion, sistema
     * @param string|null $url_Archivo URL del archivo (opcional)
     * @param string|null $nombre_Archivo Nombre original del archivo (opcional)
     * @param int|null $tamano_Archivo Tamaño en bytes (opcional)
     * @return int|false ID del mensaje creado o false si falla
     */
    public function crear(
        $id_Chat, 
        $id_Remitente, 
        $mensaje, 
        $encriptado = false, 
        $tipo_Mensaje = 'texto',
        $url_Archivo = null,
        $nombre_Archivo = null,
        $tamano_Archivo = null
    ) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (id_Chat, id_Remitente, mensaje, encriptado, tipo_Mensaje, url_Archivo, nombre_Archivo, tamano_Archivo) 
                  VALUES 
                  (:id_Chat, :id_Remitente, :mensaje, :encriptado, :tipo_Mensaje, :url_Archivo, :nombre_Archivo, :tamano_Archivo)";

        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $id_Chat = htmlspecialchars(strip_tags($id_Chat));
        $id_Remitente = htmlspecialchars(strip_tags($id_Remitente));
        $mensaje = htmlspecialchars(strip_tags($mensaje));
        $encriptado = $encriptado ? 1 : 0;
        $tipo_Mensaje = htmlspecialchars(strip_tags($tipo_Mensaje));
        
        // Bind de parámetros
        $stmt->bindParam(':id_Chat', $id_Chat);
        $stmt->bindParam(':id_Remitente', $id_Remitente);
        $stmt->bindParam(':mensaje', $mensaje);
        $stmt->bindParam(':encriptado', $encriptado);
        $stmt->bindParam(':tipo_Mensaje', $tipo_Mensaje);
        $stmt->bindParam(':url_Archivo', $url_Archivo);
        $stmt->bindParam(':nombre_Archivo', $nombre_Archivo);
        $stmt->bindParam(':tamano_Archivo', $tamano_Archivo);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    /**
     * Obtener mensajes de un chat
     * 
     * @param int $id_Chat ID del chat
     * @param int $limite Límite de mensajes a obtener
     * @return array Array de mensajes
     */
    public function obtenerPorChat($id_Chat, $limite = 50) {
        $query = "SELECT 
                    m.*,
                    u.nombre_Usuario
                  FROM " . $this->table_name . " m
                  INNER JOIN Usuario u ON m.id_Remitente = u.id_Usuario
                  WHERE m.id_Chat = :id_Chat
                  ORDER BY m.fecha_Hora ASC
                  LIMIT :limite";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_Chat', $id_Chat, PDO::PARAM_INT);
        $stmt->bindParam(':limite', $limite, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Eliminar un mensaje
     * 
     * @param int $id_Mensaje ID del mensaje
     * @param int $id_Usuario ID del usuario (para verificar permisos)
     * @return bool True si se eliminó, false si no
     */
    public function eliminar($id_Mensaje, $id_Usuario) {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE id_Mensaje = :id_Mensaje 
                  AND id_Remitente = :id_Usuario";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_Mensaje', $id_Mensaje);
        $stmt->bindParam(':id_Usuario', $id_Usuario);

        return $stmt->execute();
    }
}
?>