<?php
$host = "localhost";
$db   = "gestion_equipos_mpa_v2";
try {
    $conn = new PDO("mysql:host=$host;dbname=$db", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Cambiar tipo_equipo de ENUM a VARCHAR(100) para aceptar valores personalizados
    $conn->exec("ALTER TABLE v2_equipos MODIFY COLUMN tipo_equipo VARCHAR(100) NOT NULL");
    echo "OK: tipo_equipo cambiado a VARCHAR(100) exitosamente.";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
