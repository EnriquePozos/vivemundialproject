<?php
// backend/models/Quiniela.php

class Quiniela {
    private $conn;
    private $table_quinielas = 'quinielas';
    private $table_quinielas_chat = 'quinielas_chat';
    private $table_participaciones = 'participaciones_quiniela';
    private $table_historial = 'historial_puntos';

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Listar quinielas disponibles (pre-cargadas en BD)
     * Estas son las únicas que se pueden agregar a los chats
     */
public function listarDisponibles() {
    try {
        $query = "SELECT 
                    id_Quiniela,
                    nombre,
                    descripcion,
                    tipo,
                    activa
                  FROM " . $this->table_quinielas . " 
                  WHERE activa = 1
                  ORDER BY id_Quiniela ASC";
        
        error_log("📊 Query listarDisponibles: " . $query);
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $quinielas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log("📊 Total quinielas encontradas: " . count($quinielas));
        error_log("📊 Primera quiniela: " . json_encode($quinielas[0] ?? null));
        
        return $quinielas;
    } catch (PDOException $e) {
        error_log("❌ Error al listar quinielas disponibles: " . $e->getMessage());
        return [];
    }
}

    /**
     * Agregar quiniela existente a un chat
     * Cualquier miembro del chat puede hacerlo
     */
    public function agregarAChat($id_Quiniela, $id_Chat, $id_Usuario) {
        try {
            // Verificar que el usuario pertenece al chat
            if (!$this->perteneceAlChat($id_Usuario, $id_Chat)) {
                return ['success' => false, 'message' => 'No perteneces a este chat'];
            }

            // Verificar que la quiniela existe y está activa
            $checkQuiniela = "SELECT id_Quiniela FROM " . $this->table_quinielas . " 
                              WHERE id_Quiniela = :id_Quiniela AND activa = 1";
            $stmt = $this->conn->prepare($checkQuiniela);
            $stmt->bindParam(':id_Quiniela', $id_Quiniela);
            $stmt->execute();
            
            if ($stmt->rowCount() == 0) {
                return ['success' => false, 'message' => 'Quiniela no disponible'];
            }

            // Verificar que la quiniela no esté ya agregada al chat
            $checkExiste = "SELECT id_Quiniela_Chat FROM " . $this->table_quinielas_chat . " 
                            WHERE id_Chat = :id_Chat AND id_Quiniela = :id_Quiniela AND estado = 'activa'";
            $stmt = $this->conn->prepare($checkExiste);
            $stmt->bindParam(':id_Chat', $id_Chat);
            $stmt->bindParam(':id_Quiniela', $id_Quiniela);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                return ['success' => false, 'message' => 'Esta quiniela ya está activa en este chat'];
            }

            // Agregar quiniela al chat
            $query = "INSERT INTO " . $this->table_quinielas_chat . " 
                      (id_Chat, id_Quiniela, agregado_Por, estado, fecha_Agregado) 
                      VALUES (:id_Chat, :id_Quiniela, :agregado_Por, 'activa', NOW())";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_Chat', $id_Chat);
            $stmt->bindParam(':id_Quiniela', $id_Quiniela);
            $stmt->bindParam(':agregado_Por', $id_Usuario);
            
            if ($stmt->execute()) {
                return ['success' => true, 'id' => $this->conn->lastInsertId()];
            }
            
            return ['success' => false, 'message' => 'Error al agregar quiniela'];
        } catch (PDOException $e) {
            error_log("Error al agregar quiniela a chat: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Listar quinielas de un chat (solo las de ese chat específico)
     */
    public function listarPorChat($id_Chat) {
        try {
            $query = "SELECT 
                        qc.id_Quiniela_Chat,
                        qc.id_Quiniela,
                        qc.estado,
                        qc.fecha_Agregado,
                        qc.agregado_Por,
                        q.nombre,
                        q.descripcion,
                        q.tipo,
                        q.resultado,
                        u.nombre_Usuario AS agregador,
                        COUNT(DISTINCT pq.id_Participacion) as total_participantes,
                        SUM(pq.puntos_Apostados) as total_puntos_apostados
                      FROM " . $this->table_quinielas_chat . " qc
                      INNER JOIN " . $this->table_quinielas . " q ON qc.id_Quiniela = q.id_Quiniela
                      LEFT JOIN Usuario u ON qc.agregado_Por = u.id_Usuario
                      LEFT JOIN " . $this->table_participaciones . " pq ON qc.id_Quiniela_Chat = pq.id_Quiniela_Chat
                      WHERE qc.id_Chat = :id_Chat
                      GROUP BY qc.id_Quiniela_Chat
                      ORDER BY qc.fecha_Agregado DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_Chat', $id_Chat);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al listar quinielas: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Participar en una quiniela
     * Se descuentan los puntos inmediatamente
     */
    public function participar($id_Quiniela_Chat, $id_Usuario, $puntos_Apostados, $prediccion) {
        try {
            // Validar que puntos_Apostados sea mayor a 0
            if ($puntos_Apostados <= 0) {
                return ['success' => false, 'message' => 'Debes apostar al menos 1 punto'];
            }

            // Verificar que la quiniela está activa
            $checkQuiniela = "SELECT estado FROM " . $this->table_quinielas_chat . " 
                              WHERE id_Quiniela_Chat = :id_Quiniela_Chat";
            $stmt = $this->conn->prepare($checkQuiniela);
            $stmt->bindParam(':id_Quiniela_Chat', $id_Quiniela_Chat);
            $stmt->execute();
            $quiniela = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$quiniela || $quiniela['estado'] != 'activa') {
                return ['success' => false, 'message' => 'Quiniela no disponible'];
            }

            // Verificar que el usuario no haya participado ya
            $checkParticipacion = "SELECT id_Participacion FROM " . $this->table_participaciones . " 
                                   WHERE id_Quiniela_Chat = :id_Quiniela_Chat AND id_Usuario = :id_Usuario";
            $stmt = $this->conn->prepare($checkParticipacion);
            $stmt->bindParam(':id_Quiniela_Chat', $id_Quiniela_Chat);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                return ['success' => false, 'message' => 'Ya has participado en esta quiniela'];
            }

            // Verificar que el usuario tenga puntos suficientes
            $checkPuntos = "SELECT Puntos FROM Usuario WHERE id_Usuario = :id_Usuario";
            $stmt = $this->conn->prepare($checkPuntos);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->execute();
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$usuario || $usuario['Puntos'] <= 0) {
                return ['success' => false, 'message' => 'No tienes puntos disponibles'];
            }

            if ($usuario['Puntos'] < $puntos_Apostados) {
                return ['success' => false, 'message' => 'No tienes suficientes puntos'];
            }

            // Iniciar transacción
            $this->conn->beginTransaction();

            // Descontar puntos del usuario
            $updatePuntos = "UPDATE Usuario SET Puntos = Puntos - :puntos WHERE id_Usuario = :id_Usuario";
            $stmt = $this->conn->prepare($updatePuntos);
            $stmt->bindParam(':puntos', $puntos_Apostados);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->execute();

            // Registrar participación
            $query = "INSERT INTO " . $this->table_participaciones . " 
                      (id_Quiniela_Chat, id_Usuario, puntos_Apostados, prediccion, fecha_Participacion) 
                      VALUES (:id_Quiniela_Chat, :id_Usuario, :puntos_Apostados, :prediccion, NOW())";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_Quiniela_Chat', $id_Quiniela_Chat);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->bindParam(':puntos_Apostados', $puntos_Apostados);
            $stmt->bindParam(':prediccion', $prediccion);
            $stmt->execute();
            
            $id_Participacion = $this->conn->lastInsertId();

            // Registrar en historial de puntos
            $historial = "INSERT INTO " . $this->table_historial . " 
                          (id_Usuario, tipo_Accion, cantidad, razon, id_Referencia, fecha) 
                          VALUES (:id_Usuario, 'gasto', :cantidad, 'Apuesta en quiniela', :id_Referencia, NOW())";
            $stmt = $this->conn->prepare($historial);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->bindParam(':cantidad', $puntos_Apostados);
            $stmt->bindParam(':id_Referencia', $id_Participacion);
            $stmt->execute();

            $this->conn->commit();
            
            return ['success' => true, 'id' => $id_Participacion];
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("Error al participar en quiniela: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Finalizar quiniela y declarar ganadores
     * Solo puede hacerlo quien agregó la quiniela
     * Premio: Puntos apostados × 1.5
     */
    public function finalizar($id_Quiniela_Chat, $resultado_Real, $id_Usuario) {
        try {
            // Verificar que el usuario sea quien agregó la quiniela
            $check = "SELECT agregado_Por FROM " . $this->table_quinielas_chat . " 
                      WHERE id_Quiniela_Chat = :id_Quiniela_Chat";
            $stmt = $this->conn->prepare($check);
            $stmt->bindParam(':id_Quiniela_Chat', $id_Quiniela_Chat);
            $stmt->execute();
            $quiniela = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$quiniela) {
                return ['success' => false, 'message' => 'Quiniela no encontrada'];
            }

            if ($quiniela['agregado_Por'] != $id_Usuario) {
                return ['success' => false, 'message' => 'Solo quien agregó la quiniela puede finalizarla'];
            }

            // Iniciar transacción
            $this->conn->beginTransaction();

            // Actualizar estado de quiniela en chat (solo este chat específico)
            $updateEstado = "UPDATE " . $this->table_quinielas_chat . " 
                             SET estado = 'finalizada', resultado = :resultado
                             WHERE id_Quiniela_Chat = :id_Quiniela_Chat";
            $stmt = $this->conn->prepare($updateEstado);
            $stmt->bindParam(':resultado', $resultado_Real);
            $stmt->bindParam(':id_Quiniela_Chat', $id_Quiniela_Chat);
            $stmt->execute();

            // Obtener ganadores (quienes acertaron)
            $getGanadores = "SELECT id_Participacion, id_Usuario, puntos_Apostados 
                             FROM " . $this->table_participaciones . " 
                             WHERE id_Quiniela_Chat = :id_Quiniela_Chat 
                             AND prediccion = :resultado";
            $stmt = $this->conn->prepare($getGanadores);
            $stmt->bindParam(':id_Quiniela_Chat', $id_Quiniela_Chat);
            $stmt->bindParam(':resultado', $resultado_Real);
            $stmt->execute();
            $ganadores = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $total_ganadores = count($ganadores);
            $info_ganadores = [];

            // Dar premio a cada ganador: puntos apostados × 1.5
            if ($total_ganadores > 0) {
                foreach ($ganadores as $ganador) {
                    $premio = floor($ganador['puntos_Apostados'] * 1.5);
                    
                    // Dar puntos al ganador
                    $updatePuntos = "UPDATE Usuario SET Puntos = Puntos + :puntos WHERE id_Usuario = :id_Usuario";
                    $stmt = $this->conn->prepare($updatePuntos);
                    $stmt->bindParam(':puntos', $premio);
                    $stmt->bindParam(':id_Usuario', $ganador['id_Usuario']);
                    $stmt->execute();

                    // Registrar en historial
                    $historial = "INSERT INTO " . $this->table_historial . " 
                                  (id_Usuario, tipo_Accion, cantidad, razon, id_Referencia, fecha) 
                                  VALUES (:id_Usuario, 'ganancia', :cantidad, 'Ganancia por quiniela (x1.5)', :id_Referencia, NOW())";
                    $stmt = $this->conn->prepare($historial);
                    $stmt->bindParam(':id_Usuario', $ganador['id_Usuario']);
                    $stmt->bindParam(':cantidad', $premio);
                    $stmt->bindParam(':id_Referencia', $ganador['id_Participacion']);
                    $stmt->execute();

                    // Guardar info del ganador
                    $getNombre = "SELECT nombre_Usuario FROM Usuario WHERE id_Usuario = :id_Usuario";
                    $stmt = $this->conn->prepare($getNombre);
                    $stmt->bindParam(':id_Usuario', $ganador['id_Usuario']);
                    $stmt->execute();
                    $nombreGanador = $stmt->fetch(PDO::FETCH_ASSOC);

                    $info_ganadores[] = [
                        'id_Usuario' => $ganador['id_Usuario'],
                        'nombre' => $nombreGanador['nombre_Usuario'],
                        'apostado' => $ganador['puntos_Apostados'],
                        'premio' => $premio
                    ];
                }
            }

            $this->conn->commit();
            
            return [
                'success' => true, 
                'total_ganadores' => $total_ganadores,
                'ganadores' => $info_ganadores,
                'resultado' => $resultado_Real
            ];
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("Error al finalizar quiniela: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Obtener participación de un usuario en una quiniela específica
     */
    public function obtenerParticipacion($id_Quiniela_Chat, $id_Usuario) {
        try {
            $query = "SELECT 
                        pq.*,
                        u.nombre_Usuario,
                        u.Puntos as puntos_actuales
                      FROM " . $this->table_participaciones . " pq
                      INNER JOIN Usuario u ON pq.id_Usuario = u.id_Usuario
                      WHERE pq.id_Quiniela_Chat = :id_Quiniela_Chat 
                      AND pq.id_Usuario = :id_Usuario";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_Quiniela_Chat', $id_Quiniela_Chat);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener participación: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Listar todas las participaciones de una quiniela
     */
    public function listarParticipaciones($id_Quiniela_Chat) {
        try {
            $query = "SELECT 
                        pq.*,
                        u.nombre_Usuario,
                        u.IconoPerfil
                      FROM " . $this->table_participaciones . " pq
                      INNER JOIN Usuario u ON pq.id_Usuario = u.id_Usuario
                      WHERE pq.id_Quiniela_Chat = :id_Quiniela_Chat
                      ORDER BY pq.fecha_Participacion DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_Quiniela_Chat', $id_Quiniela_Chat);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al listar participaciones: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Verificar si el usuario pertenece al chat
     */
    public function perteneceAlChat($id_Usuario, $id_Chat) {
        try {
            $query = "SELECT id_Part_Chat FROM Participantes_Chat 
                      WHERE id_Usuario = :id_Usuario AND id_Chat = :id_Chat";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_Usuario', $id_Usuario);
            $stmt->bindParam(':id_Chat', $id_Chat);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            return false;
        }
    }

    /**
     * Obtener detalles completos de una quiniela en un chat
     */
    public function obtenerDetalles($id_Quiniela_Chat) {
        try {
            $query = "SELECT 
                        qc.*,
                        q.nombre,
                        q.descripcion,
                        q.tipo,
                        u.nombre_Usuario AS agregador,
                        COUNT(DISTINCT pq.id_Participacion) as total_participantes,
                        SUM(pq.puntos_Apostados) as total_puntos_apostados
                      FROM " . $this->table_quinielas_chat . " qc
                      INNER JOIN " . $this->table_quinielas . " q ON qc.id_Quiniela = q.id_Quiniela
                      LEFT JOIN Usuario u ON qc.agregado_Por = u.id_Usuario
                      LEFT JOIN " . $this->table_participaciones . " pq ON qc.id_Quiniela_Chat = pq.id_Quiniela_Chat
                      WHERE qc.id_Quiniela_Chat = :id_Quiniela_Chat
                      GROUP BY qc.id_Quiniela_Chat";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_Quiniela_Chat', $id_Quiniela_Chat);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error al obtener detalles de quiniela: " . $e->getMessage());
            return null;
        }
    }
}
?>