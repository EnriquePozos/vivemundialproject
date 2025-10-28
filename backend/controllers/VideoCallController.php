<?php
/**
 * Controlador de VideoLlamadas - VERSIÓN SIN COMPOSER
 * Genera tokens JWT para LiveKit usando PHP puro
 */

require_once __DIR__ . '/../middlewares/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class VideoCallController {
    // Credenciales de LiveKit - YA CONFIGURADAS
    private $livekitUrl = 'wss://poi-ead0dmoi.livekit.cloud';
    private $apiKey = 'APIxdBcNFRQtmLi';
    private $apiSecret = 'HOr25doFnFTVFvaVKgeJ7cHpVaoWP1CqxzjUMsTJKeL';

    /**
     * Generar token JWT para LiveKit
     * POST /api/videocall/token
     * Body: { "roomName": "chat-123", "participantName": "Juan Pérez" }
     */
    public function generarToken() {
        // Verificar autenticación
        $id_Usuario = AuthMiddleware::verificarToken();

        // Obtener datos JSON
        $data = json_decode(file_get_contents("php://input"));

        // Validar datos
        if (empty($data->roomName) || empty($data->participantName)) {
            Response::error("Faltan datos requeridos: roomName, participantName", 400);
        }

        $roomName = $data->roomName;
        $participantName = $data->participantName;
        $participantIdentity = "user-" . $id_Usuario;

        try {
            // Crear el token JWT manualmente
            $token = $this->createLiveKitToken(
                $this->apiKey,
                $this->apiSecret,
                $participantIdentity,
                $roomName,
                $participantName
            );

            Response::success([
                'token' => $token,
                'url' => $this->livekitUrl,
                'roomName' => $roomName,
                'participantName' => $participantName
            ], "Token generado exitosamente");

        } catch (Exception $e) {
            Response::error("Error al generar token: " . $e->getMessage(), 500);
        }
    }

    /**
     * Iniciar una videollamada
     * POST /api/videocall/iniciar
     * Body: { "id_Chat": 123 }
     */
    public function iniciarLlamada() {
        // Verificar autenticación
        $id_Usuario = AuthMiddleware::verificarToken();

        // Obtener datos JSON
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->id_Chat)) {
            Response::error("Falta el ID del chat", 400);
        }

        $id_Chat = $data->id_Chat;
        $tipo = $data->tipo ?? 'privada'; // 'privada' o 'grupal'

        // Crear nombre único para la sala
        $roomName = "call-" . $id_Chat . "-" . time();

        Response::success([
            'roomName' => $roomName,
            'tipo' => $tipo,
            'iniciador' => $id_Usuario
        ], "Videollamada iniciada");
    }

    /**
     * Finalizar una videollamada
     * POST /api/videocall/finalizar
     * Body: { "roomName": "call-123-1234567890" }
     */
    public function finalizarLlamada() {
        // Verificar autenticación
        $id_Usuario = AuthMiddleware::verificarToken();

        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->roomName)) {
            Response::error("Falta el nombre de la sala", 400);
        }

        // En esta versión simplificada, solo confirmamos
        Response::success([], "Videollamada finalizada");
    }

    // =============================================
    // FUNCIÓN PARA CREAR JWT DE LIVEKIT
    // =============================================

    /**
     * Crear token JWT para LiveKit (sin librerías externas)
     */
    private function createLiveKitToken($apiKey, $apiSecret, $identity, $roomName, $name = null) {
        // Header del JWT
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];

        // Tiempos
        $now = time();
        $exp = $now + (6 * 3600); // Expira en 6 horas

        // Payload del JWT
        $payload = [
            'exp' => $exp,
            'iss' => $apiKey,
            'nbf' => $now,
            'sub' => $identity,
            'video' => [
                'room' => $roomName,
                'roomJoin' => true,
                'canPublish' => true,
                'canSubscribe' => true,
            ]
        ];

        // Agregar nombre si existe
        if ($name !== null) {
            $payload['name'] = $name;
        }

        // Codificar header y payload en base64url
        $headerEncoded = $this->base64UrlEncode(json_encode($header));
        $payloadEncoded = $this->base64UrlEncode(json_encode($payload));

        // Crear la firma
        $signature = hash_hmac(
            'sha256',
            $headerEncoded . '.' . $payloadEncoded,
            $apiSecret,
            true
        );
        $signatureEncoded = $this->base64UrlEncode($signature);

        // Retornar el JWT completo
        return $headerEncoded . '.' . $payloadEncoded . '.' . $signatureEncoded;
    }

    /**
     * Codificar en base64url (diferente a base64 normal)
     */
    private function base64UrlEncode($data) {
        $base64 = base64_encode($data);
        $base64Url = strtr($base64, '+/', '-_');
        return rtrim($base64Url, '=');
    }
}
?>