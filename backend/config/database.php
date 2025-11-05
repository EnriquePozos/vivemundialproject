<?php
/**
 * Clase Database
 * Maneja la conexión a la base de datos MySQL
 * Configurado con soporte completo UTF-8 para emojis
 */

class Database {
    // Configuración de la base de datos
    private $host = "localhost";
    private $db_name = "POI";
    private $username = "root";
    private $password = "";
    public $conn;

    /**
     * Obtener conexión a la base de datos
     * @return PDO|null
     */
    public function getConnection() {
        $this->conn = null;

        try {
            // Crear conexión PDO con charset UTF-8MB4
            $this->conn = new PDO(
                "mysql:host=" . $this->host . 
                ";dbname=" . $this->db_name . 
                ";charset=utf8mb4",  // Soporte completo para emojis
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                )
            );
            
            // Forzar UTF-8MB4 en la conexión (redundancia para compatibilidad)
            $this->conn->exec("SET NAMES utf8mb4");
            $this->conn->exec("SET CHARACTER SET utf8mb4");
            
        } catch(PDOException $exception) {
            echo "Error de conexión: " . $exception->getMessage();
        }

        return $this->conn;
    }

    /**
     * Cerrar conexión a la base de datos
     */
    public function closeConnection() {
        $this->conn = null;
    }
}
?>