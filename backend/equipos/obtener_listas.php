<?php
include_once '../config/db.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$response = [
    "areas" => [],
    "personal" => []
];

// 1. Obtener Áreas
$resAreas = $conn->query("SELECT id, nombre FROM v2_areas ORDER BY nombre ASC");
if ($resAreas && $resAreas->num_rows > 0) {
    while($row = $resAreas->fetch_assoc()) {
        $response["areas"][] = $row;
    }
}

// 2. Obtener Personal (Responsables)
$resPersonal = $conn->query("SELECT id, nombre_completo as nombre, area_id FROM v2_usuarios ORDER BY nombre_completo ASC");
if ($resPersonal && $resPersonal->num_rows > 0) {
    while($row = $resPersonal->fetch_assoc()) {
        $response["personal"][] = $row;
    }
}

echo json_encode($response);
$conn->close();
?>