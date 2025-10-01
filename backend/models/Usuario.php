<?php
/**
 * Modelo Usuario
 * Maneja todas las operaciones relacionadas con usuarios
 */

class Usuario {
    private $conn;
    private $table_name = "Usuario";

    public $id_Usuario;
    public $nombre_Usuario;
    public $Correo;
    public $Contrasenia;
    public $Estado;
    public $Puntos;
    public $IconoPerfil;
    public $id_Socket;

    /**
     * Constructor
     * @param PDO $db Conexión a la base de datos
     */
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Crear un nuevo usuario (Registro)
     * @return bool
     */
    public function crear() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (nombre_Usuario, Correo, Contrasenia, Estado, Puntos, IconoPerfil) 
                  VALUES 
                  (:nombre_Usuario, :Correo, :Contrasenia, :Estado, :Puntos, :IconoPerfil)";

        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->nombre_Usuario = htmlspecialchars(strip_tags($this->nombre_Usuario));
        $this->Correo = htmlspecialchars(strip_tags($this->Correo));
        $this->Contrasenia = password_hash($this->Contrasenia, PASSWORD_BCRYPT);
        $this->Estado = $this->Estado ?? false;
        $this->Puntos = $this->Puntos ?? 0;
        $this->IconoPerfil = $this->IconoPerfil ?? 'default_avatar.png';

        // Bind de parámetros
        $stmt->bindParam(":nombre_Usuario", $this->nombre_Usuario);
        $stmt->bindParam(":Correo", $this->Correo);
        $stmt->bindParam(":Contrasenia", $this->Contrasenia);
        $stmt->bindParam(":Estado", $this->Estado);
        $stmt->bindParam(":Puntos", $this->Puntos);
        $stmt->bindParam(":IconoPerfil", $this->IconoPerfil);

        if ($stmt->execute()) {
            $this->id_Usuario = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    /**
     * Buscar usuario por correo electrónico
     * @return bool
     */
    public function buscarPorCorreo() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE Correo = :Correo 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":Correo", $this->Correo);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->id_Usuario = $row['id_Usuario'];
            $this->nombre_Usuario = $row['nombre_Usuario'];
            $this->Correo = $row['Correo'];
            $this->Contrasenia = $row['Contrasenia'];
            $this->Estado = $row['Estado'];
            $this->Puntos = $row['Puntos'];
            $this->IconoPerfil = $row['IconoPerfil'];
            $this->id_Socket = $row['id_Socket'];
            
            return true;
        }

        return false;
    }

    /**
     * Buscar usuario por ID
     * @return bool
     */
    public function buscarPorId() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE id_Usuario = :id_Usuario 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_Usuario", $this->id_Usuario);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->nombre_Usuario = $row['nombre_Usuario'];
            $this->Correo = $row['Correo'];
            $this->Estado = $row['Estado'];
            $this->Puntos = $row['Puntos'];
            $this->IconoPerfil = $row['IconoPerfil'];
            $this->id_Socket = $row['id_Socket'];
            
            return true;
        }

        return false;
    }

    /**
     * Verificar contraseña
     * @param string $password Contraseña en texto plano
     * @return bool
     */
    public function verificarContrasenia($password) {
        return password_verify($password, $this->Contrasenia);
    }

    /**
     * Verificar si el correo ya existe
     * @return bool
     */
    public function correoExiste() {
        $query = "SELECT id_Usuario FROM " . $this->table_name . " 
                  WHERE Correo = :Correo 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":Correo", $this->Correo);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    /**
     * Actualizar estado del usuario (online/offline)
     * @return bool
     */
    public function actualizarEstado() {
        $query = "UPDATE " . $this->table_name . " 
                  SET Estado = :Estado 
                  WHERE id_Usuario = :id_Usuario";

        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":Estado", $this->Estado);
        $stmt->bindParam(":id_Usuario", $this->id_Usuario);

        return $stmt->execute();
    }

    /**
     * Actualizar socket ID
     * @return bool
     */
    public function actualizarSocket() {
        $query = "UPDATE " . $this->table_name . " 
                  SET id_Socket = :id_Socket 
                  WHERE id_Usuario = :id_Usuario";

        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":id_Socket", $this->id_Socket);
        $stmt->bindParam(":id_Usuario", $this->id_Usuario);

        return $stmt->execute();
    }

    /**
     * Actualizar puntos del usuario
     * @return bool
     */
    public function actualizarPuntos() {
        $query = "UPDATE " . $this->table_name . " 
                  SET Puntos = :Puntos 
                  WHERE id_Usuario = :id_Usuario";

        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":Puntos", $this->Puntos);
        $stmt->bindParam(":id_Usuario", $this->id_Usuario);

        return $stmt->execute();
    }

    /**
     * Actualizar ícono de perfil
     * @return bool
     */
    public function actualizarIcono() {
        $query = "UPDATE " . $this->table_name . " 
                  SET IconoPerfil = :IconoPerfil 
                  WHERE id_Usuario = :id_Usuario";

        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":IconoPerfil", $this->IconoPerfil);
        $stmt->bindParam(":id_Usuario", $this->id_Usuario);

        return $stmt->execute();
    }

    /**
     * Obtener todos los usuarios
     * @return array
     */
    public function obtenerTodos() {
        $query = "SELECT id_Usuario, nombre_Usuario, Correo, Estado, Puntos, IconoPerfil 
                  FROM " . $this->table_name . " 
                  ORDER BY nombre_Usuario ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener datos públicos del usuario (sin contraseña)
     * @return array
     */
    public function obtenerDatosPublicos() {
        return [
            'id_Usuario' => $this->id_Usuario,
            'nombre_Usuario' => $this->nombre_Usuario,
            'Correo' => $this->Correo,
            'Estado' => (bool)$this->Estado,
            'Puntos' => (int)$this->Puntos,
            'IconoPerfil' => $this->IconoPerfil,
            'id_Socket' => $this->id_Socket
        ];
    }
}
?>