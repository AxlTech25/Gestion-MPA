<?php
require_once __DIR__ . '/../api/v2/config/Database.php';

$database = new Database();
$conn = $database->getConnection();

$conn->exec("CREATE TABLE IF NOT EXISTS v2_catalogo_ficha (
  id INT PRIMARY KEY AUTO_INCREMENT,
  categoria ENUM('procesador','sistema_operativo','software','tipo_impresora') NOT NULL,
  valor VARCHAR(120) NOT NULL,
  es_predefinido TINYINT(1) NOT NULL DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_catalogo_ficha (categoria, valor),
  INDEX (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$col = $conn->query("SHOW COLUMNS FROM v2_equipos LIKE 'tipo_impresora'");
if ($col->rowCount() === 0) {
    $conn->exec('ALTER TABLE v2_equipos ADD COLUMN tipo_impresora VARCHAR(80) NULL AFTER tipo_equipo');
    echo "Columna tipo_impresora añadida.\n";
} else {
    echo "Columna tipo_impresora ya existe.\n";
}

$semillas = [
    'procesador' => [
        'Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9',
        'Intel Core Ultra 5', 'Intel Core Ultra 7', 'Intel Core Ultra 9',
        'Intel Xeon', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9',
        'Apple M1', 'Apple M2', 'Apple M3', 'Apple M4',
    ],
    'sistema_operativo' => [
        'Windows 7', 'Windows 8', 'Windows 8.1', 'Windows 10', 'Windows 11',
        'Linux', 'macOS',
    ],
    'software' => [
        'Microsoft Office 2016', 'Microsoft Office 2019', 'Microsoft Office 2021',
        'Microsoft Office 2024', 'LibreOffice', 'Antivirus',
        'Google Chrome', 'Mozilla Firefox',
    ],
    'tipo_impresora' => [
        'Impresora matricial (80 col)', 'Impresora matricial (240 col)',
        'Impresora de inyección', 'Impresora láser', 'Impresora térmica',
        'Equipo multifuncional', 'Plotter', 'Fotocopiadora',
    ],
];

$insert = $conn->prepare(
    'INSERT IGNORE INTO v2_catalogo_ficha (categoria, valor, es_predefinido) VALUES (:categoria, :valor, 1)'
);
foreach ($semillas as $categoria => $valores) {
    foreach ($valores as $valor) {
        $insert->execute(['categoria' => $categoria, 'valor' => $valor]);
    }
}

$recuperar = [
    'procesador' => 'SELECT DISTINCT procesador FROM v2_fichas_tecnicas WHERE procesador IS NOT NULL AND TRIM(procesador) <> \'\'',
    'sistema_operativo' => 'SELECT DISTINCT sistema_operativo FROM v2_fichas_tecnicas WHERE sistema_operativo IS NOT NULL AND TRIM(sistema_operativo) <> \'\'',
    'software' => null,
    'tipo_impresora' => 'SELECT DISTINCT tipo_impresora FROM v2_equipos WHERE tipo_impresora IS NOT NULL AND TRIM(tipo_impresora) <> \'\'',
];

$insertLibre = $conn->prepare(
    'INSERT IGNORE INTO v2_catalogo_ficha (categoria, valor, es_predefinido) VALUES (:categoria, :valor, 0)'
);
foreach ($recuperar as $categoria => $sql) {
    if ($sql === null) {
        continue;
    }
    foreach ($conn->query($sql)->fetchAll(PDO::FETCH_COLUMN) as $valor) {
        $texto = trim((string) $valor);
        if ($texto === '') {
            continue;
        }
        $insertLibre->execute(['categoria' => $categoria, 'valor' => $texto]);
    }
}

foreach ($conn->query(
    "SELECT software_base FROM v2_fichas_tecnicas WHERE software_base IS NOT NULL AND TRIM(software_base) <> ''"
)->fetchAll(PDO::FETCH_COLUMN) as $bloque) {
    foreach (preg_split('/\s*\|\s*|\r\n|\n|\r/', (string) $bloque) as $parte) {
        $texto = trim($parte);
        if ($texto === '') {
            continue;
        }
        $insertLibre->execute(['categoria' => 'software', 'valor' => $texto]);
    }
}

$total = (int) $conn->query('SELECT COUNT(*) FROM v2_catalogo_ficha')->fetchColumn();
echo "Catálogo de ficha listo ({$total} valores).\n";
