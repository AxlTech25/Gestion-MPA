-- Incremento 8 — cronograma por área × día (cantidad Xn = PCs/laptops ese día)
-- No modifica v2_cronograma_mantenimiento (ADR-003).

CREATE TABLE IF NOT EXISTS v2_cronogramas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  anio SMALLINT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  notas TEXT NULL,
  creado_por INT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creado_por) REFERENCES v2_usuarios(id) ON DELETE SET NULL,
  INDEX idx_cronogramas_anio (anio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS v2_cronograma_celdas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cronograma_id INT NOT NULL,
  area_id INT NOT NULL,
  fecha DATE NOT NULL,
  turno ENUM('Manana', 'Tarde') NOT NULL DEFAULT 'Manana',
  cantidad TINYINT UNSIGNED NOT NULL DEFAULT 1,
  hora_inicio TIME NOT NULL DEFAULT '10:00:00',
  hora_fin TIME NOT NULL DEFAULT '13:00:00',
  creado_por INT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cronograma_id) REFERENCES v2_cronogramas(id) ON DELETE CASCADE,
  FOREIGN KEY (area_id) REFERENCES v2_areas(id) ON DELETE CASCADE,
  FOREIGN KEY (creado_por) REFERENCES v2_usuarios(id) ON DELETE SET NULL,
  UNIQUE KEY uniq_cronograma_area_fecha (cronograma_id, area_id, fecha),
  INDEX idx_celdas_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS v2_cronograma_horarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  celda_id INT NOT NULL,
  equipo_id INT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  FOREIGN KEY (celda_id) REFERENCES v2_cronograma_celdas(id) ON DELETE CASCADE,
  FOREIGN KEY (equipo_id) REFERENCES v2_equipos(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_celda_equipo (celda_id, equipo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS v2_cronograma_personal (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cronograma_id INT NOT NULL,
  nro SMALLINT NOT NULL DEFAULT 1,
  nombre VARCHAR(120) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  FOREIGN KEY (cronograma_id) REFERENCES v2_cronogramas(id) ON DELETE CASCADE,
  INDEX idx_personal_cronograma (cronograma_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
