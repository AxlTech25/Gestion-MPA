<?php
// Cabeceras de seguridad y CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

include_once '../config/db.php';

// Capturar el cuerpo de la petición JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No se recibieron datos válidos."]);
    exit;
}

// 1. Sanitización de datos para evitar Inyección SQL
$nro_orden = $conn->real_escape_string($data['nro_orden']);
$equipo_id = intval($data['equipo_id']);
$fecha = $conn->real_escape_string($data['fecha']); // Fecha manual desde el frontend
$area = $conn->real_escape_string($data['area']);
$encargado = $conn->real_escape_string($data['encargado']);
$usuario_responsable = $conn->real_escape_string($data['usuario_responsable']);
$tipo_mantenimiento = $conn->real_escape_string($data['tipo_mantenimiento']);

// Serializar periféricos (JSON)
$perifericos = json_encode($data['perifericos']);

// Software
$sw_windows = $conn->real_escape_string($data['sw_windows']);
$sw_office = $conn->real_escape_string($data['sw_office']);
$sw_antivirus = $conn->real_escape_string($data['sw_antivirus']);
$sw_otros = $conn->real_escape_string($data['sw_otros']); // Campo Otros Software

// Diagnóstico
$diagnostico_entrada = $conn->real_escape_string($data['diagnostico_entrada']);
$actividades = $conn->real_escape_string($data['actividades_realizadas']);
$diagnostico_salida = $conn->real_escape_string($data['diagnostico_salida']);
$conclusion = $conn->real_escape_string($data['conclusion']);

$estado = 'Finalizado';

// 2. Consulta de Inserción
$sql = "INSERT INTO fichas_mantenimiento (
            nro_orden, equipo_id, fecha, area, encargado, usuario_responsable, 
            tipo_mantenimiento, perifericos, sw_windows, sw_office, 
            sw_antivirus, sw_otros, diagnostico_entrada, 
            actividades_realizadas, diagnostico_salida, conclusion, estado
        ) VALUES (
            '$nro_orden', $equipo_id, '$fecha', '$area', '$encargado', '$usuario_responsable', 
            '$tipo_mantenimiento', '$perifericos', '$sw_windows', '$sw_office', 
            '$sw_antivirus', '$sw_otros', '$diagnostico_entrada', 
            '$actividades', '$diagnostico_salida', '$conclusion', '$estado'
        )";

if ($conn->query($sql)) {
    echo json_encode([
        "status" => "success", 
        "message" => "Ficha $nro_orden registrada correctamente.",
        "id_ficha" => $conn->insert_id
    ]);
} else {
    echo json_encode([
        "status" => "error", 
        "message" => "Error al insertar en la base de datos: " . $conn->error
    ]);
}

$conn->close();
?>