<?php
include_once '../config/db.php';

// Obtener los datos enviados por React
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No se recibieron datos"]);
    exit;
}

// Escapar datos para evitar inyecciones SQL
$cod_patrimonial = $conn->real_escape_string($data['codigo_patrimonial']);
$tipo_equipo = $conn->real_escape_string($data['tipo_equipo']);
$area = $conn->real_escape_string($data['area_asignada']);
$os = isset($data['sistema_operativo']) ? $conn->real_escape_string($data['sistema_operativo']) : null;
$software = isset($data['software_instalado']) ? $conn->real_escape_string($data['software_instalado']) : '';
$procesador = isset($data['procesador']) ? $conn->real_escape_string($data['procesador']) : null;
$ram = isset($data['ram']) ? $conn->real_escape_string($data['ram']) : null;
$t_impresion = isset($data['tipo_impresion']) ? $conn->real_escape_string($data['tipo_impresion']) : null;

$sql = "INSERT INTO equipos (
            codigo_patrimonial, 
            tipo_equipo, 
            area_asignada, 
            sistema_operativo, 
            software_instalado, 
            procesador, 
            ram, 
            tipo_impresion
        ) VALUES (
            '$cod_patrimonial', 
            '$tipo_equipo', 
            '$area', 
            '$os', 
            '$software', 
            '$procesador', 
            '$ram', 
            '$t_impresion'
        )";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success", "message" => "Equipo registrado correctamente"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error: " . $conn->error]);
}

$conn->close();
?>