-- Sprint 6: Tabla de predicciones ML
-- Ejecutar sobre gestion_equipos_mpa_v2

USE gestion_equipos_mpa_v2;

CREATE TABLE IF NOT EXISTS v2_predicciones_ml (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipo_id INT NOT NULL,
  modelo_version VARCHAR(20) NOT NULL,
  score_riesgo DECIMAL(5,2) NOT NULL,
  nivel_riesgo ENUM('Bajo','Medio','Alto','Critico') NOT NULL,
  factores_json JSON,
  categoria_sugerida_id INT NULL,
  generado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipo_id) REFERENCES v2_equipos(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_sugerida_id) REFERENCES v2_categorias_falla(id) ON DELETE SET NULL,
  INDEX (equipo_id),
  INDEX (nivel_riesgo),
  INDEX (generado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
