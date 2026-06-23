<?php
/**
 * Restablece la contraseña de un usuario V2.
 * Uso: php backend/tools/reset_password.php <usuario> <nueva_contraseña>
 */
require_once __DIR__ . '/../api/v2/config/Database.php';

if ($argc < 3) {
    echo "Uso: php reset_password.php <usuario> <nueva_contraseña>\n";
    echo "Ejemplo: php reset_password.php admin admin123\n";
    exit(1);
}

$usuario = $argv[1];
$password = $argv[2];
$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $database = new Database();
    $conn = $database->getConnection();

    $stmt = $conn->prepare("UPDATE v2_usuarios SET password_hash = :hash WHERE usuario = :usuario");
    $stmt->execute([':hash' => $hash, ':usuario' => $usuario]);

    if ($stmt->rowCount() === 0) {
        echo "No se encontró el usuario '{$usuario}'.\n";
        echo "Usuarios disponibles:\n";
        foreach ($conn->query("SELECT usuario, rol FROM v2_usuarios") as $row) {
            echo "  - {$row['usuario']} ({$row['rol']})\n";
        }
        exit(1);
    }

    echo "Contraseña actualizada para '{$usuario}'.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
