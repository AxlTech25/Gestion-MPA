<?php
require_once __DIR__ . '/../controllers/MantenimientoController.php';

$controller = new MantenimientoController();
$method     = $_SERVER['REQUEST_METHOD'];

$request = isset($_GET['request']) ? explode('/', trim($_GET['request'], '/')) : [];
$segment = $request[1] ?? null;

if ($segment === 'historial') {
    $codigo = $request[2] ?? null;
    if (!$codigo) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Código patrimonial requerido."]);
        exit;
    }
    if ($method === 'GET') {
        $controller->historialByCodigo($codigo);
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido."]);
    }
    exit;
}

if ($segment !== null && is_numeric($segment)) {
    if ($method === 'GET') {
        $controller->show((int) $segment);
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido."]);
    }
    exit;
}

switch ($method) {
    case 'GET':
        $controller->index();
        break;
    case 'POST':
        $controller->store();
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método HTTP no soportado."]);
        break;
}
?>
