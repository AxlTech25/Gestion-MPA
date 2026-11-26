<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Jwt.php';
require_once __DIR__ . '/../security/LoginThrottle.php';

use Firebase\JWT\JWT;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido."]);
    v2Detener();
}

$data = json_decode(v2CuerpoRaw());
$usuario = is_object($data) ? trim((string) ($data->usuario ?? '')) : '';
$password = is_object($data) ? (string) ($data->password ?? '') : '';

if ($usuario === '' || $password === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Usuario y contraseña son obligatorios."]);
    v2Detener();
}

if (strlen($usuario) > 80 || strlen($password) > 200) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Credenciales incorrectas."]);
    v2Detener();
}

$throttle = new LoginThrottle();
$ip = LoginThrottle::clientIp();
$bloqueo = $throttle->inspect($usuario, $ip);
if ($bloqueo['blocked']) {
    http_response_code(429);
    header('Retry-After: ' . (int) $bloqueo['retry_after']);
    echo json_encode([
        "success" => false,
        "message" => $bloqueo['message'],
        "retry_after" => (int) $bloqueo['retry_after'],
    ]);
    v2Detener();
}

// Hash bcrypt válido solo para igualar el tiempo de respuesta si el usuario no existe.
$dummyHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

try {
    $database = new Database();
    $conn = $database->getConnection();

    $stmt = $conn->prepare(
        "SELECT id, nombre_completo, usuario, password_hash, rol
         FROM v2_usuarios WHERE usuario = :usuario LIMIT 1"
    );
    $stmt->bindValue(':usuario', $usuario);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    $hash = is_array($user) ? (string) ($user['password_hash'] ?? '') : $dummyHash;
    if ($hash === '') {
        $hash = $dummyHash;
    }

    $passwordOk = password_verify($password, $hash);
    if (!is_array($user) || !$passwordOk) {
        $throttle->registrarFallo($usuario, $ip);
        $bloqueo = $throttle->inspect($usuario, $ip);
        if ($bloqueo['blocked']) {
            http_response_code(429);
            header('Retry-After: ' . (int) $bloqueo['retry_after']);
            echo json_encode([
                "success" => false,
                "message" => $bloqueo['message'],
                "retry_after" => (int) $bloqueo['retry_after'],
            ]);
            v2Detener();
        }
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Credenciales incorrectas."]);
        v2Detener();
    }

    $throttle->limpiar($usuario, $ip);
    unset($user['password_hash']);

    $now = time();
    $payload = [
        'iss'  => 'gestion_mpa_api',
        'iat'  => $now,
        'nbf'  => $now,
        'exp'  => $now + JwtConfig::getExpirationSeconds(),
        'sub'  => (int) $user['id'],
        'rol'  => $user['rol'],
        'user' => $user['usuario'],
        'nombre_completo' => $user['nombre_completo'],
    ];

    $token = JWT::encode($payload, JwtConfig::getSecret(), 'HS256');

    echo json_encode([
        "success" => true,
        "message" => "Sesión iniciada correctamente.",
        "user"    => $user,
        "token"   => $token,
    ]);
} catch (PDOException $e) {
    error_log('Login error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de servidor. Intente más tarde."]);
}
?>
