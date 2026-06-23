<?php
require_once __DIR__ . '/../controllers/FichaTecnicaController.php';

$controller = new FichaTecnicaController();
$method     = $_SERVER['REQUEST_METHOD'];

$request = isset($_GET['request']) ? explode('/', trim($_GET['request'], '/')) : [];
// $request[0] = fichas-tecnicas, $request[1] = id | buscar, $request[2] = codigo (si buscar)

$segment = $request[1] ?? null;

if ($segment === 'buscar') {
    $codigo = $request[2] ?? null;
    if (!$codigo) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Código patrimonial requerido."]);
        exit;
    }
    if ($method === 'GET') {
        $controller->searchByCodigo($codigo);
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido."]);
    }
    exit;
}

$equipo_id = $segment;

if (!$equipo_id || !is_numeric($equipo_id)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID de equipo inválido."]);
    exit;
}

switch ($method) {
    case 'GET':
        $controller->show($equipo_id);
        break;
    case 'PUT':
    case 'POST':
        $controller->upsert($equipo_id);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido."]);
}
