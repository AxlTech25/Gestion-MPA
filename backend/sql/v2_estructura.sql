-- --------------------------------------------------------
-- ESTRUCTURA DE BASE DE DATOS V2 (Optimizada para ML)
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS gestion_equipos_mpa_v2;
USE gestion_equipos_mpa_v2;

-- 1. Normalizamos Áreas para evitar inconsistencias de texto
CREATE TABLE IF NOT EXISTS v2_areas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Mantenemos usuarios, pero añadimos FK a áreas
CREATE TABLE IF NOT EXISTS v2_usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre_completo VARCHAR(100) NOT NULL,
  usuario VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('Administrador', 'Tecnico', 'Practicante') NOT NULL,
  area_id INT,
  FOREIGN KEY (area_id) REFERENCES v2_areas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Equipos: Optimizados para ML (Tipos numéricos y fechas clave)
CREATE TABLE IF NOT EXISTS v2_equipos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo_patrimonial VARCHAR(50) UNIQUE NOT NULL,
  codigo_identificativo VARCHAR(50),
  tipo_equipo ENUM('Laptop', 'CPU', 'Impresora', 'Monitor', 'Otro') NOT NULL,
  marca VARCHAR(50),
  modelo VARCHAR(50),
  numero_serie VARCHAR(100),
  
  -- Para ML: Usar numéricos en lugar de VARCHAR
  ram_gb INT, 
  almacenamiento_gb INT,
  tipo_disco ENUM('HDD', 'SSD', 'NVMe'),
  
  -- Para ML: Antigüedad real (Meses de uso calculables a partir de esta fecha)
  fecha_adquisicion DATE, 
  
  -- Atributos financieros/ubicación
  costo_estimado DECIMAL(10,2),
  ubicacion_fisica VARCHAR(150),
  
  -- Normalización
  area_id INT NOT NULL, 
  responsable_id INT,
  estado_conservacion ENUM('Nuevo', 'Bueno', 'Regular', 'Malo') DEFAULT 'Bueno',
  estado_operativo ENUM('Operativo', 'Dañado', 'Excedencia', 'Baja') DEFAULT 'Operativo',
  
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (area_id) REFERENCES v2_areas(id),
  FOREIGN KEY (responsable_id) REFERENCES v2_usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Fichas Técnicas (Especificaciones detalladas de hardware y software)
CREATE TABLE IF NOT EXISTS v2_fichas_tecnicas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipo_id INT UNIQUE NOT NULL,
  
  procesador VARCHAR(100),
  sistema_operativo ENUM('Windows 7', 'Windows 8', 'Windows 8.1', 'Windows 10', 'Windows 11', 'Linux', 'macOS'),
  licencia_so VARCHAR(100),
  mac_address VARCHAR(50),
  ip_asignada VARCHAR(15),
  software_base TEXT, -- Ej: Office, Antivirus
  
  FOREIGN KEY (equipo_id) REFERENCES v2_equipos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Catálogo de fallas para evitar texto libre (Crucial para predecir qué va a fallar)
CREATE TABLE IF NOT EXISTS v2_categorias_falla (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL, -- Ej: "Fallo de Disco", "Sobrecalentamiento", "Software", "Mantenimiento Rutinario"
  severidad ENUM('Baja', 'Media', 'Alta', 'Critica') DEFAULT 'Media'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertamos algunas fallas comunes por defecto
INSERT IGNORE INTO v2_categorias_falla (nombre, severidad) VALUES
('Mantenimiento Preventivo / Limpieza', 'Baja'),
('Actualización de Software / SO', 'Baja'),
('Reemplazo de Periféricos (Mouse/Teclado)', 'Baja'),
('Fallo de Red / Conectividad', 'Media'),
('Infección por Malware / Virus', 'Media'),
('Sobrecalentamiento / Fallo de Ventilación', 'Alta'),
('Fallo de Memoria RAM', 'Alta'),
('Fallo de Disco Duro / SSD (Corrupción)', 'Critica'),
('Fallo de Fuente de Poder', 'Critica'),
('Fallo de Placa Madre (Motherboard)', 'Critica');

-- 6. Fichas de Mantenimiento Histórico (El Dataset para el ML)
CREATE TABLE IF NOT EXISTS v2_fichas_mantenimiento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nro_orden VARCHAR(20) NOT NULL,
  equipo_id INT NOT NULL,
  fecha_intervencion DATETIME NOT NULL,
  tecnico_id INT,
  tipo_mantenimiento ENUM('Preventivo', 'Correctivo', 'Evaluacion'),
  
  -- Crucial para ML: Clasificación estructurada del problema
  categoria_falla_id INT, 
  
  -- Texto libre solo para humanos
  diagnostico_texto TEXT, 
  actividades_realizadas TEXT,
  piezas_reemplazadas TEXT,
  costo_reparacion DECIMAL(10,2) DEFAULT 0.00,
  
  -- Crucial para ML: ¿El mantenimiento resolvió el problema?
  estado_post_mantenimiento ENUM('Operativo', 'Dañado', 'Baja'),
  
  FOREIGN KEY (equipo_id) REFERENCES v2_equipos(id) ON DELETE CASCADE,
  FOREIGN KEY (tecnico_id) REFERENCES v2_usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (categoria_falla_id) REFERENCES v2_categorias_falla(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. (Opcional) Hojas de Revisión Técnica para bajas/chatarra
CREATE TABLE IF NOT EXISTS v2_hojas_baja (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numero_ficha VARCHAR(20) UNIQUE NOT NULL,
  equipo_id INT NOT NULL,
  fecha_revision DATE NOT NULL,
  
  causal_danio BOOLEAN DEFAULT FALSE,
  causal_excedencia BOOLEAN DEFAULT FALSE,
  causal_chatarra BOOLEAN DEFAULT FALSE,
  causal_reparacion_onerosa BOOLEAN DEFAULT FALSE,
  causal_obsolescencia_tecnica BOOLEAN DEFAULT FALSE,
  causal_raee BOOLEAN DEFAULT FALSE,
  
  conclusion_motivo TEXT,
  
  creado_por INT,
  validado_por INT,
  
  FOREIGN KEY (equipo_id) REFERENCES v2_equipos(id),
  FOREIGN KEY (creado_por) REFERENCES v2_usuarios(id),
  FOREIGN KEY (validado_por) REFERENCES v2_usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
