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
    exit;
}

if ($action === 'alertas' && $method === 'GET') {
    $controller->alertas();
    exit;
}

if ($action === 'equipos' && $param === 'riesgo' && $method === 'GET') {
    $controller->riesgoInventario();
    exit;
}

if ($action === 'equipos' && is_numeric($param) && $sub === 'riesgo' && $method === 'GET') {
    $controller->riesgoEquipo((int) $param);
    exit;
}

if ($action === 'predict' && $param === 'categoria' && $method === 'POST') {
    $controller->predictCategoria();
    exit;
}

if ($action === 'train' && $method === 'POST') {
    $controller->train();
    exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Ruta ML no encontrada.']);
?>
