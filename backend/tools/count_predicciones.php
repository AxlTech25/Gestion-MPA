<?php
require_once __DIR__ . '/../api/v2/config/Database.php';
$db = new Database();
$c = $db->getConnection();
echo 'predicciones: ' . $c->query('SELECT COUNT(*) FROM v2_predicciones_ml')->fetchColumn() . PHP_EOL;
echo 'equipos distintos: ' . $c->query('SELECT COUNT(DISTINCT equipo_id) FROM v2_predicciones_ml')->fetchColumn() . PHP_EOL;
