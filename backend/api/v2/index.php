<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$request = isset($_GET['request']) ? explode('/', trim($_GET['request'], '/')) : [];
$resource = $request[0] ?? null;

$publicResources = ['auth'];

if (!in_array($resource, $publicResources, true)) {
    require_once __DIR__ . '/middleware/AuthMiddleware.php';
    AuthMiddleware::requireAuth();
}

switch ($resource) {
    case 'equipos':
        require_once 'routes/equipos.php';
        break;

    case 'mantenimientos':
        require_once 'routes/mantenimientos.php';
        break;

    case 'reportes':
        require_once 'controllers/ReporteController.php';
        $controller = new ReporteController();
        if (isset($request[1]) && $request[1] === 'equipo' && isset($request[2])) {
            $controller->ficha_tecnica($request[2]);
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Ruta de reporte inválida."]);
        }
        break;

    case 'areas':
        require_once 'routes/areas.php';
        break;

    case 'usuarios':
        require_once 'routes/usuarios.php';
        break;

    case 'fichas-tecnicas':
        require_once 'routes/fichas_tecnicas.php';
        break;

    case 'dashboard':
        require_once 'routes/dashboard.php';
        break;

    case 'auth':
        require_once 'routes/auth.php';
        break;

    default:
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Ruta no encontrada en la API V2."]);
        break;
}
?>
