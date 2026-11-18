<?php
require_once __DIR__ . '/../api/v2/config/Database.php';

$database = new Database();
$conn = $database->getConnection();

$conn->exec("CREATE TABLE IF NOT EXISTS v2_ficha_tecnica_historial (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipo_id INT NOT NULL,
  usuario_id INT NULL,
  accion VARCHAR(20) NOT NULL,
  cambios LONGTEXT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipo_id) REFERENCES v2_equipos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES v2_usuarios(id) ON DELETE SET NULL,
  INDEX (equipo_id),
  INDEX (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

echo "Historial de ficha técnica listo.\n";
