<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "gestion_equipos_mpa_v2";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $conn->exec("ALTER TABLE v2_areas ADD COLUMN jefe_encargado VARCHAR(100) NULL AFTER nombre");
    echo "Columna jefe_encargado añadida a v2_areas.";
} catch(PDOException $e) {
    echo "Ya existe la columna o hubo error: " . $e->getMessage();
}
?>
