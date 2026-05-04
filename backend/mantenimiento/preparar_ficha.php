<?php
include_once '../config/db.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$accion = isset($_GET['accion']) ? $_GET['accion'] : '';

if ($accion === 'get_correlativo') {
    $res = $conn->query("SELECT COUNT(*) as total FROM v2_fichas_mantenimiento");
    if ($res) {
        $row = $res->fetch_assoc();
        $siguiente = $row['total'] + 1;
    } else {
        $siguiente = 1;
    }
    echo json_encode(["nro_orden" => "N° " . str_pad($siguiente, 3, "0", STR_PAD_LEFT)]);
} 

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

elseif ($accion === 'buscar_equipo') {
    $codigo = isset($_GET['codigo']) ? $conn->real_escape_string($_GET['codigo']) : '';
    
    $sql = "SELECT 
                e.id, 
                e.marca, 
                e.modelo, 
                f.procesador, 
                CONCAT(e.ram_gb, ' GB') as ram, 
                CONCAT(e.almacenamiento_gb, ' GB') as disco_duro, 
                f.sistema_operativo, 
                a.nombre as area_asignada, 
                u.nombre_completo as responsable_asignado 
            FROM v2_equipos e
            LEFT JOIN v2_fichas_tecnicas f ON e.id = f.equipo_id
            LEFT JOIN v2_areas a ON e.area_id = a.id
            LEFT JOIN v2_usuarios u ON e.responsable_id = u.id
            WHERE e.codigo_patrimonial = '$codigo' LIMIT 1";
    
    $res = $conn->query($sql);
    
    if ($res && $res->num_rows > 0) {
        echo json_encode($res->fetch_assoc());
    } else {
        echo json_encode(null);
    }
}
?>