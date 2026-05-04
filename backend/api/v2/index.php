<?php
// Manejo estricto de CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enrutador Front-Controller
$request = isset($_GET['request']) ? explode('/', trim($_GET['request'], '/')) : [];
$resource = $request[0] ?? null;

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
        if (isset($path[3]) && $path[3] === 'equipo' && isset($path[4])) {
            $controller->ficha_tecnica($path[4]);
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

        
    case 'auth':
        // require_once 'routes/auth.php';
        echo json_encode(["success" => true, "message" => "Endpoint V2: Auth (En construcción)"]);
        break;
        
    default:
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Ruta no encontrada en la API V2."]);
        break;
}
?>
