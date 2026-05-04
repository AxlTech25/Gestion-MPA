<?php
require_once __DIR__ . '/../controllers/EquipoController.php';

$controller = new EquipoController();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $controller->index();
        break;
    case 'POST':
        $controller->store();
        break;
    case 'PUT':
        // TODO
        break;
    case 'DELETE':
        // TODO
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método HTTP no soportado."]);
        break;
}
?>
