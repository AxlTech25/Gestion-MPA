<?php
/**
 * Aplica esquema (si hace falta) + seed demo con pocos equipos.
 *
 * Uso:
 *   php backend/tools/seed_demo.php
 *   php backend/tools/seed_demo.php --force   # reescribe el seed aunque ya haya equipos
 *
 * Requiere DB_* / MYSQL* o local.php apuntando a la BD destino.
 */
require_once __DIR__ . '/../api/v2/config/Database.php';

$force = in_array('--force', $argv, true);
$conn = (new Database())->getConnection();

function tableExists(PDO $conn, string $name): bool {
    $stmt = $conn->prepare(
        'SELECT COUNT(*) FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :n'
    );
    $stmt->execute([':n' => $name]);
    return (int) $stmt->fetchColumn() > 0;
}

function runSqlFile(PDO $conn, string $path): void {
    if (!is_file($path)) {
        throw new RuntimeException("No existe: {$path}");
    }
    $sql = file_get_contents($path);
    if ($sql === false || trim($sql) === '') {
        throw new RuntimeException("SQL vacío: {$path}");
    }
    // Quitar comentarios de línea -- ...
    $lines = preg_split("/\r\n|\n|\r/", $sql) ?: [];
    $buf = '';
    foreach ($lines as $line) {
        if (preg_match('/^\s*--/', $line)) {
            continue;
        }
        $buf .= $line . "\n";
    }
    $stmts = array_filter(array_map('trim', explode(';', $buf)));
    foreach ($stmts as $stmtSql) {
        if ($stmtSql === '') {
            continue;
        }
        $conn->exec($stmtSql);
    }
}

echo "=== Seed demo Sigemad ===\n";

if (!tableExists($conn, 'v2_equipos')) {
    echo "Aplicando v2_estructura.sql (omitidos CREATE/USE DATABASE)...\n";
    $estructura = file_get_contents(__DIR__ . '/../sql/v2_estructura.sql');
    if ($estructura === false) {
        throw new RuntimeException('No se pudo leer v2_estructura.sql');
    }
    $estructura = preg_replace('/^CREATE DATABASE.*$/mi', '', $estructura) ?? $estructura;
    $estructura = preg_replace('/^USE\s+\w+\s*;?\s*$/mi', '', $estructura) ?? $estructura;
    $tmp = sys_get_temp_dir() . '/v2_estructura_seed_' . getmypid() . '.sql';
    file_put_contents($tmp, $estructura);
    try {
        runSqlFile($conn, $tmp);
    } finally {
        @unlink($tmp);
    }
}

if (!tableExists($conn, 'v2_tickets')) {
    echo "Aplicando v2_tickets.sql...\n";
    runSqlFile($conn, __DIR__ . '/../sql/v2_tickets.sql');
}

$count = (int) $conn->query('SELECT COUNT(*) FROM v2_equipos')->fetchColumn();
if ($count > 0 && !$force) {
    echo "Ya hay {$count} equipo(s). Use --force para reaplicar el seed demo.\n";
    exit(0);
}

echo "Aplicando v2_seed_demo.sql...\n";
runSqlFile($conn, __DIR__ . '/../sql/v2_seed_demo.sql');

$equipos = (int) $conn->query('SELECT COUNT(*) FROM v2_equipos')->fetchColumn();
$tickets = (int) $conn->query('SELECT COUNT(*) FROM v2_tickets')->fetchColumn();
echo "Listo: {$equipos} equipos, {$tickets} tickets demo.\n";
echo "Login demo: admin / DemoMPA2026!Segura  (y tecnico / misma clave).\n";
echo "Rote estas claves tras el deploy si el entorno es público.\n";
