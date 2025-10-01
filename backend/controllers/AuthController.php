<?php
/**
 * Controlador de Autenticación
 * Maneja registro, login y logout de usuarios
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class AuthController {
    private $db;
    private $usuario;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->usuario = new Usuario($this->db);
    }

    /**
     * Registrar un nuevo usuario
     */
    public function registro() {
        // Obtener datos JSON
        $data = json_decode(file_get_contents("php://input"));

        // Validar datos
        $validator = new Validator();
        $validator
            ->required('nombre_Usuario', $data->nombre_Usuario ?? null)
            ->minLength('nombre_Usuario', $data->nombre_Usuario ?? '', 3)
            ->maxLength('nombre_Usuario', $data->nombre_Usuario ?? '', 100)
            ->required('Correo', $data->Correo ?? null)
            ->email('Correo', $data->Correo ?? null)
            ->required('Contrasenia', $data->Contrasenia ?? null)
            ->minLength('Contrasenia', $data->Contrasenia ?? '', 6);

        if ($validator->fails()) {
            Response::validationError($validator->getErrors());
        }

        // Asignar valores
        $this->usuario->nombre_Usuario = $data->nombre_Usuario;
        $this->usuario->Correo = $data->Correo;
        $this->usuario->Contrasenia = $data->Contrasenia;

        // Verificar si el correo ya existe
        if ($this->usuario->correoExiste()) {
            Response::error("El correo electrónico ya está registrado", 409);
        }

        // Crear usuario
        if ($this->usuario->crear()) {
            // Generar token de sesión
            $token = $this->generarToken();
            $this->crearSesion($this->usuario->id_Usuario, $token);

            Response::success([
                'usuario' => $this->usuario->obtenerDatosPublicos(),
                'token' => $token
            ], "Usuario registrado exitosamente", 201);
        } else {
            Response::error("Error al registrar el usuario", 500);
        }
    }

    /**
     * Iniciar sesión
     */
    public function login() {
        // Obtener datos JSON
        $data = json_decode(file_get_contents("php://input"));

        // Validar datos
        $validator = new Validator();
        $validator
            ->required('Correo', $data->Correo ?? null)
            ->email('Correo', $data->Correo ?? null)
            ->required('Contrasenia', $data->Contrasenia ?? null);

        if ($validator->fails()) {
            Response::validationError($validator->getErrors());
        }

        // Buscar usuario por correo
        $this->usuario->Correo = $data->Correo;
        
        if (!$this->usuario->buscarPorCorreo()) {
            Response::error("Credenciales incorrectas", 401);
        }

        // Verificar contraseña
        if (!$this->usuario->verificarContrasenia($data->Contrasenia)) {
            Response::error("Credenciales incorrectas", 401);
        }

        // Actualizar estado a online
        $this->usuario->Estado = true;
        $this->usuario->actualizarEstado();

        // Generar token de sesión
        $token = $this->generarToken();
        $this->crearSesion($this->usuario->id_Usuario, $token);

        Response::success([
            'usuario' => $this->usuario->obtenerDatosPublicos(),
            'token' => $token
        ], "Inicio de sesión exitoso");
    }

    /**
     * Cerrar sesión
     */
    public function logout() {
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? null;

        if (!$token) {
            Response::unauthorized("Token no proporcionado");
        }

        // Remover "Bearer " del token si existe
        $token = str_replace('Bearer ', '', $token);

        // Obtener ID de usuario del token
        $id_Usuario = $this->obtenerUsuarioPorToken($token);

        if (!$id_Usuario) {
            Response::unauthorized("Token inválido");
        }

        // Actualizar estado a offline
        $this->usuario->id_Usuario = $id_Usuario;
        $this->usuario->buscarPorId();
        $this->usuario->Estado = false;
        $this->usuario->actualizarEstado();

        // Desactivar sesión
        $this->desactivarSesion($token);

        Response::success(null, "Sesión cerrada exitosamente");
    }

    /**
     * Obtener usuario actual (perfil)
     */
    public function me() {
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? null;

        if (!$token) {
            Response::unauthorized("Token no proporcionado");
        }

        // Remover "Bearer " del token si existe
        $token = str_replace('Bearer ', '', $token);

        // Obtener ID de usuario del token
        $id_Usuario = $this->obtenerUsuarioPorToken($token);

        if (!$id_Usuario) {
            Response::unauthorized("Token inválido");
        }

        // Buscar usuario
        $this->usuario->id_Usuario = $id_Usuario;
        
        if ($this->usuario->buscarPorId()) {
            Response::success($this->usuario->obtenerDatosPublicos());
        } else {
            Response::notFound("Usuario no encontrado");
        }
    }

    /**
     * Generar token de sesión
     * @return string
     */
    private function generarToken() {
        return bin2hex(random_bytes(32));
    }

    /**
     * Crear sesión en la base de datos
     * @param int $id_Usuario
     * @param string $token
     */
    private function crearSesion($id_Usuario, $token) {
        $query = "INSERT INTO Sesiones (id_Usuario, token, activa) 
                  VALUES (:id_Usuario, :token, 1)";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":id_Usuario", $id_Usuario);
        $stmt->bindParam(":token", $token);
        $stmt->execute();
    }

    /**
     * Obtener usuario por token
     * @param string $token
     * @return int|null
     */
    private function obtenerUsuarioPorToken($token) {
        $query = "SELECT id_Usuario FROM Sesiones 
                  WHERE token = :token AND activa = 1 
                  LIMIT 1";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":token", $token);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row['id_Usuario'];
        }

        return null;
    }

    /**
     * Desactivar sesión
     * @param string $token
     */
    private function desactivarSesion($token) {
        $query = "UPDATE Sesiones 
                  SET activa = 0 
                  WHERE token = :token";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":token", $token);
        $stmt->execute();
    }
}
?>