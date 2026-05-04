<?php
include_once '../config/db.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$equipo_id = isset($_GET['equipo_id']) ? intval($_GET['equipo_id']) : 0;

if ($equipo_id === 0) {
    echo json_encode(["status" => "error", "message" => "ID de equipo no válido"]);
    exit;
}

$response = ["equipo" => null, "historial" => []];

// 1. Datos del equipo
$equipo_query = "SELECT * FROM v2_equipos WHERE id = $equipo_id";
$equipo_res = $conn->query($equipo_query);

if ($equipo_res && $equipo_res->num_rows > 0) {
    $response["equipo"] = $equipo_res->fetch_assoc();
    
    // 2. Historial de mantenimientos
    $historial_query = "SELECT id, fecha_intervencion as fecha_mantenimiento, tipo_mantenimiento as tipo, diagnostico_texto as diagnostico, actividades_realizadas as trabajo_realizado 
                        FROM v2_fichas_mantenimiento 
                        WHERE equipo_id = $equipo_id 
                        ORDER BY fecha_intervencion DESC";
    
    $hist_res = $conn->query($historial_query);
    if ($hist_res && $hist_res->num_rows > 0) {
        while($row = $hist_res->fetch_assoc()) {
            $response["historial"][] = $row;
        }
    }
}

echo json_encode($response);
$conn->close();
?>