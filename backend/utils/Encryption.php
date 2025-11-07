<?php
/**
 * Clase Encryption
 * Maneja la encriptación y desencriptación de mensajes usando AES-256-CBC
 */

class Encryption {
    private static $secret_key = "ViveMundial2026SecretKey!@#$%";
    
    /**
     * Método de encriptación
     * AES-256-CBC
     */
    private static $cipher_method = "AES-256-CBC";

    /**
     * Encriptar un mensaje
     * @param string $plaintext Texto plano a encriptar
     * @return string Texto encriptado en formato base64 (IV + encrypted text)
     */
    public static function encrypt($plaintext) {
        // Validar que el texto no esté vacío
        if (empty($plaintext)) {
            return $plaintext;
        }

        try {
            // 1. Generar un IV (Vector de Inicialización) aleatorio
            // El IV debe ser diferente para cada mensaje para mayor seguridad
            $iv_length = openssl_cipher_iv_length(self::$cipher_method);
            $iv = openssl_random_pseudo_bytes($iv_length);

            // 2. Derivar la clave de 32 bytes desde la clave secreta usando SHA-256
            // Esto asegura que siempre tengamos una clave del tamaño correcto
            $key = hash('sha256', self::$secret_key, true);

            // 3. Encriptar el texto usando AES-256-CBC
            $encrypted = openssl_encrypt(
                $plaintext,              // Texto a encriptar
                self::$cipher_method,    // Método de encriptación (AES-256-CBC)
                $key,                    // Clave derivada
                OPENSSL_RAW_DATA,        // Retornar datos binarios (no base64)
                $iv                      // Vector de inicialización
            );

            // Verificar que la encriptación fue exitosa
            if ($encrypted === false) {
                error_log("🔴 Error en openssl_encrypt: " . openssl_error_string());
                return $plaintext; // Retornar texto original si falla
            }

            // 4. Combinar IV + texto encriptado
            // Necesitamos el IV para desencriptar, así que lo guardamos junto con el mensaje
            $combined = $iv . $encrypted;

            // 5. Codificar en base64 para almacenamiento seguro en la BD
            $result = base64_encode($combined);

            // Log para debugging (comentar en producción)
            error_log("🔒 Mensaje encriptado - Longitud original: " . strlen($plaintext) . 
                      " bytes, Encriptado: " . strlen($result) . " bytes");

            return $result;

        } catch (Exception $e) {
            error_log("🔴 Error al encriptar mensaje: " . $e->getMessage());
            return $plaintext; // Retornar texto original si hay error
        }
    }

    /**
     * Desencriptar un mensaje
     * @param string $encrypted Texto encriptado en formato base64
     * @return string Texto desencriptado (texto plano original)
     */
    public static function decrypt($encrypted) {
        // Validar que el texto no esté vacío
        if (empty($encrypted)) {
            return $encrypted;
        }

        try {
            // 1. Decodificar de base64 a datos binarios
            $data = base64_decode($encrypted, true);

            // Verificar que la decodificación fue exitosa
            if ($data === false) {
                error_log("🔴 Error al decodificar base64");
                return $encrypted; // Retornar texto encriptado si falla
            }

            // 2. Extraer el IV (primeros bytes según la longitud del IV)
            $iv_length = openssl_cipher_iv_length(self::$cipher_method);
            
            // Verificar que los datos tienen al menos el tamaño del IV
            if (strlen($data) < $iv_length) {
                error_log("🔴 Datos encriptados demasiado cortos");
                return $encrypted;
            }
            
            $iv = substr($data, 0, $iv_length);

            // 3. Extraer el texto encriptado (resto de los bytes)
            $encrypted_text = substr($data, $iv_length);

            // 4. Derivar la clave de 32 bytes (igual que en encrypt)
            $key = hash('sha256', self::$secret_key, true);

            // 5. Desencriptar usando AES-256-CBC
            $decrypted = openssl_decrypt(
                $encrypted_text,         // Texto encriptado
                self::$cipher_method,    // Método de encriptación (AES-256-CBC)
                $key,                    // Clave derivada
                OPENSSL_RAW_DATA,        // Los datos están en formato binario
                $iv                      // Vector de inicialización
            );

            // Verificar que la desencriptación fue exitosa
            if ($decrypted === false) {
                error_log("🔴 Error en openssl_decrypt: " . openssl_error_string());
                return $encrypted; // Retornar texto encriptado si falla
            }

            // Log para debugging (comentar en producción)
            error_log("🔓 Mensaje desencriptado - Longitud: " . strlen($decrypted) . " bytes");

            return $decrypted;

        } catch (Exception $e) {
            error_log("🔴 Error al desencriptar mensaje: " . $e->getMessage());
            return $encrypted; // Retornar texto encriptado si hay error
        }
    }

    /**
     * Verificar si un texto parece estar encriptado
     * 
     * @param string $text Texto a verificar
     * @return bool True si parece estar encriptado, False en caso contrario
     */
    public static function isEncrypted($text) {
        if (empty($text)) {
            return false;
        }

        // Verificar que sea un string válido de Base64
        if (!preg_match('/^[A-Za-z0-9+\/=]+$/', $text)) {
            return false;
        }

        // Verificar longitud mínima (IV + al menos algunos bytes de datos)
        // Para AES-256-CBC, el IV tiene 16 bytes, más el texto encriptado
        // En Base64, esto sería aproximadamente 24+ caracteres
        if (strlen($text) < 32) {
            return false;
        }

        return true;
    }

    /**
     * Generar una nueva clave secreta aleatoria
     * 
     * Utilidad para generar claves seguras.
     * NO usar esta función en producción directamente.
     * Ejecutarla una vez, guardar la clave en .env, y comentarla.
     * 
     * @return string Clave hexadecimal de 64 caracteres (32 bytes)
     */
    public static function generateSecretKey() {
        return bin2hex(random_bytes(32));
    }

}
