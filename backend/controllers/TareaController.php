<?php
/**
 * Controlador de Tareas
 * Maneja todas las operaciones de tareas dentro de chats grupales
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Tarea.php';
require_once __DIR__ . '/../models/Chat.php';
require_once __DIR__ . '/../middlewares/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class TareaController {
    private $db;
    private $tarea;
    private $chat;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->tarea = new Tarea($this->db);
        $this->chat = new Chat($this->db);
    }

    /**
     * Crear una nueva tarea
     * POST /api/tareas/crear
     * Body: { "id_Chat": 1, "titulo": "...", "descripcion": "...", "puntos_Recompensa": 10 }
     */
    public function crear() {
        // Verificar autenticación
        $id_Usuario = AuthMiddleware::verificarToken();

        // Obtener datos JSON
        $data = json_decode(file_get_contents("php://input"));

        // Validar datos requeridos
        $validator = new Validator();
        $validator
            ->required('id_Chat', $data->id_Chat ?? null)
            ->required('titulo', $data->titulo ?? null)
            ->minLength('titulo', $data->titulo ?? '', 3)
            ->maxLength('titulo', $data->titulo ?? '', 255);

        if ($validator->fails()) {
            Response::validationError($validator->getErrors());
        }

        // Verificar que el chat existe
        $this->chat->id_Chat = $data->id_Chat;
        
        // Verificar que el usuario pertenece al chat
        if (!$this->chat->usuarioPertenece($id_Usuario)) {
            Response::unauthorized("No tienes acceso a este chat");
        }

        // Verificar que sea un chat GRUPAL
        $chatInfo = $this->chat->obtenerPorId($data->id_Chat);
        if (!$chatInfo || $chatInfo['tipo_Chat'] !== 'grupal') {
            Response::error("Las tareas solo pueden crearse en chats grupales", 400);
        }

        // Validar puntos de recompensa (si se proporcionan)
        $puntos = $data->puntos_Recompensa ?? 10;
        if ($puntos < 1 || $puntos > 1000) {
            Response::error("Los puntos deben estar entre 1 y 1000", 400);
        }

        // Crear la tarea
        $this->tarea->id_Chat = $data->id_Chat;
        $this->tarea->titulo = $data->titulo;
        $this->tarea->descripcion = $data->descripcion ?? '';
        $this->tarea->creado_Por = $id_Usuario;
        $this->tarea->puntos_Recompensa = $puntos;

        $id_Tarea = $this->tarea->crear();

        if ($id_Tarea) {
            // Obtener la tarea recién creada con toda su información
            $tareaCreada = $this->tarea->obtenerPorId($id_Tarea);
            
            Response::success($tareaCreada, "Tarea creada exitosamente", 201);
        } else {
            Response::error("Error al crear la tarea", 500);
        }
    }

    /**
     * Listar tareas de un chat
     * GET /api/tareas/listar/:id_Chat
     */
    public function listar() {
        // Verificar autenticación
        $id_Usuario = AuthMiddleware::verificarToken();

        // Obtener ID del chat desde la URL
        $id_Chat = $_GET['id_Chat'] ?? null;

        if (!$id_Chat) {
            Response::error("ID del chat no proporcionado", 400);
        }

        // Verificar que el usuario pertenece al chat
        $this->chat->id_Chat = $id_Chat;
        if (!$this->chat->usuarioPertenece($id_Usuario)) {
            Response::unauthorized("No tienes acceso a este chat");
        }

        // Obtener tareas del chat
        $tareas = $this->tarea->obtenerPorChat($id_Chat);

        Response::success([
            'tareas' => $tareas,
            'total' => count($tareas),
            'pendientes' => $this->tarea->contarPendientes($id_Chat)
        ], "Tareas obtenidas exitosamente");
    }

    /**
     * Completar una tarea (PRIMERA PERSONA EN LLEGAR)
     * PUT /api/tareas/completar/:id
     */
    public function completar() {
        // Verificar autenticación
        $id_Usuario = AuthMiddleware::verificarToken();

        // Obtener ID de la tarea
        $id_Tarea = $_GET['id'] ?? null;

        if (!$id_Tarea) {
            Response::error("ID de la tarea no proporcionado", 400);
        }

        // Verificar que la tarea existe
        $tareaInfo = $this->tarea->obtenerPorId($id_Tarea);
        if (!$tareaInfo) {
            Response::error("Tarea no encontrada", 404);
        }

        // Verificar que el usuario pertenece al chat
        $this->chat->id_Chat = $tareaInfo['id_Chat'];
        if (!$this->chat->usuarioPertenece($id_Usuario)) {
            Response::unauthorized("No tienes acceso a este chat");
        }

        // Verificar que la tarea NO esté ya completada
        if ($tareaInfo['estado'] === 'completada') {
            Response::error("Esta tarea ya fue completada por " . $tareaInfo['completada_por_nombre'], 400);
        }

        // Evitar que el creador complete su propia tarea (OPCIONAL - puedes quitar esto si quieres)
        if ($tareaInfo['creado_Por'] === $id_Usuario) {
            Response::error("No puedes completar tu propia tarea", 400);
        }

        // Completar la tarea
        if ($this->tarea->completar($id_Tarea, $id_Usuario)) {
            // Obtener la tarea actualizada
            $tareaActualizada = $this->tarea->obtenerPorId($id_Tarea);
            
            Response::success([
                'tarea' => $tareaActualizada,
                'puntos_ganados' => $tareaInfo['puntos_Recompensa']
            ], "¡Tarea completada! Has ganado " . $tareaInfo['puntos_Recompensa'] . " puntos");
        } else {
            Response::error("Error al completar la tarea", 500);
        }
    }

    /**
     * Eliminar una tarea (solo el creador puede)
     * DELETE /api/tareas/eliminar/:id
     */
    public function eliminar() {
        // Verificar autenticación
        $id_Usuario = AuthMiddleware::verificarToken();

        // Obtener ID de la tarea
        $id_Tarea = $_GET['id'] ?? null;

        if (!$id_Tarea) {
            Response::error("ID de la tarea no proporcionado", 400);
        }

        // Verificar que la tarea existe
        $tareaInfo = $this->tarea->obtenerPorId($id_Tarea);
        if (!$tareaInfo) {
            Response::error("Tarea no encontrada", 404);
        }

        // Verificar que el usuario pertenece al chat
        $this->chat->id_Chat = $tareaInfo['id_Chat'];
        if (!$this->chat->usuarioPertenece($id_Usuario)) {
            Response::unauthorized("No tienes acceso a este chat");
        }

        // Verificar que el usuario sea el creador de la tarea
        if ($tareaInfo['creado_Por'] !== $id_Usuario) {
            Response::error("Solo el creador puede eliminar esta tarea", 403);
        }

        // Verificar que la tarea no esté completada (opcional - puedes quitar esto)
        if ($tareaInfo['estado'] === 'completada') {
            Response::error("No se puede eliminar una tarea ya completada", 400);
        }

        // Eliminar la tarea
        if ($this->tarea->eliminar($id_Tarea, $id_Usuario)) {
            Response::success(null, "Tarea eliminada exitosamente");
        } else {
            Response::error("Error al eliminar la tarea", 500);
        }
    }

    /**
     * Obtener una tarea específica
     * GET /api/tareas/obtener/:id
     */
    public function obtener() {
        // Verificar autenticación
        $id_Usuario = AuthMiddleware::verificarToken();

        // Obtener ID de la tarea
        $id_Tarea = $_GET['id'] ?? null;

        if (!$id_Tarea) {
            Response::error("ID de la tarea no proporcionado", 400);
        }

        // Obtener tarea
        $tarea = $this->tarea->obtenerPorId($id_Tarea);

        if (!$tarea) {
            Response::error("Tarea no encontrada", 404);
        }

        // Verificar que el usuario pertenece al chat
        $this->chat->id_Chat = $tarea['id_Chat'];
        if (!$this->chat->usuarioPertenece($id_Usuario)) {
            Response::unauthorized("No tienes acceso a esta tarea");
        }

        Response::success($tarea, "Tarea obtenida exitosamente");
    }
}
?>