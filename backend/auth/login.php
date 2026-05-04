<?php
include_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$usuario = $conn->real_escape_string($data['usuario']);
$password = $data['password'];

$sql = "SELECT id, nombre_completo, rol, password_hash FROM v2_usuarios WHERE usuario = '$usuario'";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();
    // Usar password_verify ya que la DB V2 usa BCRYPT
    if (password_verify($password, $user['password_hash'])) {
        echo json_encode([
            "status" => "success",
            "user" => [
                "id" => $user['id'],
                "nombre" => $user['nombre_completo'],
                "rol" => $user['rol']
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Contraseña incorrecta"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Usuario no encontrado"]);
}
?>