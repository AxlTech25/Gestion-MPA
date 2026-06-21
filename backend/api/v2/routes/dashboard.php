<?php
require_once __DIR__ . '/../controllers/DashboardController.php';

$controller = new DashboardController();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $controller->resumen();
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método HTTP no soportado."]);
}
?>
