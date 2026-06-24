<?php
require_once __DIR__ . '/../controllers/EquipoController.php';

$controller = new EquipoController();
$method     = $_SERVER['REQUEST_METHOD'];

$request = isset($_GET['request']) ? explode('/', trim($_GET['request'], '/')) : [];
$action  = $request[1] ?? null;

if ($action === 'plantilla' && $method === 'GET') {
    $controller->descargarPlantilla();
    exit;
}

if ($action === 'carga-masiva' && $method === 'POST') {
    $controller->cargaMasiva();
    exit;
}

if ($action !== null && is_numeric($action)) {
    $id = (int) $action;
    switch ($method) {
        case 'GET':
            $controller->show($id);
            break;
        case 'PUT':
            $controller->update($id);
            break;
        default:
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
    case 'DELETE':
        http_response_code(501);
        echo json_encode(["success" => false, "message" => "Eliminación no implementada."]);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método HTTP no soportado."]);
}
