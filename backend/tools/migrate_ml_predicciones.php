<?php
require_once __DIR__ . '/../api/v2/config/Database.php';

$sql = file_get_contents(__DIR__ . '/../sql/v2_ml_predicciones.sql');
$sql = preg_replace('/^USE\s+\w+;\s*/mi', '', $sql);

$db = new Database();
$conn = $db->getConnection();
$conn->exec($sql);
echo "Migración v2_predicciones_ml OK\n";
