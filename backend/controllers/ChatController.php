<?php
/**
 * Controlador de Chat
 * Maneja todas las operaciones de chats y mensajes
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Chat.php';
require_once __DIR__ . '/../middlewares/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class ChatController {
    private $db;
    private $chat;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->chat = new Chat($this->db);
    }

    /**
     * Crear un nuevo chat (privado o grupal)
     */
    public function crearChat() {
        // Verificar autenticación
        $id_Usuario = AuthMiddleware::verificarToken();

        // Obtener datos JSON
        $data = json_decode(file_get_contents("php://input"));

        // Validar datos
        $validator = new Validator();
        $validator
            ->required('tipo_Chat', $data->tipo_Chat ?? null)
            ->inArray('tipo_Chat', $data->tipo_Chat ?? '', ['privado', 'grupal']);

        if ($validator->fails()) {
            Response::validationError($validator->getErrors());
        }

        // Si es grupal, validar nombre y participantes
        if ($data->tipo_Chat === 'grupal') {
            $validator
                ->required('nombre_Chat', $data->nombre_Chat ?? null)
                ->minLength('nombre_Chat', $data->nombre_Chat ?? '', 3)
                ->required('participantes', $data->participantes ?? null);

            if ($validator->fails()) {
                Response::validationError($validator->getErrors());
            }

            // Verificar que haya al menos 3 participantes (incluyendo el creador)
            $participantes = $data->participantes;
            if (!is_array($participantes) || count($participantes) < 2) {
                Response::error("Un chat grupal debe tener al menos 3 participantes", 400);
            }
        }

        // Si es privado, validar que haya un participante
        if ($data->tipo_Chat === 'privado') {
            if (empty($data->id_Destinatario)) {
                Response::error("Debes especificar el destinatario", 400);
            }

            // Verificar si ya existe un chat privado entre estos usuarios
            $chatExistente = $this->chat->chatPrivadoExiste($id_Usuario, $data->id_Destinatario);
            if ($chatExistente) {
                Response::success(['id_Chat' => $chatExistente], "Chat privado ya existe", 200);
            }
        }

        // Crear el chat
        $this->chat->nombre_Chat = $data->nombre_Chat ?? null;
        $this->chat->tipo_Chat = $data->tipo_Chat;
        $this->chat->activo = true;

        if ($this->chat->crear()) {
            // Agregar participantes
            if ($data->tipo_Chat === 'privado') {
                // Agregar creador y destinatario
                $this->chat->agregarParticipante($id_Usuario);
                $this->chat->agregarParticipante($data->id_Destinatario);
            } else {
                // Agregar creador
                $this->chat->agregarParticipante($id_Usuario);
                
                // Agregar demás participantes
                foreach ($data->participantes as $id_Participante) {
                    $this->chat->agregarParticipante($id_Participante);
                }
            }

            Response::success([
                'id_Chat' => $this->chat->id_Chat,
                'nombre_Chat' => $this->chat->nombre_Chat,
                'tipo_Chat' => $this->chat->tipo_Chat
            ], "Chat creado exitosamente", 201);
        } else {
            Response::error("Error al crear el chat", 500);
        }
    }

    /**
     * Obtener todos los chats del usuario autenticado
     */
    public function obtenerMisChats() {
        // Verificar autenticación
        $id_Usuario = AuthMiddleware::verificarToken();

        // Obtener chats
        $chats = $this->chat->obtenerChatsPorUsuario($id_Usuario);

        Response::success($chats, "Chats obtenidos exitosamente");
    }

    /**
     * Obtener información de un chat específico
     */
    public function obtenerChat() {
        // Verificar autenticación
        $id_Usuario = AuthMiddleware::verificarToken();

        // Obtener ID del chat de la URL
        $id_Chat = $_GET['id_Chat'] ?? null;

        if (!$id_Chat) {
            Response::error("ID del chat no proporcionado", 400);
        }

        // Verificar que el usuario pertenezca al chat
        $this->chat->id_Chat = $id_Chat;
        if (!$this->chat->usuarioPertenece($id_Usuario)) {
            Response::unauthorized("No tienes acceso a este chat");
        }

        // Obtener información del chat
        $chatInfo = $this->chat->obtenerPorId();
        if (!$chatInfo) {
            Response::notFound("Chat no encontrado");
        }

        // Obtener participantes
        $participantes = $this->chat->obtenerParticipantes();

        Response::success([
            'chat' => $chatInfo,
            'participantes' => $participantes
        ], "Información del chat obtenida exitosamente");
    }

    /**
     * Obtener mensajes de un chat
     */
    public function obtenerMensajes() {
        // Verificar autenticación
        $id_Usuario = AuthMiddleware::verificarToken();

        // Obtener ID del chat
        $id_Chat = $_GET['id_Chat'] ?? null;

        if (!$id_Chat) {
            Response::error("ID del chat no proporcionado", 400);
        }

        // Verificar que el usuario pertenezca al chat
        $this->chat->id_Chat = $id_Chat;
        if (!$this->chat->usuarioPertenece($id_Usuario)) {
            Response::unauthorized("No tienes acceso a este chat");
        }

        // Obtener mensajes
        $limite = $_GET['limite'] ?? 50;
        $mensajes = $this->chat->obtenerMensajes($limite);

        Response::success($mensajes, "Mensajes obtenidos exitosamente");
    }

    /**
     * Enviar mensaje a un chat
     */
    public function enviarMensaje() {
        // Verificar autenticación
        $id_Usuario = AuthMiddleware::verificarToken();

        // Obtener datos JSON
        $data = json_decode(file_get_contents("php://input"));

        // Validar datos
        $validator = new Validator();
        $validator
            ->required('id_Chat', $data->id_Chat ?? null)
            ->required('mensaje', $data->mensaje ?? null)
            ->minLength('mensaje', $data->mensaje ?? '', 1);

        if ($validator->fails()) {
            Response::validationError($validator->getErrors());
        }

        // Verificar que el usuario pertenezca al chat
        $this->chat->id_Chat = $data->id_Chat;
        if (!$this->chat->usuarioPertenece($id_Usuario)) {
            Response::unauthorized("No tienes acceso a este chat");
        }

        // Enviar mensaje
        $encriptado = $data->encriptado ?? false;
        $tipo_Mensaje = $data->tipo_Mensaje ?? 'texto';

        if ($this->chat->enviarMensaje($id_Usuario, $data->mensaje, $encriptado, $tipo_Mensaje)) {
            Response::success(null, "Mensaje enviado exitosamente", 201);
        } else {
            Response::error("Error al enviar el mensaje", 500);
        }
    }
}
?>