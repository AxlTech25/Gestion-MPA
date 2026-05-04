<?php
include_once '../config/db.php';

// Consulta para contar equipos según su estado operativo
$sql = "SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN estado_operativo = 'Operativo' THEN 1 ELSE 0 END) as operativo,
            SUM(CASE WHEN estado_operativo = 'Dañado' THEN 1 ELSE 0 END) as danado,
            SUM(CASE WHEN estado_operativo = 'Excedencia' THEN 1 ELSE 0 END) as excedencia
        FROM v2_equipos";

$result = $conn->query($sql);
$resumen = $result->fetch_assoc();

echo json_encode($resumen);
$conn->close();
?>