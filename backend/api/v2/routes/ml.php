<?php
require_once __DIR__ . '/../controllers/MlController.php';

$controller = new MlController();
$method = $_SERVER['REQUEST_METHOD'];

$request = isset($_GET['request']) ? explode('/', trim($_GET['request'], '/')) : [];
$action  = $request[1] ?? null;
$param   = $request[2] ?? null;
$sub     = $request[3] ?? null;

if ($action === 'status' && $method === 'GET') {
    $controller->status();
    v2Detener();
}

if ($action === 'alertas' && $method === 'GET') {
    $controller->alertas();
    v2Detener();
}

if ($action === 'equipos' && $param === 'riesgo' && $method === 'GET') {
    $controller->riesgoInventario();
    v2Detener();
}

if ($action === 'equipos' && is_numeric($param) && $sub === 'riesgo' && $method === 'GET') {
    $controller->riesgoEquipo((int) $param);
    v2Detener();
}

if ($action === 'predict' && $param === 'categoria' && $method === 'POST') {
    $controller->predictCategoria();
    v2Detener();
}

if ($action === 'train' && $method === 'POST') {
    $controller->train();
    v2Detener();
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Ruta ML no encontrada.']);
?>
