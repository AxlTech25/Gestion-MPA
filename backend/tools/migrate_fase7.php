<?php
/**
 * Migración Sprint 7 Fase 1 — compatible MySQL 5.7+ / MariaDB
 * Ejecutar: php backend/tools/migrate_fase7.php
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

function addColumn(PDO $conn, string $table, string $definition): void {
    $conn->exec("ALTER TABLE {$table} ADD COLUMN {$definition}");
    echo "  + {$table}: columna añadida\n";
}

$equiposColumns = [
    "horas_uso INT NOT NULL DEFAULT 0 COMMENT 'Horas de uso acumuladas'",
    "errores_smart INT NOT NULL DEFAULT 0 COMMENT 'Conteo errores SMART'",
    "contador_paginas INT NULL DEFAULT NULL COMMENT 'Páginas impresas'",
    "salud_bateria DECIMAL(5,2) NULL DEFAULT NULL COMMENT 'Salud batería %'",
    "ultima_temp_cpu DECIMAL(5,2) NULL DEFAULT NULL COMMENT 'Temp CPU °C'",
    "ultima_temp_disco DECIMAL(5,2) NULL DEFAULT NULL COMMENT 'Temp disco °C'",
    "fecha_ultimo_mantenimiento DATE NULL DEFAULT NULL COMMENT 'Última intervención'",
];

$mantColumns = [
    "sintoma_usuario TEXT NULL COMMENT 'Reporte usuario'",
    "causa_raiz VARCHAR(150) NULL DEFAULT NULL COMMENT 'Causa raíz'",
    "componente_principal VARCHAR(100) NULL DEFAULT NULL COMMENT 'Componente afectado'",
    "nivel_polvo ENUM('Bajo','Medio','Alto','Critico') NULL DEFAULT NULL COMMENT 'Nivel polvo'",
    "temperatura_cpu DECIMAL(5,2) NULL DEFAULT NULL COMMENT 'Temp CPU intervención'",
    "temperatura_disco DECIMAL(5,2) NULL DEFAULT NULL COMMENT 'Temp disco intervención'",
    "horas_uso_acumuladas INT NULL DEFAULT NULL COMMENT 'Horas uso al momento'",
    "salud_bateria_pct DECIMAL(5,2) NULL DEFAULT NULL COMMENT 'Batería % al momento'",
    "contador_paginas_lectura INT NULL DEFAULT NULL COMMENT 'Páginas al momento'",
    "tiempo_inactividad_min INT NOT NULL DEFAULT 0 COMMENT 'Minutos inactividad'",
];

echo "=== Migración Sprint 7 Fase 1 ===\n\n";

echo "v2_equipos:\n";
foreach ($equiposColumns as $def) {
    $name = explode(' ', $def)[0];
    if (columnExists($conn, 'v2_equipos', $name)) {
        echo "  = {$name} ya existe\n";
    } else {
        addColumn($conn, 'v2_equipos', $def);
    }
}

echo "\nv2_fichas_mantenimiento:\n";
foreach ($mantColumns as $def) {
    $name = explode(' ', $def)[0];
    if (columnExists($conn, 'v2_fichas_mantenimiento', $name)) {
        echo "  = {$name} ya existe\n";
    } else {
        addColumn($conn, 'v2_fichas_mantenimiento', $def);
    }
}

echo "\nActualizando ENUMs...\n";
try {
    $conn->exec("ALTER TABLE v2_equipos MODIFY COLUMN estado_operativo
        ENUM('Operativo', 'Dañado', 'En Reparacion', 'Excedencia', 'Baja') NOT NULL DEFAULT 'Operativo'");
    echo "  + v2_equipos.estado_operativo\n";
} catch (PDOException $e) {
    echo "  ! estado_operativo: " . $e->getMessage() . "\n";
}

try {
    $conn->exec("ALTER TABLE v2_fichas_mantenimiento MODIFY COLUMN tipo_mantenimiento
        ENUM('Preventivo', 'Correctivo', 'Predictivo', 'Evaluacion') NOT NULL");
    echo "  + v2_fichas_mantenimiento.tipo_mantenimiento\n";
} catch (PDOException $e) {
    echo "  ! tipo_mantenimiento: " . $e->getMessage() . "\n";
}

echo "\nMigración Fase 7 completada.\n";
