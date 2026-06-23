-- --------------------------------------------------------
-- ESTRUCTURA DE BASE DE DATOS V2 (Optimizada para ML)
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS gestion_equipos_mpa_v2;
USE gestion_equipos_mpa_v2;

-- 1. Normalizamos Áreas para evitar inconsistencias de texto
CREATE TABLE IF NOT EXISTS v2_areas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  jefe_encargado VARCHAR(100),
  descripcion TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Historial de Asignaciones: registra cambios de área o responsable de un equipo
CREATE TABLE IF NOT EXISTS v2_historial_asignaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipo_id INT NOT NULL,
  area_origen_id INT,
  area_destino_id INT,
  responsable_origen_id INT,
  responsable_destino_id INT,
  tipo_movimiento ENUM('Traslado','Cambio de Responsable','Asignacion Inicial','Devolucion','Baja') NOT NULL DEFAULT 'Traslado',
  motivo TEXT,
  registrado_por INT,
  fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notas TEXT,
  FOREIGN KEY (equipo_id) REFERENCES v2_equipos(id) ON DELETE CASCADE,
  FOREIGN KEY (area_origen_id) REFERENCES v2_areas(id) ON DELETE SET NULL,
  FOREIGN KEY (area_destino_id) REFERENCES v2_areas(id) ON DELETE SET NULL,
  FOREIGN KEY (responsable_origen_id) REFERENCES v2_usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (responsable_destino_id) REFERENCES v2_usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (registrado_por) REFERENCES v2_usuarios(id) ON DELETE SET NULL,
  INDEX (equipo_id),
  INDEX (fecha_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Cronograma de Mantenimiento: prioriza mantenimiento preventivo para reducir riesgos
CREATE TABLE IF NOT EXISTS v2_cronograma_mantenimiento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipo_id INT NOT NULL,
  tipo_mantenimiento ENUM('Preventivo','Correctivo','Predictivo','Inspeccion') DEFAULT 'Preventivo',
  frecuencia_dias INT DEFAULT 30,
  proxima_fecha DATE,
  ultima_fecha DATE,
  prioridad ENUM('Alta','Media','Baja') DEFAULT 'Media',
  responsable_id INT,
  area_id INT,
  estado ENUM('Pendiente','Programado','Completado','Cancelado') DEFAULT 'Pendiente',
  descripcion TEXT,
  creado_por INT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipo_id) REFERENCES v2_equipos(id) ON DELETE CASCADE,
  FOREIGN KEY (responsable_id) REFERENCES v2_usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (area_id) REFERENCES v2_areas(id) ON DELETE SET NULL,
  FOREIGN KEY (creado_por) REFERENCES v2_usuarios(id) ON DELETE SET NULL,
  INDEX (proxima_fecha),
  INDEX (prioridad)
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

  -- Telemetría ML (Sprint 7)
  horas_uso INT NOT NULL DEFAULT 0,
  errores_smart INT NOT NULL DEFAULT 0,
  contador_paginas INT NULL DEFAULT NULL,
  salud_bateria DECIMAL(5,2) NULL DEFAULT NULL,
  ultima_temp_cpu DECIMAL(5,2) NULL DEFAULT NULL,
  ultima_temp_disco DECIMAL(5,2) NULL DEFAULT NULL,
  fecha_ultimo_mantenimiento DATE NULL DEFAULT NULL,
  
  -- Para ML: Antigüedad real (Meses de uso calculables a partir de esta fecha)
  fecha_adquisicion DATE, 
  
  -- Atributos financieros/ubicación
  costo_estimado DECIMAL(10,2),
  ubicacion_fisica VARCHAR(150),
  
  -- Normalización
  area_id INT NOT NULL, 
  responsable_id INT,
  responsable_nombre VARCHAR(100),
  estado_conservacion ENUM('Nuevo', 'Bueno', 'Regular', 'Malo') DEFAULT 'Bueno',
  estado_operativo ENUM('Operativo', 'Dañado', 'En Reparacion', 'Excedencia', 'Baja') DEFAULT 'Operativo',
  
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
  software_base TEXT,
  observaciones_evaluacion TEXT,
  fecha_evaluacion DATETIME,

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
  tipo_mantenimiento ENUM('Preventivo', 'Correctivo', 'Predictivo', 'Evaluacion'),
  
  -- Crucial para ML: Clasificación estructurada del problema
  categoria_falla_id INT,

  -- Sprint 7: contexto estructurado de intervención
  sintoma_usuario TEXT,
  causa_raiz VARCHAR(150),
  componente_principal VARCHAR(100),
  nivel_polvo ENUM('Bajo', 'Medio', 'Alto', 'Critico'),
  temperatura_cpu DECIMAL(5,2),
  temperatura_disco DECIMAL(5,2),
  horas_uso_acumuladas INT,
  salud_bateria_pct DECIMAL(5,2),
  contador_paginas_lectura INT,
  tiempo_inactividad_min INT NOT NULL DEFAULT 0,
  
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

-- Usuario administrador inicial (usuario: admin / contraseña: admin123)
INSERT IGNORE INTO v2_areas (id, nombre, descripcion) VALUES
(1, 'Tecnología de la Información', 'Área de sistemas y soporte técnico');

INSERT IGNORE INTO v2_usuarios (id, nombre_completo, usuario, password_hash, rol, area_id) VALUES
(1, 'Administrador del Sistema', 'admin', '$2y$10$XXThufmFskrPvp/CRrU5Ae3nypx6OUs2/Xm25tIilOF3lH5vwm/pm', 'Administrador', 1);
