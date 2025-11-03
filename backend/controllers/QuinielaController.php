<?php
// backend/controllers/QuinielaController.php

require_once __DIR__ . '/../models/Quiniela.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class QuinielaController {
    private $quinielaModel;
    private $id_Usuario;

    public function __construct($db, $id_Usuario) {
        $this->quinielaModel = new Quiniela($db);
        $this->id_Usuario = $id_Usuario;
    }

    /**
     * Listar quinielas disponibles (pre-cargadas en BD)
     * GET /api/quinielas/disponibles
     */
    public function listarDisponibles() {
        try {
            $quinielas = $this->quinielaModel->listarDisponibles();
            
            Response::success('Quinielas disponibles obtenidas', [
                'quinielas' => $quinielas,
                'total' => count($quinielas)
            ]);
        } catch (Exception $e) {
            error_log("Error en listarDisponibles: " . $e->getMessage());
            Response::error('Error al obtener quinielas disponibles', 500);
        }
    }

    /**
     * Agregar quiniela existente a un chat
     * POST /api/quinielas/agregar
     */
    public function agregar() {
        try {
            // Obtener datos del body
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validar campos requeridos
            $camposRequeridos = ['id_Quiniela', 'id_Chat'];
            $validacion = Validator::validarCamposRequeridos($data, $camposRequeridos);
            
            if (!$validacion['valido']) {
                Response::error($validacion['mensaje'], 400);
                return;
            }

            $id_Quiniela = $data['id_Quiniela'];
            $id_Chat = $data['id_Chat'];

            // Validar que sean números enteros
            if (!is_numeric($id_Quiniela) || !is_numeric($id_Chat)) {
                Response::error('IDs deben ser numéricos', 400);
                return;
            }

            // Agregar quiniela al chat
            $resultado = $this->quinielaModel->agregarAChat($id_Quiniela, $id_Chat, $this->id_Usuario);
            
            if ($resultado['success']) {
                // Obtener detalles de la quiniela agregada
                $detalles = $this->quinielaModel->obtenerDetalles($resultado['id']);
                
                Response::success('Quiniela agregada al chat exitosamente', [
                    'id_Quiniela_Chat' => $resultado['id'],
                    'quiniela' => $detalles
                ], 201);
            } else {
                Response::error($resultado['message'], 400);
            }
        } catch (Exception $e) {
            error_log("Error en agregar: " . $e->getMessage());
            Response::error('Error al agregar quiniela al chat', 500);
        }
    }

    /**
     * Listar quinielas de un chat específico
     * GET /api/quinielas/listar?id_Chat=X
     */
    public function listar() {
        try {
            // Validar parámetro id_Chat
            if (!isset($_GET['id_Chat']) || empty($_GET['id_Chat'])) {
                Response::error('Falta el parámetro id_Chat', 400);
                return;
            }

            $id_Chat = $_GET['id_Chat'];

            // Validar que sea numérico
            if (!is_numeric($id_Chat)) {
                Response::error('id_Chat debe ser numérico', 400);
                return;
            }

            // Verificar que el usuario pertenece al chat
            if (!$this->quinielaModel->perteneceAlChat($this->id_Usuario, $id_Chat)) {
                Response::error('No tienes acceso a este chat', 403);
                return;
            }

            // Obtener quinielas del chat
            $quinielas = $this->quinielaModel->listarPorChat($id_Chat);
            
            Response::success('Quinielas del chat obtenidas', [
                'quinielas' => $quinielas,
                'total' => count($quinielas)
            ]);
        } catch (Exception $e) {
            error_log("Error en listar: " . $e->getMessage());
            Response::error('Error al obtener quinielas del chat', 500);
        }
    }

    /**
     * Participar en una quiniela
     * POST /api/quinielas/participar
     */
    public function participar() {
        try {
            // Obtener datos del body
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validar campos requeridos
            $camposRequeridos = ['id_Quiniela_Chat', 'puntos_Apostados', 'prediccion'];
            $validacion = Validator::validarCamposRequeridos($data, $camposRequeridos);
            
            if (!$validacion['valido']) {
                Response::error($validacion['mensaje'], 400);
                return;
            }

            $id_Quiniela_Chat = $data['id_Quiniela_Chat'];
            $puntos_Apostados = $data['puntos_Apostados'];
            $prediccion = $data['prediccion'];

            // Validar tipos de datos
            if (!is_numeric($id_Quiniela_Chat) || !is_numeric($puntos_Apostados)) {
                Response::error('IDs y puntos deben ser numéricos', 400);
                return;
            }

            // Validar que puntos sea mayor a 0
            if ($puntos_Apostados <= 0) {
                Response::error('Debes apostar al menos 1 punto', 400);
                return;
            }

            // Validar predicción (no puede estar vacía)
            if (empty(trim($prediccion))) {
                Response::error('Debes hacer una predicción', 400);
                return;
            }

            // Participar en la quiniela
            $resultado = $this->quinielaModel->participar(
                $id_Quiniela_Chat, 
                $this->id_Usuario, 
                $puntos_Apostados, 
                $prediccion
            );
            
            if ($resultado['success']) {
                // Obtener detalles actualizados de la quiniela
                $detalles = $this->quinielaModel->obtenerDetalles($id_Quiniela_Chat);
                
                Response::success('Participación registrada exitosamente', [
                    'id_Participacion' => $resultado['id'],
                    'puntos_apostados' => $puntos_Apostados,
                    'prediccion' => $prediccion,
                    'quiniela' => $detalles
                ], 201);
            } else {
                Response::error($resultado['message'], 400);
            }
        } catch (Exception $e) {
            error_log("Error en participar: " . $e->getMessage());
            Response::error('Error al registrar participación', 500);
        }
    }

    /**
     * Finalizar quiniela y declarar ganadores
     * PUT /api/quinielas/finalizar
     */
    public function finalizar() {
        try {
            // Obtener datos del body
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validar campos requeridos
            $camposRequeridos = ['id_Quiniela_Chat', 'resultado'];
            $validacion = Validator::validarCamposRequeridos($data, $camposRequeridos);
            
            if (!$validacion['valido']) {
                Response::error($validacion['mensaje'], 400);
                return;
            }

            $id_Quiniela_Chat = $data['id_Quiniela_Chat'];
            $resultado = $data['resultado'];

            // Validar tipos de datos
            if (!is_numeric($id_Quiniela_Chat)) {
                Response::error('ID debe ser numérico', 400);
                return;
            }

            // Validar resultado (no puede estar vacío)
            if (empty(trim($resultado))) {
                Response::error('Debes especificar un resultado', 400);
                return;
            }

            // Finalizar quiniela
            $resultadoFinal = $this->quinielaModel->finalizar(
                $id_Quiniela_Chat, 
                $resultado, 
                $this->id_Usuario
            );
            
            if ($resultadoFinal['success']) {
                // Obtener detalles actualizados
                $detalles = $this->quinielaModel->obtenerDetalles($id_Quiniela_Chat);
                
                Response::success('Quiniela finalizada exitosamente', [
                    'resultado' => $resultadoFinal['resultado'],
                    'total_ganadores' => $resultadoFinal['total_ganadores'],
                    'ganadores' => $resultadoFinal['ganadores'],
                    'quiniela' => $detalles
                ]);
            } else {
                Response::error($resultadoFinal['message'], 400);
            }
        } catch (Exception $e) {
            error_log("Error en finalizar: " . $e->getMessage());
            Response::error('Error al finalizar quiniela', 500);
        }
    }

    /**
     * Obtener detalles de una quiniela específica
     * GET /api/quinielas/detalles?id=X
     */
    public function obtenerDetalles() {
        try {
            // Validar parámetro id
            if (!isset($_GET['id']) || empty($_GET['id'])) {
                Response::error('Falta el parámetro id', 400);
                return;
            }

            $id_Quiniela_Chat = $_GET['id'];

            // Validar que sea numérico
            if (!is_numeric($id_Quiniela_Chat)) {
                Response::error('ID debe ser numérico', 400);
                return;
            }

            // Obtener detalles
            $detalles = $this->quinielaModel->obtenerDetalles($id_Quiniela_Chat);
            
            if (!$detalles) {
                Response::error('Quiniela no encontrada', 404);
                return;
            }

            // Obtener participaciones
            $participaciones = $this->quinielaModel->listarParticipaciones($id_Quiniela_Chat);
            
            // Verificar si el usuario actual participó
            $miParticipacion = $this->quinielaModel->obtenerParticipacion($id_Quiniela_Chat, $this->id_Usuario);

            Response::success('Detalles de quiniela obtenidos', [
                'quiniela' => $detalles,
                'participaciones' => $participaciones,
                'mi_participacion' => $miParticipacion,
                'total_participaciones' => count($participaciones),
                'puedo_finalizar' => ($detalles['agregado_Por'] == $this->id_Usuario && $detalles['estado'] == 'activa')
            ]);
        } catch (Exception $e) {
            error_log("Error en obtenerDetalles: " . $e->getMessage());
            Response::error('Error al obtener detalles de la quiniela', 500);
        }
    }

    /**
     * Obtener participaciones de una quiniela
     * GET /api/quinielas/participaciones?id=X
     */
    public function listarParticipaciones() {
        try {
            // Validar parámetro id
            if (!isset($_GET['id']) || empty($_GET['id'])) {
                Response::error('Falta el parámetro id', 400);
                return;
            }

            $id_Quiniela_Chat = $_GET['id'];

            // Validar que sea numérico
            if (!is_numeric($id_Quiniela_Chat)) {
                Response::error('ID debe ser numérico', 400);
                return;
            }

            // Obtener participaciones
            $participaciones = $this->quinielaModel->listarParticipaciones($id_Quiniela_Chat);
            
            Response::success('Participaciones obtenidas', [
                'participaciones' => $participaciones,
                'total' => count($participaciones)
            ]);
        } catch (Exception $e) {
            error_log("Error en listarParticipaciones: " . $e->getMessage());
            Response::error('Error al obtener participaciones', 500);
        }
    }

    /**
     * Obtener mi participación en una quiniela
     * GET /api/quinielas/mi-participacion?id=X
     */
    public function obtenerMiParticipacion() {
        try {
            // Validar parámetro id
            if (!isset($_GET['id']) || empty($_GET['id'])) {
                Response::error('Falta el parámetro id', 400);
                return;
            }

            $id_Quiniela_Chat = $_GET['id'];

            // Validar que sea numérico
            if (!is_numeric($id_Quiniela_Chat)) {
                Response::error('ID debe ser numérico', 400);
                return;
            }

            // Obtener mi participación
            $participacion = $this->quinielaModel->obtenerParticipacion($id_Quiniela_Chat, $this->id_Usuario);
            
            if (!$participacion) {
                Response::success('No has participado en esta quiniela', [
                    'participacion' => null,
                    'ha_participado' => false
                ]);
                return;
            }

            Response::success('Participación obtenida', [
                'participacion' => $participacion,
                'ha_participado' => true
            ]);
        } catch (Exception $e) {
            error_log("Error en obtenerMiParticipacion: " . $e->getMessage());
            Response::error('Error al obtener participación', 500);
        }
    }
}
?>