<?php
require_once __DIR__ . '/../controllers/AreaController.php';

$controller = new AreaController();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $controller->index();
        break;
    case 'POST':
        $controller->store();
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no soportado."]);
        break;
}
?>
