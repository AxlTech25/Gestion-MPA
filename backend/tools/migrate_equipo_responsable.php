<?php
require_once __DIR__ . '/../api/v2/config/Database.php';

$database = new Database();
$conn = $database->getConnection();

$check = $conn->query("SHOW COLUMNS FROM v2_equipos LIKE 'responsable_nombre'");
if ($check->rowCount() === 0) {
    $conn->exec("ALTER TABLE v2_equipos ADD COLUMN responsable_nombre VARCHAR(100) NULL AFTER responsable_id");
    echo "Columna 'responsable_nombre' añadida a v2_equipos.\n";
} else {
    echo "Columna 'responsable_nombre' ya existe.\n";
}

echo "Migración completada.\n";
