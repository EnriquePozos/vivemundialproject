<?php
/**
 * Configuración de conexión a la base de datos MySQL
 * Base de datos: POI - Copa Mundial FIFA 2026
 */

class Database {
    private $host = "localhost";
    private $db_name = "POI";
    private $username = "root";
    private $password = "";
    private $conn;

    /**
     * Obtener conexión a la base de datos
     * @return PDO|null Objeto de conexión PDO
     */
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            
            // Configurar el charset UTF-8
            $this->conn->exec("set names utf8");
            
            // Configurar PDO para que lance excepciones en errores
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Configurar PDO para que devuelva arrays asociativos
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
        } catch(PDOException $e) {
            echo "Error de conexión: " . $e->getMessage();
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