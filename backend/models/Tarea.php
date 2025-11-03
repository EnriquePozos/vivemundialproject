<?php
/**
 * Modelo Tarea
 * Maneja todas las operaciones CRUD de tareas
 */

class Tarea {
    private $conn;
    private $table_name = "Tareas";
    private $table_historial = "Historial_Puntos";
    private $table_usuario = "Usuario";

    public $id_Tarea;
    public $id_Chat;
    public $titulo;
    public $descripcion;
    public $creado_Por;
    public $estado;
    public $puntos_Recompensa;
    public $completada_Por;

    /**
     * Constructor
     * @param PDO $db Conexión a la base de datos
     */
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Crear una nueva tarea
     * @return int|false ID de la tarea creada o false si falla
     */
    public function crear() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (id_Chat, titulo, descripcion, creado_Por, estado, puntos_Recompensa) 
                  VALUES 
                  (:id_Chat, :titulo, :descripcion, :creado_Por, :estado, :puntos_Recompensa)";

        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->id_Chat = htmlspecialchars(strip_tags($this->id_Chat));
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->creado_Por = htmlspecialchars(strip_tags($this->creado_Por));
        $this->estado = $this->estado ?? 'pendiente';
        $this->puntos_Recompensa = $this->puntos_Recompensa ?? 10;

        // Bind de parámetros
        $stmt->bindParam(':id_Chat', $this->id_Chat);
        $stmt->bindParam(':titulo', $this->titulo);
        $stmt->bindParam(':descripcion', $this->descripcion);
        $stmt->bindParam(':creado_Por', $this->creado_Por);
        $stmt->bindParam(':estado', $this->estado);
        $stmt->bindParam(':puntos_Recompensa', $this->puntos_Recompensa);

        if ($stmt->execute()) {
            $this->id_Tarea = $this->conn->lastInsertId();
            return $this->id_Tarea;
        }

        return false;
    }

    /**
     * Obtener todas las tareas de un chat
     * @param int $id_Chat ID del chat
     * @return array Array de tareas con información del creador
     */
    public function obtenerPorChat($id_Chat) {
        $query = "SELECT 
                    t.*,
                    u_creador.nombre_Usuario as creador_nombre,
                    u_completo.nombre_Usuario as completada_por_nombre
                  FROM " . $this->table_name . " t
                  LEFT JOIN " . $this->table_usuario . " u_creador 
                    ON t.creado_Por = u_creador.id_Usuario
                  LEFT JOIN " . $this->table_usuario . " u_completo 
                    ON t.completada_Por = u_completo.id_Usuario
                  WHERE t.id_Chat = :id_Chat
                  ORDER BY 
                    CASE WHEN t.estado = 'pendiente' THEN 0 ELSE 1 END,
                    t.id_Tarea DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_Chat', $id_Chat);
        $stmt->execute();

        $tareas = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tareas[] = [
                'id_Tarea' => (int)$row['id_Tarea'],
                'id_Chat' => (int)$row['id_Chat'],
                'titulo' => $row['titulo'],
                'descripcion' => $row['descripcion'],
                'creado_Por' => (int)$row['creado_Por'],
                'creador_nombre' => $row['creador_nombre'],
                'estado' => $row['estado'],
                'puntos_Recompensa' => (int)$row['puntos_Recompensa'],
                'completada_Por' => $row['completada_Por'] ? (int)$row['completada_Por'] : null,
                'completada_por_nombre' => $row['completada_por_nombre']
            ];
        }

        return $tareas;
    }

    /**
     * Completar una tarea
     * @param int $id_Tarea ID de la tarea
     * @param int $id_Usuario ID del usuario que completa la tarea
     * @return bool
     */
    public function completar($id_Tarea, $id_Usuario) {
        // Iniciar transacción
        $this->conn->beginTransaction();

        try {
            // 1. Obtener datos de la tarea
            $query = "SELECT puntos_Recompensa, id_Chat, titulo 
                      FROM " . $this->table_name . " 
                      WHERE id_Tarea = :id_Tarea AND estado = 'pendiente'";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_Tarea', $id_Tarea);
            $stmt->execute();

            $tarea = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$tarea) {
                $this->conn->rollBack();
                return false;
            }

            // 2. Actualizar estado de la tarea
            $query = "UPDATE " . $this->table_name . " 
                      SET estado = 'completada', 
                          completada_Por = :completada_Por 
                      WHERE id_Tarea = :id_Tarea";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':completada_Por', $id_Usuario);
            $stmt->bindParam(':id_Tarea', $id_Tarea);
            $stmt->execute();

            // 3. Sumar puntos al usuario
            $query = "UPDATE " . $this->table_usuario . " 
                      SET Puntos = Puntos + :puntos 
                      WHERE id_Usuario = :id_Usuario";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':puntos', $tarea['puntos_Recompensa']);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->execute();

            // 4. Registrar en historial de puntos
            $query = "INSERT INTO " . $this->table_historial . " 
                      (id_Usuario, tipo_Accion, cantidad, razon, id_Referencia) 
                      VALUES 
                      (:id_Usuario, 'ganados_tarea', :cantidad, :razon, :id_Referencia)";

            $stmt = $this->conn->prepare($query);
            $razon = "Tarea completada: " . $tarea['titulo'];
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->bindParam(':cantidad', $tarea['puntos_Recompensa']);
            $stmt->bindParam(':razon', $razon);
            $stmt->bindParam(':id_Referencia', $id_Tarea);
            $stmt->execute();

            // Confirmar transacción
            $this->conn->commit();
            return true;

        } catch (Exception $e) {
            // Revertir cambios si hay error
            $this->conn->rollBack();
            return false;
        }
    }

    /**
     * Eliminar una tarea
     * @param int $id_Tarea ID de la tarea
     * @param int $id_Usuario ID del usuario que intenta eliminar (debe ser el creador)
     * @return bool
     */
    public function eliminar($id_Tarea, $id_Usuario) {
        // Verificar que el usuario sea el creador de la tarea
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE id_Tarea = :id_Tarea 
                  AND creado_Por = :creado_Por";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_Tarea', $id_Tarea);
        $stmt->bindParam(':creado_Por', $id_Usuario);

        return $stmt->execute() && $stmt->rowCount() > 0;
    }

    /**
     * Verificar si una tarea pertenece a un chat
     * @param int $id_Tarea ID de la tarea
     * @param int $id_Chat ID del chat
     * @return bool
     */
    public function perteneceAlChat($id_Tarea, $id_Chat) {
        $query = "SELECT id_Tarea 
                  FROM " . $this->table_name . " 
                  WHERE id_Tarea = :id_Tarea 
                  AND id_Chat = :id_Chat";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_Tarea', $id_Tarea);
        $stmt->bindParam(':id_Chat', $id_Chat);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    /**
     * Obtener una tarea por ID
     * @param int $id_Tarea ID de la tarea
     * @return array|false
     */
    public function obtenerPorId($id_Tarea) {
        $query = "SELECT 
                    t.*,
                    u_creador.nombre_Usuario as creador_nombre,
                    u_completo.nombre_Usuario as completada_por_nombre
                  FROM " . $this->table_name . " t
                  LEFT JOIN " . $this->table_usuario . " u_creador 
                    ON t.creado_Por = u_creador.id_Usuario
                  LEFT JOIN " . $this->table_usuario . " u_completo 
                    ON t.completada_Por = u_completo.id_Usuario
                  WHERE t.id_Tarea = :id_Tarea";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_Tarea', $id_Tarea);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return [
                'id_Tarea' => (int)$row['id_Tarea'],
                'id_Chat' => (int)$row['id_Chat'],
                'titulo' => $row['titulo'],
                'descripcion' => $row['descripcion'],
                'creado_Por' => (int)$row['creado_Por'],
                'creador_nombre' => $row['creador_nombre'],
                'estado' => $row['estado'],
                'puntos_Recompensa' => (int)$row['puntos_Recompensa'],
                'completada_Por' => $row['completada_Por'] ? (int)$row['completada_Por'] : null,
                'completada_por_nombre' => $row['completada_por_nombre']
            ];
        }

        return false;
    }

    /**
     * Contar tareas pendientes de un chat
     * @param int $id_Chat ID del chat
     * @return int
     */
    public function contarPendientes($id_Chat) {
        $query = "SELECT COUNT(*) as total 
                  FROM " . $this->table_name . " 
                  WHERE id_Chat = :id_Chat 
                  AND estado = 'pendiente'";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_Chat', $id_Chat);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)$row['total'];
    }
}
?>