<?php
include_once '../config/db.php';

$sql = "SELECT 
            e.id, 
            e.codigo_patrimonial, 
            e.codigo_identificativo, 
            e.tipo_equipo AS denominacion, 
            e.tipo_equipo, 
            e.marca, 
            e.modelo, 
            e.numero_serie AS serie, 
            '' AS color, 
            '' AS procesador, 
            CONCAT(e.ram_gb, ' GB') AS ram, 
            CONCAT(e.almacenamiento_gb, ' GB') AS disco_duro, 
            '' AS tipo_impresion, 
            '' AS sistema_operativo, 
            '' AS software_instalado, 
            a.nombre AS area_asignada, 
            u.nombre_completo AS responsable_asignado, 
            e.estado_conservacion, 
            e.estado_operativo, 
            e.fecha_registro
        FROM v2_equipos e
        LEFT JOIN v2_areas a ON e.area_id = a.id
        LEFT JOIN v2_usuarios u ON e.responsable_id = u.id
        ORDER BY e.fecha_registro DESC";
$resultado = $conn->query($sql);

$equipos = [];

if ($resultado && $resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        $equipos[] = $row;
    }
}

echo json_encode($equipos);
$conn->close();
?>