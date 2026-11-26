<?php
require_once __DIR__ . '/../controllers/TicketController.php';

$controller = new TicketController();
$method = $_SERVER['REQUEST_METHOD'];
$sub = $request[1] ?? null;

switch ($method) {
    case 'GET':
        if ($sub === 'catalogo') {
            $controller->catalogo();
        } elseif (isset($_GET['codigo']) && ($sub === null || $sub === 'consulta')) {
            $controller->consultar();
        } elseif ($sub === null || $sub === '') {
            $controller->index();
        } elseif (is_numeric($sub)) {
            // detalle no expuesto aparte: la lista interna basta en MVP
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Ruta no encontrada.']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Ruta de tickets inválida.']);
        }
        break;

    case 'POST':
        if ($sub === null || $sub === '') {
            $controller->store();
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Ruta de tickets inválida.']);
        }
        break;

    case 'PUT':
    case 'PATCH':
        if ($sub !== null && is_numeric($sub)) {
            $controller->update((int) $sub);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Falta ID de ticket.']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no soportado.']);
        break;
}
