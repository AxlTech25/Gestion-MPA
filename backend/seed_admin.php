<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "gestion_equipos_mpa_v2";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Crear el Área de Admin si no existe
    $stmt = $conn->prepare("INSERT IGNORE INTO v2_areas (id, nombre, descripcion) VALUES (1, 'Administración de Sistemas', 'Área de control global del sistema')");
    $stmt->execute();

    // 2. Crear usuario admin
    $nombre = "Administrador Global";
    $usuario = "admin";
    $password_clara = "admin123";
    
    // Hash robusto usando BCRYPT (Estándar en PHP)
    $hash = password_hash($password_clara, PASSWORD_DEFAULT);
    
    $rol = "Administrador";
    $area_id = 1;

    // Verificar si ya existe
    $stmt = $conn->prepare("SELECT id FROM v2_usuarios WHERE usuario = ?");
    $stmt->execute([$usuario]);
    if ($stmt->rowCount() == 0) {
        $stmt = $conn->prepare("INSERT INTO v2_usuarios (nombre_completo, usuario, password_hash, rol, area_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$nombre, $usuario, $hash, $rol, $area_id]);
        echo "Usuario administrador creado exitosamente.\nUsuario: admin\nContraseña: admin123\n";
    } else {
        echo "El usuario 'admin' ya existe en la base de datos.\n";
    }

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
