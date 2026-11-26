<?php
/**
 * Carga one-shot del seed simulado. Requiere SEED_ONCE_TOKEN.
 * Eliminar tras usarlo.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$expected = getenv('SEED_ONCE_TOKEN');
$given = $_GET['token'] ?? ($_SERVER['HTTP_X_SEED_TOKEN'] ?? '');

if (!is_string($expected) || $expected === '' || !is_string($given) || !hash_equals($expected, $given)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'not_found']);
    exit;
}

require_once __DIR__ . '/config/Database.php';

function seed_table_exists(PDO $conn, string $name): bool {
    $stmt = $conn->prepare(
        'SELECT COUNT(*) FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :n'
    );
    $stmt->execute([':n' => $name]);
    return (int) $stmt->fetchColumn() > 0;
}

function seed_run_sql_file(PDO $conn, string $path): void {
    $sql = file_get_contents($path);
    if ($sql === false || trim($sql) === '') {
        throw new RuntimeException("SQL vacío: {$path}");
    }
    $lines = preg_split("/\r\n|\n|\r/", $sql) ?: [];
    $buf = '';
    foreach ($lines as $line) {
        if (preg_match('/^\s*--/', $line)) {
            continue;
        }
        $buf .= $line . "\n";
    }
    foreach (array_filter(array_map('trim', explode(';', $buf))) as $stmtSql) {
        if ($stmtSql === '') {
            continue;
        }
        $conn->exec($stmtSql);
    }
}

try {
    $conn = (new Database())->getConnection();
    $sqlDir = dirname(__DIR__, 2) . '/sql';
    $conn->exec('SET FOREIGN_KEY_CHECKS=0');

    if (!seed_table_exists($conn, 'v2_equipos')) {
        $tables = $conn->query(
            "SELECT TABLE_NAME FROM information_schema.TABLES
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME LIKE 'v2\\_%'"
        )->fetchAll(PDO::FETCH_COLUMN);
        foreach ($tables as $t) {
            $conn->exec('DROP TABLE IF EXISTS `' . str_replace('`', '``', (string) $t) . '`');
        }

        $estructura = file_get_contents($sqlDir . '/v2_estructura.sql');
        if ($estructura === false) {
            throw new RuntimeException('No se pudo leer v2_estructura.sql');
        }
        $estructura = preg_replace('/^CREATE DATABASE.*$/mi', '', $estructura) ?? $estructura;
        $estructura = preg_replace('/^USE\s+\w+\s*;?\s*$/mi', '', $estructura) ?? $estructura;

        $blocks = [];
        if (preg_match_all('/CREATE TABLE IF NOT EXISTS\s+(\w+)\s*\((?:[^;]|\n)*?\)\s*ENGINE=InnoDB[^;]*;/is', $estructura, $m)) {
            foreach ($m[0] as $i => $ddl) {
                $blocks[$m[1][$i]] = $ddl;
            }
        }
        foreach (['v2_gerencias', 'v2_areas', 'v2_usuarios', 'v2_equipos'] as $table) {
            if (isset($blocks[$table])) {
                $conn->exec($blocks[$table]);
                unset($blocks[$table]);
            }
        }
        foreach ($blocks as $ddl) {
            $conn->exec($ddl);
        }

        $resto = preg_replace('/CREATE TABLE IF NOT EXISTS\s+\w+\s*\((?:[^;]|\n)*?\)\s*ENGINE=InnoDB[^;]*;/is', '', $estructura) ?? $estructura;
        $tmp = sys_get_temp_dir() . '/v2_estructura_resto_' . getmypid() . '.sql';
        file_put_contents($tmp, $resto);
        try {
            seed_run_sql_file($conn, $tmp);
        } finally {
            @unlink($tmp);
        }
    }

    if (!seed_table_exists($conn, 'v2_tickets')) {
        seed_run_sql_file($conn, $sqlDir . '/v2_tickets.sql');
    }

    seed_run_sql_file($conn, $sqlDir . '/v2_seed_demo.sql');
    $conn->exec('SET FOREIGN_KEY_CHECKS=1');

    echo json_encode([
        'success' => true,
        'equipos' => (int) $conn->query('SELECT COUNT(*) FROM v2_equipos')->fetchColumn(),
        'fichas_tecnicas' => (int) $conn->query('SELECT COUNT(*) FROM v2_fichas_tecnicas')->fetchColumn(),
        'mantenimientos' => (int) $conn->query('SELECT COUNT(*) FROM v2_fichas_mantenimiento')->fetchColumn(),
        'usuarios' => (int) $conn->query('SELECT COUNT(*) FROM v2_usuarios')->fetchColumn(),
        'areas' => (int) $conn->query('SELECT COUNT(*) FROM v2_areas')->fetchColumn(),
        'tickets' => (int) $conn->query('SELECT COUNT(*) FROM v2_tickets')->fetchColumn(),
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    try {
        if (isset($conn) && $conn instanceof PDO) {
            $conn->exec('SET FOREIGN_KEY_CHECKS=1');
        }
    } catch (Throwable $ignored) {
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'seed_failed',
        'message' => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
}
