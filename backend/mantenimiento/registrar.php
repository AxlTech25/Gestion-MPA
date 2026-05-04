<?php
include_once '../config/db.php';

$codigo = $_POST['codigo_patrimonial'];
$diag = $_POST['diagnostico'];
$estado_f = $_POST['estado_final'];
$upload_dir = "../uploads/mantenimientos/";

if (!file_exists($upload_dir)) { mkdir($upload_dir, 0777, true); }

// Función para procesar y renombrar imagen
function subirYRenombrar($file, $codigo, $sufijo, $dir) {
    if (!$file) return null;
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $nuevo_nombre = "EQ-" . $codigo . "-" . $sufijo . "." . $ext;
    $ruta_destino = $dir . $nuevo_nombre;
    move_uploaded_file($file['tmp_name'], $ruta_destino);
    return $ruta_destino;
}

$ruta_antes = subirYRenombrar($_FILES['foto_antes'] ?? null, $codigo, "ANTES", $upload_dir);
$ruta_despues = subirYRenombrar($_FILES['foto_despues'] ?? null, $codigo, "DESPUES", $upload_dir);

// 1. Insertar en Historial de Fichas
$nro = "ORD-V1-" . date("YmdHis");
$sql_ficha = "INSERT INTO v2_fichas_mantenimiento (nro_orden, equipo_id, fecha_intervencion, tecnico_id, tipo_mantenimiento, categoria_falla_id, diagnostico_texto, foto_antes, foto_despues, estado_post_mantenimiento) 
              SELECT '$nro', id, NOW(), 1, 'Correctivo', 1, '$diag', '$ruta_antes', '$ruta_despues', '$estado_f' FROM v2_equipos WHERE codigo_patrimonial = '$codigo'";

// 2. Actualizar estado actual en tabla Equipos
$sql_update = "UPDATE v2_equipos SET estado_operativo = '$estado_f' WHERE codigo_patrimonial = '$codigo'";

if ($conn->query($sql_ficha) && $conn->query($sql_update)) {
    echo json_encode(["status" => "success", "message" => "Mantenimiento guardado y estado actualizado"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al procesar: " . $conn->error]);
}
?>