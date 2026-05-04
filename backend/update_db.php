<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "gestion_equipos_mpa_v2";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $conn->exec("ALTER TABLE v2_fichas_mantenimiento ADD COLUMN foto_antes VARCHAR(255) NULL");
    $conn->exec("ALTER TABLE v2_fichas_mantenimiento ADD COLUMN foto_despues VARCHAR(255) NULL");
    echo "Columnas añadidas.";
} catch(PDOException $e) {
    echo "Ya existen las columnas o hubo error: " . $e->getMessage();
}
?>
