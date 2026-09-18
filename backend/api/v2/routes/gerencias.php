<?php
require_once __DIR__ . '/../controllers/GerenciaController.php';

$controller = new GerenciaController();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $controller->index();
        break;
    case 'POST':
        $controller->store();
        break;
    case 'PUT':
    case 'PATCH':
        if (isset($_GET['id'])) {
            $controller->update((int) $_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Falta ID de gerencia para actualizar.']);
        }
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            $controller->destroy((int) $_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Falta ID de gerencia para eliminar.']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no soportado.']);
        break;
}
