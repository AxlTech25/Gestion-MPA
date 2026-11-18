<?php
require_once __DIR__ . '/../api/v2/config/Database.php';

$database = new Database();
$conn = $database->getConnection();

$columns = [
    'funcionamiento' => "VARCHAR(20) NULL AFTER conclusion_motivo",
    'obsolescencia_tecnologica' => "VARCHAR(2) NULL AFTER funcionamiento",
    'repuestos_disponibles' => "VARCHAR(2) NULL AFTER obsolescencia_tecnologica",
    'resultado_evaluacion' => "VARCHAR(80) NULL AFTER repuestos_disponibles",
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

echo "Migración de hoja de revisión completada.\n";
