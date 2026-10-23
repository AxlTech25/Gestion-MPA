<?php
require_once __DIR__ . '/../controllers/CronogramaController.php';

$controller = new CronogramaController();
$method = $_SERVER['REQUEST_METHOD'];

$request = isset($_GET['request']) ? explode('/', trim($_GET['request'], '/')) : [];
$id = isset($request[1]) && is_numeric($request[1]) ? (int) $request[1] : null;
$action = $request[2] ?? null;
$celdaId = isset($request[3]) && is_numeric($request[3]) ? (int) $request[3] : null;

if ($id === null) {
    if ($method === 'GET') {
        $controller->index();
    } elseif ($method === 'POST') {
        $controller->store();
    } else {
        $controller->metodoNoPermitido();
    }
    v2Detener();
}

if ($action === 'cobertura') {
    if ($method === 'GET') {
        $controller->cobertura($id);
    } else {
        $controller->metodoNoPermitido();
    }
    v2Detener();
}

if ($action === 'personal') {
    if ($method === 'PUT') {
        $controller->storePersonal($id);
    } else {
        $controller->metodoNoPermitido();
    }
    v2Detener();
}

if ($action === 'celdas') {
    if ($celdaId !== null) {
        $sub = $request[4] ?? null;
        if ($sub === 'horarios') {
            if ($method === 'PUT') {
                $controller->storeHorarios($id, $celdaId);
            } else {
                $controller->metodoNoPermitido();
            }
            v2Detener();
        }
        if ($method === 'DELETE') {
            $controller->destroyCelda($id, $celdaId);
        } else {
            $controller->metodoNoPermitido();
        }
        v2Detener();
    }
    if ($method === 'POST') {
        $controller->storeCelda($id);
    } else {
        $controller->metodoNoPermitido();
    }
    v2Detener();
}

if ($action === null) {
    if ($method === 'GET') {
        $controller->show($id);
    } elseif ($method === 'DELETE') {
        $controller->destroy($id);
    } else {
        $controller->metodoNoPermitido();
    }
    v2Detener();
}

http_response_code(404);
echo json_encode(["success" => false, "message" => "Ruta de cronograma no encontrada."]);
