<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Jwt.php';

use Firebase\JWT\JWT;

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->usuario) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Usuario y contraseña son obligatorios."]);
    exit;
}

try {
    $database = new Database();
    $conn = $database->getConnection();

    $stmt = $conn->prepare("SELECT id, nombre_completo, usuario, password_hash, rol FROM v2_usuarios WHERE usuario = :usuario LIMIT 1");
    $stmt->bindParam(":usuario", $data->usuario);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Credenciales incorrectas."]);
        exit;
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!password_verify($data->password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Credenciales incorrectas."]);
        exit;
    }

    unset($user['password_hash']);

    $now = time();
    $payload = [
        'iss'  => 'gestion_mpa_api',
        'iat'  => $now,
        'exp'  => $now + JwtConfig::getExpirationSeconds(),
        'sub'  => (int) $user['id'],
        'rol'  => $user['rol'],
        'user' => $user['usuario'],
    ];

    $token = JWT::encode($payload, JwtConfig::getSecret(), 'HS256');

    echo json_encode([
        "success" => true,
        "message" => "Sesión iniciada correctamente.",
        "user"    => $user,
        "token"   => $token,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de servidor: " . $e->getMessage()]);
}
?>
