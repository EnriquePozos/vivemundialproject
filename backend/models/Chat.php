<?php
/**
 * Modelo Chat
 * Maneja todas las operaciones relacionadas con chats
 */

class Chat {
    private $conn;
    private $table_chats = "Chats";
    private $table_participantes = "Participantes_Chat";
    private $table_mensajes = "Mensajes";

    public $id_Chat;
    public $nombre_Chat;
    public $tipo_Chat;
    public $activo;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Crear un nuevo chat
     * @return bool
     */
    public function crear() {
        $query = "INSERT INTO " . $this->table_chats . " 
                  (nombre_Chat, tipo_Chat, activo) 
                  VALUES 
                  (:nombre_Chat, :tipo_Chat, :activo)";

        $stmt = $this->conn->prepare($query);

        $this->nombre_Chat = htmlspecialchars(strip_tags($this->nombre_Chat));
        $this->tipo_Chat = htmlspecialchars(strip_tags($this->tipo_Chat));
        $this->activo = $this->activo ?? true;

        $stmt->bindParam(":nombre_Chat", $this->nombre_Chat);
        $stmt->bindParam(":tipo_Chat", $this->tipo_Chat);
        $stmt->bindParam(":activo", $this->activo);

        if ($stmt->execute()) {
            $this->id_Chat = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    /**
     * Agregar participante a un chat
     * @param int $id_Usuario
     * @return bool
     */
    public function agregarParticipante($id_Usuario) {
        $query = "INSERT INTO " . $this->table_participantes . " 
                  (id_Usuario, id_Chat) 
                  VALUES 
                  (:id_Usuario, :id_Chat)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_Usuario", $id_Usuario);
        $stmt->bindParam(":id_Chat", $this->id_Chat);

        return $stmt->execute();
    }

    /**
     * Obtener todos los chats de un usuario
     * @param int $id_Usuario
     * @return array
     */
 public function obtenerChatsPorUsuario($id_Usuario) {
        // Importar clase de encriptación
        require_once __DIR__ . '/../utils/Encryption.php';
        
        $query = "SELECT c.*, 
                  COUNT(DISTINCT pc.id_Usuario) as total_participantes,
                  (SELECT COUNT(*) FROM " . $this->table_mensajes . " WHERE id_Chat = c.id_Chat) as total_mensajes,
                  (SELECT mensaje FROM " . $this->table_mensajes . " WHERE id_Chat = c.id_Chat ORDER BY id_Mensaje DESC LIMIT 1) as ultimo_mensaje,
                  (SELECT encriptado FROM " . $this->table_mensajes . " WHERE id_Chat = c.id_Chat ORDER BY id_Mensaje DESC LIMIT 1) as ultimo_mensaje_encriptado,
                  
                  -- Si es chat privado, obtener el nombre del otro usuario
                  CASE 
                      WHEN c.tipo_Chat = 'privado' THEN
                          (SELECT u.nombre_Usuario 
                           FROM Usuario u
                           INNER JOIN " . $this->table_participantes . " pc2 ON u.id_Usuario = pc2.id_Usuario
                           WHERE pc2.id_Chat = c.id_Chat 
                           AND pc2.id_Usuario != :id_Usuario
                           LIMIT 1)
                      ELSE c.nombre_Chat
                  END as nombre_Chat_display,
                  
                  -- Obtener el ID del otro usuario en caso de chat privado
                  CASE 
                      WHEN c.tipo_Chat = 'privado' THEN
                          (SELECT pc2.id_Usuario
                           FROM " . $this->table_participantes . " pc2
                           WHERE pc2.id_Chat = c.id_Chat 
                           AND pc2.id_Usuario != :id_Usuario2
                           LIMIT 1)
                      ELSE NULL
                  END as id_otro_usuario,
                  
                  -- Obtener el IconoPerfil del otro usuario en chats privados
                  CASE 
                      WHEN c.tipo_Chat = 'privado' THEN
                          (SELECT u.IconoPerfil 
                           FROM Usuario u
                           INNER JOIN " . $this->table_participantes . " pc2 ON u.id_Usuario = pc2.id_Usuario
                           WHERE pc2.id_Chat = c.id_Chat 
                           AND pc2.id_Usuario != :id_Usuario4
                           LIMIT 1)
                      ELSE NULL
                  END as otherUserIcon,
                  
                  -- Verificar si el otro usuario está online (Estado = 1)
                  CASE 
                      WHEN c.tipo_Chat = 'privado' THEN
                          (SELECT u.Estado 
                           FROM Usuario u
                           INNER JOIN " . $this->table_participantes . " pc2 ON u.id_Usuario = pc2.id_Usuario
                           WHERE pc2.id_Chat = c.id_Chat 
                           AND pc2.id_Usuario != :id_Usuario5
                           LIMIT 1)
                      ELSE 0
                  END as otherUserOnline
                  
                  FROM " . $this->table_chats . " c
                  INNER JOIN " . $this->table_participantes . " pc ON c.id_Chat = pc.id_Chat
                  WHERE pc.id_Usuario = :id_Usuario6 AND c.activo = 1
                  GROUP BY c.id_Chat
                  ORDER BY c.id_Chat DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_Usuario", $id_Usuario);
        $stmt->bindParam(":id_Usuario2", $id_Usuario);
        $stmt->bindParam(":id_Usuario4", $id_Usuario);
        $stmt->bindParam(":id_Usuario5", $id_Usuario);
        $stmt->bindParam(":id_Usuario6", $id_Usuario);
        $stmt->execute();

        $chats = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Desencriptar los últimos mensajes si están encriptados
        foreach ($chats as &$chat) {
            if (!empty($chat['ultimo_mensaje']) && $chat['ultimo_mensaje_encriptado'] == 1) {
                $chat['ultimo_mensaje'] = Encryption::decrypt($chat['ultimo_mensaje']);
                error_log("🔓 Último mensaje desencriptado para chat " . $chat['id_Chat']);
            }
        }
        
        return $chats;
    }
    /**
     * Obtener información de un chat específico
     * @return array|null
     */
    public function obtenerPorId() {
        $query = "SELECT * FROM " . $this->table_chats . " 
                  WHERE id_Chat = :id_Chat 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_Chat", $this->id_Chat);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }

        return null;
    }

    /**
     * Obtener participantes de un chat
     * @return array
     */
    public function obtenerParticipantes() {
        $query = "SELECT u.id_Usuario, u.nombre_Usuario, u.Correo, u.Estado, u.IconoPerfil
                  FROM Usuario u
                  INNER JOIN " . $this->table_participantes . " pc ON u.id_Usuario = pc.id_Usuario
                  WHERE pc.id_Chat = :id_Chat";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_Chat", $this->id_Chat);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Verificar si un usuario pertenece a un chat
     * @param int $id_Usuario
     * @return bool
     */
    public function usuarioPertenece($id_Usuario) {
        $query = "SELECT id_Part_Chat FROM " . $this->table_participantes . " 
                  WHERE id_Chat = :id_Chat AND id_Usuario = :id_Usuario 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_Chat", $this->id_Chat);
        $stmt->bindParam(":id_Usuario", $id_Usuario);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    /**
     * Verificar si ya existe un chat privado entre dos usuarios
     * @param int $id_Usuario1
     * @param int $id_Usuario2
     * @return int|null ID del chat si existe, null si no
     */
    public function chatPrivadoExiste($id_Usuario1, $id_Usuario2) {
        $query = "SELECT c.id_Chat 
                  FROM " . $this->table_chats . " c
                  WHERE c.tipo_Chat = 'privado'
                  AND c.id_Chat IN (
                      SELECT id_Chat FROM " . $this->table_participantes . " WHERE id_Usuario = :id_Usuario1
                  )
                  AND c.id_Chat IN (
                      SELECT id_Chat FROM " . $this->table_participantes . " WHERE id_Usuario = :id_Usuario2
                  )
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_Usuario1", $id_Usuario1);
        $stmt->bindParam(":id_Usuario2", $id_Usuario2);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row['id_Chat'];
        }

        return null;
    }

    /**
     * Obtener mensajes de un chat
     * @param int $limite Cantidad de mensajes a obtener
     * @return array
     */
public function obtenerMensajes($limite = 50) {
    // Importar clase de encriptación
    require_once __DIR__ . '/../utils/Encryption.php';
    
    $query = "SELECT m.*, u.nombre_Usuario, u.IconoPerfil
              FROM " . $this->table_mensajes . " m
              INNER JOIN Usuario u ON m.id_Remitente = u.id_Usuario
              WHERE m.id_Chat = :id_Chat
              ORDER BY m.id_Mensaje DESC
              LIMIT :limite";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(":id_Chat", $this->id_Chat);
    $stmt->bindParam(":limite", $limite, PDO::PARAM_INT);
    $stmt->execute();

    $mensajes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Desencriptar mensajes encriptados
    foreach ($mensajes as &$mensaje) {
        if ($mensaje['encriptado'] == 1 && $mensaje['tipo_Mensaje'] === 'texto') {
            $mensaje['mensaje'] = Encryption::decrypt($mensaje['mensaje']);
            error_log("🔓 Mensaje desencriptado en Chat.php - ID: " . $mensaje['id_Mensaje']);
        }
    }
    
    // Invertir orden para mostrar del más antiguo al más reciente
    return array_reverse($mensajes);
}

    /**
     * Enviar mensaje a un chat
     * @param int $id_Remitente
     * @param string $mensaje
     * @param bool $encriptado
     * @param string $tipo_Mensaje
     * @return bool
     */
public function enviarMensaje($id_Remitente, $mensaje, $encriptado = false, $tipo_Mensaje = 'texto') {
    // Importar clase de encriptación
    require_once __DIR__ . '/../utils/Encryption.php';
    
    // Encriptar el mensaje si está habilitado y es tipo texto
    if ($encriptado && $tipo_Mensaje === 'texto') {
        $mensaje = Encryption::encrypt($mensaje);
        error_log("🔒 Mensaje encriptado en Chat.php: " . substr($mensaje, 0, 50) . "...");
    }
    
    $query = "INSERT INTO " . $this->table_mensajes . " 
              (id_Chat, id_Remitente, mensaje, encriptado, tipo_Mensaje) 
              VALUES 
              (:id_Chat, :id_Remitente, :mensaje, :encriptado, :tipo_Mensaje)";

    $stmt = $this->conn->prepare($query);

    $mensaje = htmlspecialchars(strip_tags($mensaje));

    $stmt->bindParam(":id_Chat", $this->id_Chat);
    $stmt->bindParam(":id_Remitente", $id_Remitente);
    $stmt->bindParam(":mensaje", $mensaje);
    $stmt->bindParam(":encriptado", $encriptado);
    $stmt->bindParam(":tipo_Mensaje", $tipo_Mensaje);

    return $stmt->execute();
}
}
?>