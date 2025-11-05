<?php
/**
 * Modelo: Tienda
 * Descripción: Maneja la lógica de negocio de la tienda de iconos
 * - Obtener iconos disponibles
 * - Comprar iconos
 * - Obtener iconos del usuario
 * - Equipar/desequipar iconos
 */

class Tienda {
    private $conn;
    private $table_tienda = "Tienda_Iconos";
    private $table_usuario_iconos = "Usuario_Iconos";
    private $table_usuario = "Usuario";
    private $table_historial = "Historial_Puntos";

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Obtener todos los iconos disponibles en la tienda
     * @return array
     */
    public function obtenerIconosDisponibles() {
        $query = "SELECT id_Icono, nombre, descripcion, 
                         url_Imagen as emoji, precio_Puntos, disponible 
                  FROM " . $this->table_tienda . " 
                  WHERE disponible = TRUE 
                  ORDER BY precio_Puntos ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener iconos comprados por un usuario
     * @param int $id_Usuario
     * @return array
     */
    public function obtenerIconosUsuario($id_Usuario) {
        $query = "SELECT ui.id_Usuario_Icono, ui.id_Icono, ui.equipado,
                         ti.nombre, ti.descripcion, ti.url_Imagen as emoji, 
                         ti.precio_Puntos
                  FROM " . $this->table_usuario_iconos . " ui
                  INNER JOIN " . $this->table_tienda . " ti 
                      ON ui.id_Icono = ti.id_Icono
                  WHERE ui.id_Usuario = :id_Usuario
                  ORDER BY ui.equipado DESC, ti.precio_Puntos DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_Usuario', $id_Usuario);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Verificar si un usuario ya tiene un icono
     * @param int $id_Usuario
     * @param int $id_Icono
     * @return bool
     */
    public function usuarioTieneIcono($id_Usuario, $id_Icono) {
        $query = "SELECT COUNT(*) as total 
                  FROM " . $this->table_usuario_iconos . " 
                  WHERE id_Usuario = :id_Usuario AND id_Icono = :id_Icono";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_Usuario', $id_Usuario);
        $stmt->bindParam(':id_Icono', $id_Icono);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total'] > 0;
    }

    /**
     * Obtener información de un icono específico
     * @param int $id_Icono
     * @return array|null
     */
    public function obtenerIconoPorId($id_Icono) {
        $query = "SELECT id_Icono, nombre, descripcion, 
                         url_Imagen as emoji, precio_Puntos, disponible 
                  FROM " . $this->table_tienda . " 
                  WHERE id_Icono = :id_Icono";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_Icono', $id_Icono);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener puntos actuales de un usuario
     * @param int $id_Usuario
     * @return int
     */
    public function obtenerPuntosUsuario($id_Usuario) {
        $query = "SELECT Puntos FROM " . $this->table_usuario . " 
                  WHERE id_Usuario = :id_Usuario";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_Usuario', $id_Usuario);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? (int)$result['Puntos'] : 0;
    }

    /**
     * Comprar un icono
     * @param int $id_Usuario
     * @param int $id_Icono
     * @return array [success, message, data]
     */
    public function comprarIcono($id_Usuario, $id_Icono) {
        try {
            // Iniciar transacción
            $this->conn->beginTransaction();

            // 1. Verificar que el icono existe y está disponible
            $icono = $this->obtenerIconoPorId($id_Icono);
            if (!$icono) {
                throw new Exception("El icono no existe");
            }
            if (!$icono['disponible']) {
                throw new Exception("El icono no está disponible");
            }

            // 2. Verificar que el usuario no tiene ya este icono
            if ($this->usuarioTieneIcono($id_Usuario, $id_Icono)) {
                throw new Exception("Ya posees este icono");
            }

            // 3. Verificar que el usuario tiene puntos suficientes
            $puntosUsuario = $this->obtenerPuntosUsuario($id_Usuario);
            $precioIcono = (int)$icono['precio_Puntos'];

            if ($puntosUsuario < $precioIcono) {
                throw new Exception("Puntos insuficientes. Necesitas " . $precioIcono . " puntos");
            }

            // 4. Descontar puntos del usuario
            $nuevosPuntos = $puntosUsuario - $precioIcono;
            $queryUpdatePuntos = "UPDATE " . $this->table_usuario . " 
                                  SET Puntos = :puntos 
                                  WHERE id_Usuario = :id_Usuario";
            $stmt = $this->conn->prepare($queryUpdatePuntos);
            $stmt->bindParam(':puntos', $nuevosPuntos);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->execute();

            // 5. Registrar el icono comprado en Usuario_Iconos
            $queryInsertIcono = "INSERT INTO " . $this->table_usuario_iconos . " 
                                 (id_Usuario, id_Icono, equipado) 
                                 VALUES (:id_Usuario, :id_Icono, FALSE)";
            $stmt = $this->conn->prepare($queryInsertIcono);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->bindParam(':id_Icono', $id_Icono);
            $stmt->execute();

            // 6. Registrar en historial de puntos
            $razon = "Compra de icono: " . $icono['nombre'];
            $queryHistorial = "INSERT INTO " . $this->table_historial . " 
                               (id_Usuario, tipo_Accion, cantidad, razon, id_Referencia) 
                               VALUES (:id_Usuario, 'gastados_tienda', :cantidad, :razon, :id_Icono)";
            $stmt = $this->conn->prepare($queryHistorial);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->bindParam(':cantidad', $precioIcono);
            $stmt->bindParam(':razon', $razon);
            $stmt->bindParam(':id_Icono', $id_Icono);
            $stmt->execute();

            // Confirmar transacción
            $this->conn->commit();

            return [
                'success' => true,
                'message' => 'Icono comprado exitosamente',
                'data' => [
                    'icono' => $icono,
                    'puntos_restantes' => $nuevosPuntos,
                    'puntos_gastados' => $precioIcono
                ]
            ];

        } catch (Exception $e) {
            // Revertir transacción en caso de error
            $this->conn->rollBack();
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Equipar un icono (solo puede haber uno equipado a la vez)
     * @param int $id_Usuario
     * @param int $id_Icono
     * @return array [success, message, data]
     */
    public function equiparIcono($id_Usuario, $id_Icono) {
        try {
            // Iniciar transacción
            $this->conn->beginTransaction();

            // 1. Verificar que el usuario tiene este icono
            if (!$this->usuarioTieneIcono($id_Usuario, $id_Icono)) {
                throw new Exception("No posees este icono");
            }

            // 2. Obtener información del icono
            $icono = $this->obtenerIconoPorId($id_Icono);
            if (!$icono) {
                throw new Exception("El icono no existe");
            }

            // 3. Desequipar todos los iconos del usuario
            $queryDesequipar = "UPDATE " . $this->table_usuario_iconos . " 
                                SET equipado = FALSE 
                                WHERE id_Usuario = :id_Usuario";
            $stmt = $this->conn->prepare($queryDesequipar);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->execute();

            // 4. Equipar el icono seleccionado
            $queryEquipar = "UPDATE " . $this->table_usuario_iconos . " 
                             SET equipado = TRUE 
                             WHERE id_Usuario = :id_Usuario AND id_Icono = :id_Icono";
            $stmt = $this->conn->prepare($queryEquipar);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->bindParam(':id_Icono', $id_Icono);
            $stmt->execute();

            // 5. Actualizar IconoPerfil del usuario con el emoji
            $emoji = $icono['emoji'];
            $queryUpdatePerfil = "UPDATE " . $this->table_usuario . " 
                                  SET IconoPerfil = :emoji 
                                  WHERE id_Usuario = :id_Usuario";
            $stmt = $this->conn->prepare($queryUpdatePerfil);
            $stmt->bindParam(':emoji', $emoji);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->execute();

            // Confirmar transacción
            $this->conn->commit();

            return [
                'success' => true,
                'message' => 'Icono equipado exitosamente',
                'data' => [
                    'icono' => $icono,
                    'emoji_equipado' => $emoji
                ]
            ];

        } catch (Exception $e) {
            // Revertir transacción en caso de error
            $this->conn->rollBack();
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Desequipar el icono actual del usuario
     * @param int $id_Usuario
     * @return array [success, message]
     */
    public function desequiparIcono($id_Usuario) {
        try {
            // Iniciar transacción
            $this->conn->beginTransaction();

            // 1. Desequipar todos los iconos del usuario
            $queryDesequipar = "UPDATE " . $this->table_usuario_iconos . " 
                                SET equipado = FALSE 
                                WHERE id_Usuario = :id_Usuario";
            $stmt = $this->conn->prepare($queryDesequipar);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->execute();

            // 2. Restaurar icono por defecto en el perfil
            $iconoDefault = 'default_avatar.png';
            $queryUpdatePerfil = "UPDATE " . $this->table_usuario . " 
                                  SET IconoPerfil = :icono 
                                  WHERE id_Usuario = :id_Usuario";
            $stmt = $this->conn->prepare($queryUpdatePerfil);
            $stmt->bindParam(':icono', $iconoDefault);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->execute();

            // Confirmar transacción
            $this->conn->commit();

            return [
                'success' => true,
                'message' => 'Icono desequipado exitosamente'
            ];

        } catch (Exception $e) {
            // Revertir transacción en caso de error
            $this->conn->rollBack();
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Obtener el icono actualmente equipado por un usuario
     * @param int $id_Usuario
     * @return array|null
     */
    public function obtenerIconoEquipado($id_Usuario) {
        $query = "SELECT ui.id_Usuario_Icono, ui.id_Icono, 
                         ti.nombre, ti.url_Imagen as emoji, ti.precio_Puntos
                  FROM " . $this->table_usuario_iconos . " ui
                  INNER JOIN " . $this->table_tienda . " ti 
                      ON ui.id_Icono = ti.id_Icono
                  WHERE ui.id_Usuario = :id_Usuario AND ui.equipado = TRUE
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_Usuario', $id_Usuario);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>