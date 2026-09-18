<?php
/**
 * Crea tablas de cronograma (I-010 / I-011 / ADR-003).
 * Ejecutar: php backend/tools/migrate_cronograma.php
 */
require_once __DIR__ . '/../api/v2/config/Database.php';

$db = new Database();
$conn = $db->getConnection();

function columnExists(PDO $conn, string $table, string $column): bool {
    $stmt = $conn->prepare(
        'SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
    );
    $stmt->execute([$table, $column]);
    return (int) $stmt->fetchColumn() > 0;
}

function indexExists(PDO $conn, string $table, string $index): bool {
    $stmt = $conn->prepare(
        'SELECT COUNT(*) FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?'
    );
    $stmt->execute([$table, $index]);
    return (int) $stmt->fetchColumn() > 0;
}

function tableExists(PDO $conn, string $table): bool {
    $stmt = $conn->prepare(
        'SELECT COUNT(*) FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?'
    );
    $stmt->execute([$table]);
    return (int) $stmt->fetchColumn() > 0;
}

echo "=== Migración I-010 cronograma ===\n\n";

if (!tableExists($conn, 'v2_cronogramas')) {
    $conn->exec("
        CREATE TABLE v2_cronogramas (
          id INT PRIMARY KEY AUTO_INCREMENT,
          anio SMALLINT NOT NULL,
          nombre VARCHAR(120) NOT NULL,
          notas TEXT NULL,
          creado_por INT NULL,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (creado_por) REFERENCES v2_usuarios(id) ON DELETE SET NULL,
          INDEX idx_cronogramas_anio (anio)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "  + v2_cronogramas\n";
} else {
    echo "  = v2_cronogramas ya existe\n";
}

if (!tableExists($conn, 'v2_cronograma_celdas')) {
    $conn->exec("
        CREATE TABLE v2_cronograma_celdas (
          id INT PRIMARY KEY AUTO_INCREMENT,
          cronograma_id INT NOT NULL,
          area_id INT NOT NULL,
          fecha DATE NOT NULL,
          turno ENUM('Manana', 'Tarde') NOT NULL DEFAULT 'Manana',
          hora_inicio TIME NOT NULL DEFAULT '10:00:00',
          hora_fin TIME NOT NULL DEFAULT '13:00:00',
          creado_por INT NULL,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cronograma_id) REFERENCES v2_cronogramas(id) ON DELETE CASCADE,
          FOREIGN KEY (area_id) REFERENCES v2_areas(id) ON DELETE CASCADE,
          FOREIGN KEY (creado_por) REFERENCES v2_usuarios(id) ON DELETE SET NULL,
          UNIQUE KEY uniq_cronograma_area_fecha_turno (cronograma_id, area_id, fecha, turno),
          INDEX idx_celdas_fecha (fecha)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "  + v2_cronograma_celdas\n";
} else {
    echo "  = v2_cronograma_celdas ya existe\n";
}

if (!tableExists($conn, 'v2_cronograma_horarios')) {
    $conn->exec("
        CREATE TABLE v2_cronograma_horarios (
          id INT PRIMARY KEY AUTO_INCREMENT,
          celda_id INT NOT NULL,
          equipo_id INT NOT NULL,
          hora_inicio TIME NOT NULL,
          hora_fin TIME NOT NULL,
          FOREIGN KEY (celda_id) REFERENCES v2_cronograma_celdas(id) ON DELETE CASCADE,
          FOREIGN KEY (equipo_id) REFERENCES v2_equipos(id) ON DELETE CASCADE,
          UNIQUE KEY uniq_celda_equipo (celda_id, equipo_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "  + v2_cronograma_horarios\n";
} else {
    echo "  = v2_cronograma_horarios ya existe\n";
}

$backfill = $conn->exec("
    INSERT IGNORE INTO v2_cronograma_horarios (celda_id, equipo_id, hora_inicio, hora_fin)
    SELECT c.id, e.id, c.hora_inicio, c.hora_fin
    FROM v2_cronograma_celdas c
    INNER JOIN v2_equipos e ON e.area_id = c.area_id
    WHERE e.tipo_equipo IN ('CPU', 'Laptop', 'Impresora')
      AND e.estado_operativo <> 'Baja'
");
echo "  horarios sembrados: " . (int) $backfill . "\n";

if (!tableExists($conn, 'v2_cronograma_personal')) {
    $conn->exec("
        CREATE TABLE v2_cronograma_personal (
          id INT PRIMARY KEY AUTO_INCREMENT,
          cronograma_id INT NOT NULL,
          nro SMALLINT NOT NULL DEFAULT 1,
          nombre VARCHAR(120) NOT NULL,
          hora_inicio TIME NOT NULL,
          hora_fin TIME NOT NULL,
          FOREIGN KEY (cronograma_id) REFERENCES v2_cronogramas(id) ON DELETE CASCADE,
          INDEX idx_personal_cronograma (cronograma_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "  + v2_cronograma_personal\n";
} else {
    echo "  = v2_cronograma_personal ya existe\n";
}

$semilla = $conn->exec("
    INSERT INTO v2_cronograma_personal (cronograma_id, nro, nombre, hora_inicio, hora_fin)
    SELECT c.id, 1, 'PC 01', '10:00:00', '13:00:00'
    FROM v2_cronogramas c
    WHERE NOT EXISTS (
      SELECT 1 FROM v2_cronograma_personal p WHERE p.cronograma_id = c.id
    )
");
$conn->exec("
    INSERT INTO v2_cronograma_personal (cronograma_id, nro, nombre, hora_inicio, hora_fin)
    SELECT c.id, 2, 'PC 02', '14:00:00', '17:00:00'
    FROM v2_cronogramas c
    WHERE (SELECT COUNT(*) FROM v2_cronograma_personal p WHERE p.cronograma_id = c.id) = 1
");
echo "  personal sembrado en cronogramas nuevos: " . (int) $semilla . "\n";

if (tableExists($conn, 'v2_cronograma_celdas') && !columnExists($conn, 'v2_cronograma_celdas', 'cantidad')) {
    $conn->exec('ALTER TABLE v2_cronograma_celdas ADD COLUMN cantidad TINYINT UNSIGNED NOT NULL DEFAULT 1 AFTER turno');
    echo "  + columna cantidad\n";
}

if (tableExists($conn, 'v2_cronograma_celdas')) {
    $conn->exec('DROP TEMPORARY TABLE IF EXISTS tmp_celdas_merge');
    $conn->exec(
        'CREATE TEMPORARY TABLE tmp_celdas_merge AS
         SELECT MIN(id) AS keep_id, COUNT(*) AS n
         FROM v2_cronograma_celdas
         GROUP BY cronograma_id, area_id, fecha'
    );
    $conn->exec(
        'UPDATE v2_cronograma_celdas c
         INNER JOIN tmp_celdas_merge t ON c.id = t.keep_id
         SET c.cantidad = t.n
         WHERE t.n > 1'
    );
    $deleted = $conn->exec(
        'DELETE c FROM v2_cronograma_celdas c
         LEFT JOIN tmp_celdas_merge t ON c.id = t.keep_id
         WHERE t.keep_id IS NULL'
    );
    echo "  celdas duplicadas fusionadas, borradas: " . (int) $deleted . "\n";
    if (!indexExists($conn, 'v2_cronograma_celdas', 'uniq_cronograma_area_fecha')) {
        $conn->exec('ALTER TABLE v2_cronograma_celdas ADD UNIQUE KEY uniq_cronograma_area_fecha (cronograma_id, area_id, fecha)');
        echo "  + índice área+fecha\n";
    }
    if (indexExists($conn, 'v2_cronograma_celdas', 'uniq_cronograma_area_fecha_turno')) {
        $conn->exec('ALTER TABLE v2_cronograma_celdas DROP INDEX uniq_cronograma_area_fecha_turno');
        echo "  - índice turno\n";
    }
}

echo "\nMigración cronograma (I-010/I-014) completada.\n";
