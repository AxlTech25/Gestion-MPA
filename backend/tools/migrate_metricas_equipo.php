<?php
/**
 * Crea la tabla v2_metricas_equipo (HU-ML-007).
 * Uso: php backend/tools/migrate_metricas_equipo.php
 */
require_once __DIR__ . '/../api/v2/config/Database.php';

$sqlFile = __DIR__ . '/../sql/v2_metricas_equipo.sql';
if (!file_exists($sqlFile)) {
    fwrite(STDERR, "No se encontró $sqlFile\n");
    exit(1);
}

$db = new Database();
$conn = $db->getConnection();
$sql = file_get_contents($sqlFile);

try {
    $conn->exec($sql);
    echo "OK: v2_metricas_equipo lista.\n";
} catch (PDOException $e) {
    fwrite(STDERR, "Error: " . $e->getMessage() . "\n");
    exit(1);
}
