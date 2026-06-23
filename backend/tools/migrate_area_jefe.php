<?php
require_once __DIR__ . '/../api/v2/config/Database.php';

$database = new Database();
$conn = $database->getConnection();

$check = $conn->query("SHOW COLUMNS FROM v2_areas LIKE 'jefe_encargado'");
if ($check->rowCount() === 0) {
    $conn->exec("ALTER TABLE v2_areas ADD COLUMN jefe_encargado VARCHAR(100) NULL AFTER nombre");
    echo "Columna 'jefe_encargado' añadida a v2_areas.\n";
} else {
    echo "Columna 'jefe_encargado' ya existe.\n";
}

echo "Migración completada.\n";
