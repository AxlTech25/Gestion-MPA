<?php
$conn = new mysqli("localhost", "root", "", "gestion_equipos_mpa");

if ($conn->connect_error) {
    die("Error de conexión");
}

$result = $conn->query("SELECT * FROM usuarios");

while ($row = $result->fetch_assoc()) {
    echo $row["usuario"] . "<br>";
}

error_reporting(E_ALL);
ini_set('display_errors', 1);