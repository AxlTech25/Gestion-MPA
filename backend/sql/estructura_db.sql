CREATE DATABASE IF NOT EXISTS gestion_equipos_mpa;
USE gestion_equipos_mpa;

-- 1. TABLA DE USUARIOS (Roles)
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_completo VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('Administrador', 'Tecnico', 'Practicante') NOT NULL
);

-- 2. TABLA DE EQUIPOS (Inventario base)
-- Incluye Hardware, Software y el Área (en lugar de oficina)
CREATE TABLE equipos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo_patrimonial VARCHAR(50) UNIQUE NOT NULL,
    codigo_identificativo VARCHAR(50),
    denominacion VARCHAR(100), -- Ej: MONITOR, LAPTOP, CPU
    tipo_equipo ENUM('Laptop', 'CPU', 'Impresora', 'Monitor', 'Otro') NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    serie VARCHAR(50),
    color VARCHAR(30),
    
    -- Especificaciones de Hardware
    procesador VARCHAR(50),
    ram VARCHAR(20),
    disco_duro VARCHAR(50),
    tipo_impresion VARCHAR(50), -- Láser / Tinta
    
    -- Especificaciones de Software (Nuevos requisitos)
    sistema_operativo ENUM('Windows 7', 'Windows 8', 'Windows 8.1', 'Windows 10', 'Windows 11'),
    software_instalado TEXT, -- Guardará: "Office, AutoCAD, CorelDraw"
    
    -- Ubicación y Estado
    area_asignada VARCHAR(100) NOT NULL, -- Ej: ADMINISTRACION, TESORERIA
    responsable_asignado VARCHAR(100),
    estado_conservacion ENUM('Nuevo', 'Bueno', 'Regular', 'Malo') DEFAULT 'Bueno',
    estado_operativo ENUM('Operativo', 'Dañado', 'Excedencia', 'Baja') DEFAULT 'Operativo',
    
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CRONOGRAMA DE MANTENIMIENTO
CREATE TABLE cronograma_mantenimiento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipo_id INT,
    fecha_programada DATE NOT NULL,
    tipo_mantenimiento ENUM('Preventivo', 'Correctivo') DEFAULT 'Preventivo',
    estado_mantenimiento ENUM('Pendiente', 'Realizado') DEFAULT 'Pendiente',
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);

-- 4. FICHAS DE MANTENIMIENTO (Historial)
-- La última ficha registrada representa el estado actual del equipo
CREATE TABLE fichas_mantenimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nro_orden VARCHAR(10) NOT NULL, -- Formato N° 001
    equipo_id INT NOT NULL,
    fecha DATE NOT NULL,
    area VARCHAR(100),
    encargado VARCHAR(100),
    usuario_responsable VARCHAR(100),
    tipo_mantenimiento ENUM('Preventivo', 'Correctivo'),
    
    -- Periféricos (JSON para flexibilidad)
    perifericos JSON, 
    
    -- Software
    sw_windows VARCHAR(100),
    sw_office VARCHAR(100),
    sw_antivirus VARCHAR(100),
    sw_otros TEXT,
    
    -- Diagnóstico
    diagnostico_entrada TEXT,
    actividades_realizadas TEXT,
    diagnostico_salida TEXT,
    conclusion TEXT,
    
    estado ENUM('Borrador', 'Finalizado') DEFAULT 'Borrador',
    FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

-- 5. HOJAS DE REVISIÓN TÉCNICA (Ficha Técnica MPA)
-- Basado exactamente en la imagen que subiste
CREATE TABLE hojas_revision_tecnica (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_ficha VARCHAR(20) UNIQUE, -- Ej: "N° 013"
    equipo_id INT,
    fecha_revision DATE,
    
    -- Causales (Checks de la imagen)
    causal_danio BOOLEAN DEFAULT FALSE,
    causal_excedencia BOOLEAN DEFAULT FALSE,
    causal_chatarra BOOLEAN DEFAULT FALSE,
    causal_reparacion_onerosa BOOLEAN DEFAULT FALSE,
    causal_obsolescencia_tecnica BOOLEAN DEFAULT FALSE,
    causal_raee BOOLEAN DEFAULT FALSE,
    
    diagnostico_texto TEXT, -- Detalle del diagnóstico
    conclusion_motivo TEXT,
    
    creado_por INT, -- Practicante o Técnico
    validado_por INT, -- Admin
    FOREIGN KEY (equipo_id) REFERENCES equipos(id),
    FOREIGN KEY (creado_por) REFERENCES usuarios(id),
    FOREIGN KEY (validado_por) REFERENCES usuarios(id)
);