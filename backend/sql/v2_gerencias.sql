-- I-017: catálogo de gerencias y FK opcional en áreas.
CREATE TABLE IF NOT EXISTS v2_gerencias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uniq_gerencias_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE v2_areas
  ADD COLUMN gerencia_id INT NULL AFTER descripcion,
  ADD CONSTRAINT fk_areas_gerencia
    FOREIGN KEY (gerencia_id) REFERENCES v2_gerencias(id) ON DELETE SET NULL;
