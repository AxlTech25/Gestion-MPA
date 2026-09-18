<?php
/**
 * I-017: gerencias + gerencia_id en v2_areas.
 * Ejecutar: php backend/tools/migrate_gerencias.php
 */
require_once __DIR__ . '/../api/v2/config/Database.php';

$database = new Database();
$conn = $database->getConnection();

function tableExists(PDO $conn, string $name): bool {
    $stmt = $conn->prepare(
        'SELECT COUNT(*) FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :n'
    );
    $stmt->execute([':n' => $name]);
    return (int) $stmt->fetchColumn() > 0;
}

function columnExists(PDO $conn, string $table, string $column): bool {
    $stmt = $conn->prepare(
        'SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t AND COLUMN_NAME = :c'
    );
    $stmt->execute([':t' => $table, ':c' => $column]);
    return (int) $stmt->fetchColumn() > 0;
}

echo "=== Migración I-017 gerencias ===\n\n";

if (!tableExists($conn, 'v2_gerencias')) {
    $conn->exec("
        CREATE TABLE v2_gerencias (
          id INT PRIMARY KEY AUTO_INCREMENT,
          nombre VARCHAR(120) NOT NULL,
          orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
          UNIQUE KEY uniq_gerencias_nombre (nombre)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "  + v2_gerencias\n";
} else {
    echo "  = v2_gerencias ya existe\n";
}

if (!columnExists($conn, 'v2_areas', 'gerencia_id')) {
    $conn->exec('ALTER TABLE v2_areas ADD COLUMN gerencia_id INT NULL AFTER descripcion');
    echo "  + v2_areas.gerencia_id\n";
} else {
    echo "  = v2_areas.gerencia_id ya existe\n";
}

$fk = $conn->query(
    "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'v2_areas'
       AND CONSTRAINT_TYPE = 'FOREIGN KEY' AND CONSTRAINT_NAME = 'fk_areas_gerencia'"
);
if ($fk && $fk->rowCount() === 0) {
    $conn->exec(
        'ALTER TABLE v2_areas
         ADD CONSTRAINT fk_areas_gerencia
         FOREIGN KEY (gerencia_id) REFERENCES v2_gerencias(id) ON DELETE SET NULL'
    );
    echo "  + fk_areas_gerencia\n";
} else {
    echo "  = fk_areas_gerencia ya existe\n";
}

echo "\nMigración I-017 completada.\n";
