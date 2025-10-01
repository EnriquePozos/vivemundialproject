<?php
/**
 * Script de prueba para verificar la conexión a la base de datos
 * Ejecutar desde navegador: http://localhost/backend/test_connection.php
 */

// Incluir el archivo de configuración de la base de datos
require_once 'config/database.php';

// Crear instancia de la clase Database
$database = new Database();
$conn = $database->getConnection();

// Verificar si la conexión fue exitosa
if ($conn !== null) {
    echo "<h2>✅ Conexión exitosa a la base de datos POI</h2>";
    
    try {
        // Probar una consulta simple
        $query = "SELECT COUNT(*) as total_usuarios FROM Usuario";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch();
        
        echo "<p>Total de usuarios en la base de datos: <strong>" . $result['total_usuarios'] . "</strong></p>";
        
        // Probar otras tablas
        $tables = ['Chats', 'Mensajes', 'Quinielas', 'Tareas', 'Tienda_Iconos'];
        echo "<h3>Tablas disponibles:</h3>";
        echo "<ul>";
        
        foreach ($tables as $table) {
            $query = "SELECT COUNT(*) as total FROM $table";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $result = $stmt->fetch();
            echo "<li>$table: {$result['total']} registros</li>";
        }
        
        echo "</ul>";
        
    } catch (PDOException $e) {
        echo "<p style='color: red;'>Error al ejecutar consulta: " . $e->getMessage() . "</p>";
    }
    
} else {
    echo "<h2>❌ Error al conectar con la base de datos</h2>";
    echo "<p>Verifica tu configuración en config/database.php</p>";
}

// Cerrar conexión
$database->closeConnection();
?>