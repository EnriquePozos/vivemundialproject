DROP DATABASE IF EXISTS POI;
CREATE DATABASE POI;
USE POI;

-- ============================================
-- TABLA: Usuario
-- Almacena la información de los usuarios del sistema
-- ============================================
CREATE TABLE Usuario (
    id_Usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_Usuario VARCHAR(100) NOT NULL,
    Correo VARCHAR(100) NOT NULL UNIQUE,
    Contrasenia VARCHAR(255) NOT NULL,
    Estado BOOLEAN DEFAULT FALSE,
    Puntos INT DEFAULT 0,
    IconoPerfil VARCHAR(255) DEFAULT 'default_avatar.png',
    id_Socket VARCHAR(100) DEFAULT NULL,
    INDEX idx_correo (Correo)
);

-- ============================================
-- TABLA: Chats
-- Almacena los chats (privados y grupales)
-- ============================================
CREATE TABLE Chats (
    id_Chat INT AUTO_INCREMENT PRIMARY KEY,
    nombre_Chat VARCHAR(255) DEFAULT NULL,
    tipo_Chat ENUM('privado', 'grupal') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    INDEX idx_tipo (tipo_Chat)
);

-- ============================================
-- TABLA: Participantes_Chat
-- Relación muchos a muchos entre usuarios y chats
-- ============================================
CREATE TABLE Participantes_Chat (
    id_Part_Chat INT AUTO_INCREMENT PRIMARY KEY,
    id_Usuario INT NOT NULL,
    id_Chat INT NOT NULL,
    FOREIGN KEY (id_Usuario) REFERENCES Usuario(id_Usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_Chat) REFERENCES Chats(id_Chat) ON DELETE CASCADE,
    UNIQUE KEY unique_user_chat (id_Usuario, id_Chat),
    INDEX idx_usuario (id_Usuario),
    INDEX idx_chat (id_Chat)
);

-- ============================================
-- TABLA: Mensajes
-- Almacena todos los mensajes del sistema
-- ============================================
CREATE TABLE Mensajes (
    id_Mensaje INT AUTO_INCREMENT PRIMARY KEY,
    id_Chat INT NOT NULL,
    id_Remitente INT NOT NULL,
    mensaje TEXT NOT NULL,
    encriptado BOOLEAN DEFAULT FALSE,
    tipo_Mensaje ENUM('texto', 'imagen', 'archivo', 'ubicacion', 'sistema') DEFAULT 'texto',
    url_Archivo VARCHAR(500) DEFAULT NULL,
    nombre_Archivo VARCHAR(255) DEFAULT NULL,
    tamano_Archivo INT DEFAULT NULL,
    FOREIGN KEY (id_Chat) REFERENCES Chats(id_Chat) ON DELETE CASCADE,
    FOREIGN KEY (id_Remitente) REFERENCES Usuario(id_Usuario) ON DELETE CASCADE,
    INDEX idx_chat (id_Chat),
    INDEX idx_remitente (id_Remitente)
);

-- ============================================
-- TABLA: Quinielas
-- Catálogo de quinielas disponibles del Mundial
-- ============================================
CREATE TABLE Quinielas (
    id_Quiniela INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT DEFAULT NULL,
    tipo ENUM('partido', 'grupo', 'eliminatoria', 'campeon') DEFAULT 'partido',
    resultado VARCHAR(100) DEFAULT NULL,
    activa BOOLEAN DEFAULT TRUE,
    INDEX idx_activa (activa),
    INDEX idx_tipo (tipo)
);

-- ============================================
-- TABLA: Quinielas_Chat
-- Quinielas agregadas a cada chat/grupo
-- ============================================
CREATE TABLE Quinielas_Chat (
    id_Quiniela_Chat INT AUTO_INCREMENT PRIMARY KEY,
    id_Chat INT NOT NULL,
    id_Quiniela INT NOT NULL,
    agregado_Por INT NOT NULL,
    estado ENUM('activa', 'finalizada', 'cancelada') DEFAULT 'activa',
    ganador_Declarado_Por INT DEFAULT NULL,
    FOREIGN KEY (id_Chat) REFERENCES Chats(id_Chat) ON DELETE CASCADE,
    FOREIGN KEY (id_Quiniela) REFERENCES Quinielas(id_Quiniela) ON DELETE CASCADE,
    FOREIGN KEY (agregado_Por) REFERENCES Usuario(id_Usuario) ON DELETE CASCADE,
    FOREIGN KEY (ganador_Declarado_Por) REFERENCES Usuario(id_Usuario) ON DELETE SET NULL,
    INDEX idx_chat (id_Chat),
    INDEX idx_estado (estado)
);

-- ============================================
-- TABLA: Participaciones_Quiniela
-- Participaciones de usuarios en quinielas (apuestas)
-- ============================================
CREATE TABLE Participaciones_Quiniela (
    id_Participacion INT AUTO_INCREMENT PRIMARY KEY,
    id_Quiniela_Chat INT NOT NULL,
    id_Usuario INT NOT NULL,
    puntos_Apostados INT NOT NULL,
    prediccion VARCHAR(100) NOT NULL,
    es_Ganador BOOLEAN DEFAULT FALSE,
    puntos_Ganados INT DEFAULT 0,
    FOREIGN KEY (id_Quiniela_Chat) REFERENCES Quinielas_Chat(id_Quiniela_Chat) ON DELETE CASCADE,
    FOREIGN KEY (id_Usuario) REFERENCES Usuario(id_Usuario) ON DELETE CASCADE,
    INDEX idx_quiniela_chat (id_Quiniela_Chat),
    INDEX idx_usuario (id_Usuario)
);

-- ============================================
-- TABLA: Tareas
-- Sistema de gestión de tareas por grupo
-- ============================================
CREATE TABLE Tareas (
    id_Tarea INT AUTO_INCREMENT PRIMARY KEY,
    id_Chat INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT DEFAULT NULL,
    creado_Por INT NOT NULL,
    estado ENUM('pendiente', 'completada') DEFAULT 'pendiente',
    puntos_Recompensa INT DEFAULT 10,
    completada_Por INT DEFAULT NULL,
    FOREIGN KEY (id_Chat) REFERENCES Chats(id_Chat) ON DELETE CASCADE,
    FOREIGN KEY (creado_Por) REFERENCES Usuario(id_Usuario) ON DELETE CASCADE,
    FOREIGN KEY (completada_Por) REFERENCES Usuario(id_Usuario) ON DELETE SET NULL,
    INDEX idx_chat (id_Chat),
    INDEX idx_estado (estado)
);

-- ============================================
-- TABLA: Tienda_Iconos
-- Catálogo de íconos disponibles en la tienda
-- ============================================
CREATE TABLE Tienda_Iconos (
    id_Icono INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT DEFAULT NULL,
    url_Imagen VARCHAR(255) NOT NULL,
    precio_Puntos INT NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    INDEX idx_disponible (disponible)
);

-- ============================================
-- TABLA: Usuario_Iconos
-- Íconos comprados por usuarios
-- ============================================
CREATE TABLE Usuario_Iconos (
    id_Usuario_Icono INT AUTO_INCREMENT PRIMARY KEY,
    id_Usuario INT NOT NULL,
    id_Icono INT NOT NULL,
    equipado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_Usuario) REFERENCES Usuario(id_Usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_Icono) REFERENCES Tienda_Iconos(id_Icono) ON DELETE CASCADE,
    UNIQUE KEY unique_user_icon (id_Usuario, id_Icono),
    INDEX idx_usuario (id_Usuario),
    INDEX idx_equipado (equipado)
);

-- ============================================
-- TABLA: Historial_Puntos
-- Registro de cambios en puntos de usuarios
-- ============================================
CREATE TABLE Historial_Puntos (
    id_Historial INT AUTO_INCREMENT PRIMARY KEY,
    id_Usuario INT NOT NULL,
    tipo_Accion ENUM('ganados_tarea', 'ganados_quiniela', 'apostados', 'gastados_tienda', 'ajuste') NOT NULL,
    cantidad INT NOT NULL,
    razon VARCHAR(255) NOT NULL,
    id_Referencia INT DEFAULT NULL,
    FOREIGN KEY (id_Usuario) REFERENCES Usuario(id_Usuario) ON DELETE CASCADE,
    INDEX idx_usuario (id_Usuario)
);

-- ============================================
-- TABLA: Sesiones
-- Control de sesiones de usuarios
-- ============================================
CREATE TABLE Sesiones (
    id_Sesion INT AUTO_INCREMENT PRIMARY KEY,
    id_Usuario INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    activa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_Usuario) REFERENCES Usuario(id_Usuario) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_usuario (id_Usuario)
);