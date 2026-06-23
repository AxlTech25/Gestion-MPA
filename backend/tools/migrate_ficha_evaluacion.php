<?php
require_once __DIR__ . '/../api/v2/config/Database.php';

$database = new Database();
$conn = $database->getConnection();

$columns = [
    'observaciones_evaluacion' => 'TEXT NULL AFTER software_base',
    'fecha_evaluacion'         => 'DATETIME NULL AFTER observaciones_evaluacion',
];

foreach ($columns as $name => $definition) {
    $check = $conn->query("SHOW COLUMNS FROM v2_fichas_tecnicas LIKE '{$name}'");
    if ($check->rowCount() === 0) {
        $conn->exec("ALTER TABLE v2_fichas_tecnicas ADD COLUMN {$name} {$definition}");
        echo "Columna '{$name}' añadida.\n";
    } else {
        echo "Columna '{$name}' ya existe.\n";
    }
}

echo "Migración completada.\n";
