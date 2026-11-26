-- Tickets de soporte públicos (sin cuenta) + cola interna
-- Aplicar: php backend/tools/migrate_tickets.php

CREATE TABLE IF NOT EXISTS v2_tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(20) NOT NULL,
  gerencia_id INT NOT NULL,
  area_id INT NOT NULL,
  motivo VARCHAR(80) NOT NULL,
  descripcion VARCHAR(500) NULL,
  solicitante_nombre VARCHAR(120) NULL,
  estado ENUM('Abierto', 'En atencion', 'Resuelto', 'Cerrado') NOT NULL DEFAULT 'Abierto',
  asignado_a INT NULL,
  ip_origen VARCHAR(45) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_tickets_codigo (codigo),
  KEY idx_tickets_estado (estado),
  KEY idx_tickets_area (area_id),
  KEY idx_tickets_gerencia (gerencia_id),
  KEY idx_tickets_creado (creado_en),
  CONSTRAINT fk_tickets_gerencia FOREIGN KEY (gerencia_id) REFERENCES v2_gerencias(id),
  CONSTRAINT fk_tickets_area FOREIGN KEY (area_id) REFERENCES v2_areas(id),
  CONSTRAINT fk_tickets_asignado FOREIGN KEY (asignado_a) REFERENCES v2_usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
