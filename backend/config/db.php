<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "gestion_equipos_mpa_v2";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Conexión fallida"]));
}

// Configuración de CORS para permitir peticiones desde React (Vite usa el puerto 5173 por defecto)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
?>