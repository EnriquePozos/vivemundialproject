<?php
/**
 * Clase para validar datos de entrada
 */

class Validator {
    
    private $errors = [];

    /**
     * Validar que un campo sea requerido
     * @param string $field Nombre del campo
     * @param mixed $value Valor del campo
     * @param string $message Mensaje de error personalizado
     */
    public function required($field, $value, $message = null) {
        if (empty($value) && $value !== 0 && $value !== '0') {
            $this->errors[$field] = $message ?? "El campo {$field} es requerido";
        }
        return $this;
    }

    /**
     * Validar email
     * @param string $field Nombre del campo
     * @param string $value Valor del campo
     * @param string $message Mensaje de error personalizado
     */
    public function email($field, $value, $message = null) {
        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = $message ?? "El campo {$field} debe ser un email válido";
        }
        return $this;
    }

    /**
     * Validar longitud mínima
     * @param string $field Nombre del campo
     * @param string $value Valor del campo
     * @param int $min Longitud mínima
     * @param string $message Mensaje de error personalizado
     */
    public function minLength($field, $value, $min, $message = null) {
        if (!empty($value) && strlen($value) < $min) {
            $this->errors[$field] = $message ?? "El campo {$field} debe tener al menos {$min} caracteres";
        }
        return $this;
    }

    /**
     * Validar longitud máxima
     * @param string $field Nombre del campo
     * @param string $value Valor del campo
     * @param int $max Longitud máxima
     * @param string $message Mensaje de error personalizado
     */
    public function maxLength($field, $value, $max, $message = null) {
        if (!empty($value) && strlen($value) > $max) {
            $this->errors[$field] = $message ?? "El campo {$field} no debe exceder {$max} caracteres";
        }
        return $this;
    }

    /**
     * Validar que sea un número entero
     * @param string $field Nombre del campo
     * @param mixed $value Valor del campo
     * @param string $message Mensaje de error personalizado
     */
    public function integer($field, $value, $message = null) {
        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_INT) && $value !== 0) {
            $this->errors[$field] = $message ?? "El campo {$field} debe ser un número entero";
        }
        return $this;
    }

    /**
     * Validar que sea un número positivo
     * @param string $field Nombre del campo
     * @param mixed $value Valor del campo
     * @param string $message Mensaje de error personalizado
     */
    public function positive($field, $value, $message = null) {
        if (!empty($value) && $value <= 0) {
            $this->errors[$field] = $message ?? "El campo {$field} debe ser un número positivo";
        }
        return $this;
    }

    /**
     * Validar que sea booleano
     * @param string $field Nombre del campo
     * @param mixed $value Valor del campo
     * @param string $message Mensaje de error personalizado
     */
    public function boolean($field, $value, $message = null) {
        if (!is_bool($value) && $value !== 0 && $value !== 1 && $value !== '0' && $value !== '1') {
            $this->errors[$field] = $message ?? "El campo {$field} debe ser verdadero o falso";
        }
        return $this;
    }

    /**
     * Validar que esté dentro de un conjunto de valores
     * @param string $field Nombre del campo
     * @param mixed $value Valor del campo
     * @param array $options Opciones válidas
     * @param string $message Mensaje de error personalizado
     */
    public function inArray($field, $value, $options, $message = null) {
        if (!empty($value) && !in_array($value, $options)) {
            $this->errors[$field] = $message ?? "El campo {$field} debe ser uno de: " . implode(', ', $options);
        }
        return $this;
    }

    /**
     * Verificar si hay errores
     * @return bool
     */
    public function fails() {
        return !empty($this->errors);
    }

    /**
     * Obtener todos los errores
     * @return array
     */
    public function getErrors() {
        return $this->errors;
    }

    /**
     * Limpiar errores
     */
    public function reset() {
        $this->errors = [];
        return $this;
    }
}
?>